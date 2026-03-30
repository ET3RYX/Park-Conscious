const mongoose = require('mongoose');
const crypto   = require('crypto');
const axios    = require('axios');
const { v4: uuidv4 } = require('uuid');
const bcrypt   = require('bcryptjs');
const { OAuth2Client } = require("google-auth-library");
const jwt      = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const Busboy   = require('busboy');

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
  password: String, googleId: String, uid: String, picture: String
}, { timestamps: true }));

const TicketPrice = mongoose.models.TicketPrice || mongoose.model('TicketPrice', new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  regularPrice: { type: Number, default: 1499 },
  vipPrice: { type: Number, default: 2999 }
}, { timestamps: true }));

const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}, { timestamps: true }));

const EventRequest = mongoose.models.EventRequest || mongoose.model('EventRequest', new mongoose.Schema({
  eventName: { type: String, required: true },
  description: String, contactName: String, contactEmail: { type: String, required: true },
  status: { type: String, default: "pending" }
}, { timestamps: true }));

const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  name: { type: String, trim: true }, // Legacy compatibility
  description: { type: String, trim: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { name: { type: String, required: true }, address: String, coordinates: { lat: Number, lng: Number } },
  venue: { type: String }, // Legacy compatibility
  image: { type: String }, // Legacy compatibility
  images: [{ type: String }],
  category: [{ type: String }],
  price: { type: Number, default: 0 },
  capacity: { type: Number },
  status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));

// ── Cloudinary Config ───────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function json(res, status, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    return raw ? JSON.parse(raw) : {};
  } catch (err) { return {}; }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const method = req.method;
  const url    = req.url || '';
  const cleanUrl = url.split('?')[0];

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    // 1. Health / Diagnostics
    if (cleanUrl === '/api' || cleanUrl === '/api/') {
      return json(res, 200, { status: 'API Live', mongo: !!cached.conn, timestamp: new Date() });
    }

    // 2. Body Parser (for non-streams)
    let body = {};
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
    if (hasBody && !isMultipart) {
      body = await parseBody(req);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT UPLOADS (Multipart)
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl.includes('/upload') && method === 'POST') {
      return new Promise((resolve) => {
        const bb = Busboy({ headers: req.headers });
        let fileHandled = false;
        bb.on('file', (fieldname, file) => {
          fileHandled = true;
          const stream = cloudinary.uploader.upload_stream({ folder: 'park-conscious-events' }, (error, result) => {
            if (error) return json(res, 500, { message: 'Cloudinary error', error: error.message });
            json(res, 200, { url: result.secure_url });
            resolve();
          });
          file.pipe(stream);
        });
        bb.on('finish', () => { if (!fileHandled) { json(res, 400, { message: 'No file' }); resolve(); } });
        req.pipe(bb);
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT CRUD
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl.includes('/api/events')) {
      await connectDB();
      if (method === 'GET') {
        const isAdmin = cleanUrl.includes('/admin/all');
        const filter = isAdmin ? {} : { status: 'published' };
        const evts = await Event.find(filter).sort({ date: 1 });
        return json(res, 200, evts);
      }
      if (method === 'POST') {
        const { title, description, date, price, capacity, status, locationName, locationAddress, lat, lng, images, category } = body;
        const newEvent = await Event.create({
          title, name: title, description, date, status: status || 'draft',
          location: { name: locationName, address: locationAddress, coordinates: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 } },
          venue: locationName, image: (images && images[0]) || '',
          images: images || [], category: category || [], 
          price: parseInt(price) || 0, capacity: parseInt(capacity) || 0
        });
        return json(res, 201, newEvent);
      }
      if (method === 'PUT') {
        const id = cleanUrl.split('/').pop();
        const updated = await Event.findByIdAndUpdate(id, { $set: body }, { new: true });
        return json(res, 200, updated);
      }
      if (method === 'DELETE') {
        const id = cleanUrl.split('/').pop();
        await Event.findByIdAndDelete(id);
        return json(res, 200, { message: 'Deleted' });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYMENTS (PhonePe)
    // ─────────────────────────────────────────────────────────────────────────
    if (cleanUrl === '/api/pay' && method === 'POST') {
      const { amount, phone } = body;
      const merchantTransactionId = 'TXN_' + uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase();
      const payload = {
        merchantId: MERCHANT_ID, merchantTransactionId, merchantUserId: 'USER_' + (phone || 'GUEST'),
        amount: parseInt(amount) * 100, redirectMode: 'REDIRECT',
        redirectUrl: `https://${req.headers.host}/api/payment-callback?txnId=${merchantTransactionId}`,
        paymentInstrument: { type: 'PAY_PAGE' }
      };
      const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksum = crypto.createHash('sha256').update(base64 + '/pg/v1/pay' + SALT_KEY).digest('hex') + '###' + SALT_INDEX;
      const response = await axios.post(`${BASE_URL}/pg/v1/pay`, { request: base64 }, {
        headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum, 'X-MERCHANT-ID': MERCHANT_ID, accept: 'application/json' }
      });
      return json(res, 200, { success: true, redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
    }

    // 3. Fallback
    return json(res, 404, { message: 'Not found', url: cleanUrl });

  } catch (err) {
    console.error('API Crash:', err.message);
    return json(res, 500, { message: 'Internal Server Error', error: err.message });
  }
};
