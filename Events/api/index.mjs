import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// ─── PhonePe Config ─────────────────────────────────────────────────────────
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT86';
const SALT_KEY    = process.env.PHONEPE_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076';
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX || 1;
const isSandbox   = MERCHANT_ID.includes('PGTEST');
const BASE_URL    = isSandbox
  ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
  : 'https://api.phonepe.com/apis/hermes';

// ─── MongoDB ─────────────────────────────────────────────────────────────────
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ─── Schemas ─────────────────────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  password: String, googleId: String, uid: String, picture: String,
}, { timestamps: true }));

const TicketPrice = mongoose.models.TicketPrice || mongoose.model('TicketPrice', new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  regularPrice: { type: Number, default: 1499 },
  vipPrice: { type: Number, default: 2999 },
}, { timestamps: true }));

const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
}, { timestamps: true }));

const EventRequest = mongoose.models.EventRequest || mongoose.model('EventRequest', new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: String,
  eventLocation: String,
  description: String,
  contactName: String,
  contactEmail: { type: String, required: true },
  contactPhone: String,
  status: { type: String, default: "pending" },
}, { timestamps: true }));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function json(res, status, data) {
  setCors(res);
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

function generateChecksum(base64Payload, endpoint) {
  const sha256 = crypto.createHash('sha256').update(base64Payload + endpoint + SALT_KEY).digest('hex');
  return `${sha256}###${SALT_INDEX}`;
}

async function checkPaymentStatus(txnId) {
  const endpoint  = `/pg/v1/status/${MERCHANT_ID}/${txnId}`;
  const sha256    = crypto.createHash('sha256').update(endpoint + SALT_KEY).digest('hex');
  const checksum  = `${sha256}###${SALT_INDEX}`;
  const response  = await axios.get(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum, 'X-MERCHANT-ID': MERCHANT_ID, accept: 'application/json' }
  });
  return response.data;
}

async function parseBody(req) {
  if (req.body) return req.body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }

  const url      = req.url || '';
  const method   = req.method || 'GET';
  const cleanUrl = url.split('?')[0];
  const body     = await parseBody(req);
  req.body       = body;

  const APP_URL = process.env.APP_URL ||
    (req.headers.host?.includes('localhost')
      ? `http://${req.headers.host}`
      : `https://${req.headers.host}`);

  try {

    // ── Health ──────────────────────────────────────────────────────────────
    if (cleanUrl === '/api' || cleanUrl === '/api/') {
      return json(res, 200, { status: 'API Live', env: MERCHANT_ID.slice(0, 6) });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAY — no MongoDB needed
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/pay' && method === 'POST') {
      const { name, amount, phone } = body;
      const merchantTransactionId = 'TXN_' + uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase();
      const amountInPaise = parseInt(amount) * 100;

      const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: 'USER_' + (phone || 'GUEST'),
        amount: amountInPaise,
        redirectUrl: `${APP_URL}/api/payment-callback?txnId=${merchantTransactionId}`,
        redirectMode: 'REDIRECT',
        callbackUrl: `${APP_URL}/api/callback`,
        mobileNumber: phone || '9999999999',
        paymentInstrument: { type: 'PAY_PAGE' }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksum      = generateChecksum(base64Payload, '/pg/v1/pay');

      try {
        const response = await axios.post(`${BASE_URL}/pg/v1/pay`, { request: base64Payload }, {
          headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum, 'X-MERCHANT-ID': MERCHANT_ID, accept: 'application/json' }
        });

        const { success, data } = response.data;
        if (success && data?.instrumentResponse?.redirectInfo?.url) {
          return json(res, 200, { success: true, redirectUrl: data.instrumentResponse.redirectInfo.url, transactionId: merchantTransactionId });
        }
        return json(res, 400, { success: false, message: 'Failed to initiate payment', details: response.data });
      } catch (err) {
        const errData = err?.response?.data || err.message;
        console.error('PhonePe Error:', errData);
        return json(res, 500, { success: false, message: 'PhonePe error', details: errData });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYMENT CALLBACK
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/payment-callback') {
      const txnId = req.query?.txnId || body?.txnId || body?.merchantTransactionId;
      if (!txnId) {
        res.statusCode = 302;
        res.setHeader('Location', '/failure.html?reason=no_txn_id');
        return res.end();
      }
      try {
        const result = await checkPaymentStatus(txnId);
        const isSuccess = result.success === true &&
          (result.data?.state === 'COMPLETED' || result.code === 'PAYMENT_SUCCESS');
        const amountPaid = (result.data?.amount || 0) / 100;
        res.statusCode = 302;
        res.setHeader('Location', isSuccess
          ? `/success.html?txnId=${txnId}&amount=${amountPaid}`
          : `/failure.html?txnId=${txnId}&state=${result.data?.state || 'FAILED'}`);
        return res.end();
      } catch (err) {
        res.statusCode = 302;
        res.setHeader('Location', `/failure.html?txnId=${txnId}&reason=status_check_failed`);
        return res.end();
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // S2S CALLBACK
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/callback' && method === 'POST') {
      const { response: encoded } = body;
      if (!encoded) return json(res, 400, { message: 'No payload' });
      try {
        const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
        console.log('PhonePe S2S Callback:', JSON.stringify(decoded));
        return json(res, 200, { message: 'Callback received' });
      } catch (err) {
        return json(res, 500, { message: 'Error processing callback' });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TICKETS — needs MongoDB
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/tickets') {
      await connectDB();
      if (method === 'GET') {
        const eventId = (url.includes('?') ? new URLSearchParams(url.split('?')[1]) : new URLSearchParams()).get('eventId') || 'farewell_2024';
        let ticket = await TicketPrice.findOne({ eventId });
        if (!ticket) ticket = { eventId, regularPrice: 1499, vipPrice: 2999 };
        return json(res, 200, { success: true, event: ticket });
      }
      if (method === 'POST') {
        const { eventId, regularPrice, vipPrice } = body;
        if (!eventId) return json(res, 400, { success: false, message: 'eventId required' });
        const ticket = await TicketPrice.findOneAndUpdate(
          { eventId }, { regularPrice, vipPrice }, { new: true, upsert: true }
        );
        return json(res, 200, { success: true, event: ticket });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT REQUESTS
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/event-request' && method === 'POST') {
      await connectDB();
      const { eventName, eventDate, eventLocation, description, contactName, contactEmail, contactPhone } = body;
      if (!eventName || !contactEmail) {
        return json(res, 400, { success: false, message: 'Event Name and Contact Email are required' });
      }
      const request = await EventRequest.create({
        eventName, eventDate, eventLocation, description, contactName, contactEmail, contactPhone
      });
      return json(res, 201, { success: true, message: 'Request submitted successfully', request });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN LOGIN
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/admin/login' && method === 'POST') {
      await connectDB();
      const { username, password } = body;

      // Seed default admin if empty
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const hashedDefault = await bcrypt.hash('oliver@123', 10);
        await Admin.create({ username: 'oliver', password: hashedDefault });
        console.log('Seeded default admin: oliver');
      }

      if (!username || !password) return json(res, 400, { success: false, message: 'Username and password required' });

      const admin = await Admin.findOne({ username });
      if (!admin) return json(res, 401, { success: false, message: 'Invalid admin credentials' });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return json(res, 401, { success: false, message: 'Invalid admin credentials' });

      return json(res, 200, { success: true, admin: { username: admin.username } });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEGACY ROUTES — needs MongoDB
    // ─────────────────────────────────────────────────────────────────────────
    await connectDB();

    // Google Auth
    if (url.includes('/auth/google') && method === 'POST') {
      const { token, userInfo } = body || {};
      if (!token) return json(res, 400, { error: 'Token required' });

      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
      const client = new OAuth2Client(googleClientId);

      let uid, name, email, picture;

      if (userInfo && userInfo.sub) {
        ({ sub: uid, name, email, picture } = userInfo);
      } else {
        try {
          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleClientId,
          });
          const payload = ticket.getPayload();
          ({ sub: uid, name, email, picture } = payload);
        } catch (verifyErr) {
          // Fallback to userInfo API
          try {
            const userinfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = userinfoRes.data;
            uid = data.sub;
            name = data.name;
            email = data.email;
            picture = data.picture;
          } catch (fetchErr) {
            throw new Error(`Google Verification failed: ${fetchErr.message}`);
          }
        }
      }

      if (!uid) throw new Error("Could not determine user ID from Google response");

      await User.findOneAndUpdate(
        { email },
        { uid, name, email, picture },
        { upsert: true, new: true }
      );

      const appToken = jwt.sign(
        { uid, name, email, picture },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: "24h" }
      );

      return json(res, 200, {
        token: appToken,
        user: { uid, name, email, picture },
      });
    }

    // Auth routes
    if (url.includes('/auth/signup') && method === 'POST') {
      const { name, email, password } = body;
      if (!name || !email || !password) return json(res, 400, { message: 'Missing fields' });
      if (await User.findOne({ email })) return json(res, 400, { message: 'User already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      return json(res, 201, { user: { name: user.name, email: user.email } });
    }
    if (url.includes('/auth/login') && method === 'POST') {
      const { email, password } = body;
      const user = await User.findOne({ email });
      if (!user || !user.password) return json(res, 400, { message: 'Invalid credentials' });
      if (!await bcrypt.compare(password, user.password)) return json(res, 400, { message: 'Invalid credentials' });
      return json(res, 200, { user: { name: user.name, email: user.email } });
    }

    return json(res, 404, { message: 'Route not found', url });

  } catch (err) {
    console.error('Handler crash:', err.message);
    return json(res, 500, { message: 'Server error', error: err.message });
  }
}
