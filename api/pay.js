import axios from 'axios';
import crypto from 'crypto';
import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import { json, setCors, getBody, normalizeEvent } from './lib/utils.js';

const { Booking } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();

    const fullUrl = req.url || '/';
    const [pathPart, queryPart] = fullUrl.split('?');
    const url = pathPart.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    const method = req.method || 'GET';
    const body = await getBody(req);

    try {
        // -- PhonePe Payment Initiation --
        if (url.includes('/pay') && !url.includes('/payment-callback') && method === 'POST') {
            const { name, amount, phone, eventId, orderId, userId } = body;
            const targetEventId = eventId || orderId;
            const targetUserId = userId || name || "Guest";
            
            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
            
            const txId = "TXN_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
            const host = req.headers.host || "events.parkconscious.in";
            const redirectBase = host.includes('localhost') ? `http://${host}` : `https://events.parkconscious.in`;

            const payload = {
                merchantId: MERCHANT_ID,
                merchantTransactionId: txId,
                merchantUserId: "USER_" + (phone || "GUEST"),
                amount: Math.round(parseFloat(amount) * 100),
                redirectUrl: `${redirectBase}/payment-success?txnId=${txId}`,
                redirectMode: "REDIRECT",
                callbackUrl: `${redirectBase}/api/payment-callback`,
                mobileNumber: phone,
                paymentInstrument: { type: "PAY_PAGE" }
            };

            const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
            const checksum = crypto.createHash("sha256").update(base64 + "/pg/v1/pay" + SALT_KEY).digest("hex") + "###" + SALT_INDEX;

            await Booking.create({ 
                transactionId: txId, 
                eventId: targetEventId, 
                userId: targetUserId, 
                amount, 
                status: "Initiated",
                phone: phone,
                email: body.email || null
            });

            const response = await axios.post(`${ENV_BASE_URL}/pg/v1/pay`, { request: base64 }, {
                headers: { "Content-Type": "application/json", "X-VERIFY": checksum, "X-MERCHANT-ID": MERCHANT_ID }
            });

            if (response.data.success) {
                return json(res, 200, { success: true, redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
            }
            return json(res, 500, { message: "Failed to initiate payment" });
        }

        // -- PhonePe Payment Callback (Idempotent) --
        if (url.includes('/payment-callback')) {
            const params = new URLSearchParams(queryPart || '');
            const txId = params.get('txnId') || body?.merchantTransactionId;
            if (!txId) return json(res, 400, { message: "Transaction ID missing" });

            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

            const existingBooking = await Booking.findOne({ transactionId: txId });
            if (existingBooking && existingBooking.status === "Confirmed") {
                if (method === 'GET') {
                    const redirectBase = `https://events.parkconscious.in`;
                    res.setHeader('Location', `${redirectBase}/payment-success?txnId=${txId}`);
                    res.statusCode = 302; res.end(); return;
                }
                return json(res, 200, { success: true, message: "Already processed" });
            }

            const checkSum = crypto.createHash("sha256").update(`/pg/v1/status/${MERCHANT_ID}/${txId}` + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
            const response = await axios.get(`${ENV_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${txId}`, {
                headers: { "X-VERIFY": checkSum, "X-MERCHANT-ID": MERCHANT_ID }
            });

            const isSuccess = response.data.success && response.data.data.state === "COMPLETED";
            const redirectBase = `https://events.parkconscious.in`;

            if (isSuccess) {
                const updatedBooking = await Booking.findOneAndUpdate(
                    { transactionId: txId, status: { $ne: "Confirmed" } }, 
                    { $set: { 
                        status: "Confirmed", 
                        ticketId: "TK-" + crypto.randomUUID().slice(0, 8).toUpperCase() 
                    } },
                    { new: true }
                );

                if (updatedBooking && updatedBooking.eventId && updatedBooking.eventId.length === 24) {
                    await models.Event.findByIdAndUpdate(updatedBooking.eventId, { $inc: { capacity: -1 } });
                }
                
                if (method === 'GET') {
                    res.setHeader('Location', `${redirectBase}/payment-success?txnId=${txId}`);
                    res.statusCode = 302; res.end(); return;
                }
            } else {
                if (method === 'GET') {
                    res.setHeader('Location', `${redirectBase}/payment-failure?txnId=${txId}`);
                    res.statusCode = 302; res.end(); return;
                }
            }
            
            return json(res, 200, { success: isSuccess });
        }

        // -- Booking Status Check --
        if (url.includes('/booking/status/') && method === 'GET') {
            const txnId = url.split('/').pop();
            if (!txnId) return json(res, 400, { message: 'Transaction ID missing' });
            const booking = await Booking.findOne({ transactionId: txnId }).lean();
            if (!booking) return json(res, 404, { message: 'Booking not found' });
            return json(res, 200, booking);
        }

        // -- User's Personal Bookings (My Tickets) --
        if (url.includes('/bookings/') && !url.includes('/status') && method === 'GET') {
            const userId = url.split('/').pop();
            if (!userId || userId === 'undefined') return json(res, 400, { message: 'User ID missing or invalid' });
            
            const bookings = await Booking.find({ 
                userId: String(userId), 
                status: "Confirmed" 
            }).sort({ createdAt: -1 }).lean();

            for (let b of bookings) {
                const eid = String(b.eventId || '');
                if (eid && eid.length === 24) {
                    const evt = await models.Event.findById(eid).lean();
                    b.event = evt ? normalizeEvent(evt) : { title: "Archived Event", date: b.createdAt, location: "TBA" };
                } else {
                    b.event = { title: "Archived Event", date: b.createdAt, location: "TBA" };
                }
            }

            return json(res, 200, bookings);
        }

        return json(res, 404, { message: 'Payment endpoint not matched: ' + url });
    } catch (err) {
        console.error('[PAYMENT ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
