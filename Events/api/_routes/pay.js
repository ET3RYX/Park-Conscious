import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Sandbox vs Prod helper
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
const isSandbox   = MERCHANT_ID.includes("PGTEST");
const SALT_KEY    = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX || 1;
// Auto-pick based on whether MERCHANT_ID looks like a test ID
const BASE_URL    = process.env.PHONEPE_BASE_URL || (isSandbox ? "https://api-preprod.phonepe.com/apis/pg-sandbox" : "https://api.phonepe.com/apis/hermes");

// Helper: Generate Checksum
function generateChecksum(base64Payload, endpoint) {
  const hashInput = base64Payload + endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${SALT_INDEX}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { name, amount, phone } = req.body;
    
    // Fallback URL for local testing vs production
    const APP_URL = process.env.APP_URL || (req.headers.host.includes("localhost") ? `http://${req.headers.host}` : `https://${req.headers.host}`);

    const merchantTransactionId = "TXN_" + uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase();
    const amountInPaise = parseInt(amount) * 100;

    const payload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId:        "USER_" + (phone || "GUEST"),
      amount:                amountInPaise,
      redirectUrl:           `${APP_URL}/api/payment-callback?txnId=${merchantTransactionId}`,
      redirectMode:          "REDIRECT",
      callbackUrl:           `${APP_URL}/api/callback`,
      mobileNumber:          phone || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum      = generateChecksum(base64Payload, "/pg/v1/pay");

    const response = await axios.post(
      `${BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type":  "application/json",
          "X-VERIFY":       checksum,
          "X-MERCHANT-ID":  MERCHANT_ID,
          "accept":         "application/json"
        }
      }
    );

    const { success, data } = response.data;

    if (success && data?.instrumentResponse?.redirectInfo?.url) {
      return res.status(200).json({
        success:       true,
        redirectUrl:   data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId
      });
    } else {
      return res.status(400).json({ success: false, message: "Failed to initiate payment", details: data });
    }

  } catch (error) {
    const errData = error?.response?.data || error.message;
    console.error("Payment initiation error:", errData);
    return res.status(500).json({ success: false, message: "Server error", details: errData });
  }
}
