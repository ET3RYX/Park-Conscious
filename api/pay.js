import axios from 'axios';
import crypto from 'crypto';
import connectDB from './lib/mongodb.js';
import * as models from './lib/models.js';
import { json, setCors, getBody } from './lib/utils.js';

const { Booking } = models;

export default async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

    await connectDB();
    const url = req.url || '';
    const method = req.method || 'GET';
    const body = await getBody(req);

    try {
        // -- PhonePe Payment Initiation --
        if (url.includes('/pay') && method === 'POST') {
            const { name, amount, phone, eventId, orderId, userId } = body;
            const targetEventId = eventId || orderId;
            const targetUserId = name || userId || "Guest";
            
            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
            
            const txId = "TXN_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
            
            // Unified Redirect: Always force events subdomain to correctly handle SPA routing
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

            // Create initial booking with phone and email persistence
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

        // -- PhonePe Payment Callback (Verification + Idempotency) --
        if (url.includes('/payment-callback')) {
            const txId = new URLSearchParams(url.split('?')[1]).get('txnId') || body?.merchantTransactionId;
            if (!txId) return json(res, 400, { message: "Transaction ID missing" });

            const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
            const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
            const ENV_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

            // 1. IDEMPOTENCY CHECK: Is this transaction already confirmed?
            const existingBooking = await Booking.findOne({ transactionId: txId });
            if (existingBooking && existingBooking.status === "Confirmed") {
                console.log(`[PAYMENT] Duplicate callback for ${txId} - Ignoring to prevent double-count.`);
                // If it's a GET request (redirect from PhonePe), send to success page anyway
                if (method === 'GET') {
                    const host = req.headers.host || "events.parkconscious.in";
                    const redirectBase = host.includes('localhost') ? `http://${host}` : `https://${host}`;
                    res.setHeader('Location', `${redirectBase}/payment-success?txnId=${txId}`);
                    res.statusCode = 302; res.end(); return;
                }
                return json(res, 200, { success: true, message: "Already processed" });
            }

            // 2. VERIFY WITH PHONEPE
            const checkSum = crypto.createHash("sha256").update(`/pg/v1/status/${MERCHANT_ID}/${txId}` + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
            const response = await axios.get(`${ENV_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${txId}`, {
                headers: { "X-VERIFY": checkSum, "X-MERCHANT-ID": MERCHANT_ID }
            });

            const isSuccess = response.data.success && response.data.data.state === "COMPLETED";
            const host = req.headers.host || "events.parkconscious.in";
            const redirectBase = host.includes('localhost') ? `http://${host}` : `https://${host}`;

            if (isSuccess) {
                // Update booking to confirmed status and decrement the event capacity
                const updatedBooking = await Booking.findOneAndUpdate(
                    { transactionId: txId, status: { $ne: "Confirmed" } }, 
                    { $set: { 
                        status: "Confirmed", 
                        ticketId: "TK-" + crypto.randomUUID().slice(0, 8).toUpperCase() 
                    } },
                    { new: true }
                );

                // If this is the FIRST time we're confirming, decrement the event capacity
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

        // -- Booking Status Endpoint (RESTORED for QR code) --
        if (url.includes('booking/status/') && method === 'GET') {
            const txId = url.split('/').pop().split('?')[0];
            const booking = await Booking.findOne({ transactionId: txId }).lean();
            if (!booking) return json(res, 404, { message: 'Booking Not Found' });
            return json(res, 200, booking);
        }

        return json(res, 404, { message: 'Payment endpoint not matched' });
    } catch (err) {
        console.error('[PAYMENT ERROR]:', err);
        return json(res, 500, { message: 'Internal Server Error', error: err.message });
    }
}
