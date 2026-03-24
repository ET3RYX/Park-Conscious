const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ─── Sandbox Credentials ─────────────────────────────────────────────────────
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY    = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX  = 1;
const BASE_URL    = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const APP_URL     = "http://localhost:3000";
// ─────────────────────────────────────────────────────────────────────────────


// ─── Helper: Generate Checksum ───────────────────────────────────────────────
function generateChecksum(base64Payload, endpoint) {
  const hashInput = base64Payload + endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${SALT_INDEX}`;
}
// ─────────────────────────────────────────────────────────────────────────────


// ─── Explicit routes for success & failure pages ─────────────────────────────
// Don't rely on static middleware redirect — serve them explicitly
app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.get("/failure", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "failure.html"));
});
// ─────────────────────────────────────────────────────────────────────────────


// ─── Route: Serve Homepage ───────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ─── Route: Initiate Payment ─────────────────────────────────────────────────
app.post("/api/pay", async (req, res) => {
  try {
    const { name, amount, phone } = req.body;

    const merchantTransactionId = "TXN_" + uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase();
    const amountInPaise = parseInt(amount) * 100;

    const payload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId:        "USER_" + phone,
      amount:                amountInPaise,
      redirectUrl:           `${APP_URL}/payment-callback?txnId=${merchantTransactionId}`,
      redirectMode:          "REDIRECT",
      callbackUrl:           `${APP_URL}/callback`,
      mobileNumber:          phone,
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
      return res.json({
        success:       true,
        redirectUrl:   data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId
      });
    } else {
      return res.json({ success: false, message: "Failed to initiate payment" });
    }

  } catch (error) {
    console.error("Payment initiation error:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// ─── Helper: Check Payment Status with PhonePe ───────────────────────────────
async function checkPaymentStatus(txnId) {
  const endpoint  = `/pg/v1/status/${MERCHANT_ID}/${txnId}`;
  const hashInput = endpoint + SALT_KEY;
  const sha256    = crypto.createHash("sha256").update(hashInput).digest("hex");
  const checksum  = `${sha256}###${SALT_INDEX}`;

  const response = await axios.get(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type":  "application/json",
      "X-VERIFY":       checksum,
      "X-MERCHANT-ID":  MERCHANT_ID,
      "accept":         "application/json"
    }
  });

  return response.data;
}
// ─────────────────────────────────────────────────────────────────────────────


// ─── Shared Callback Handler (GET + POST) ────────────────────────────────────
async function handlePaymentCallback(req, res) {
  const txnId = req.query.txnId || req.body.txnId || req.body.merchantTransactionId;

  console.log("─────────────────────────────────────────");
  console.log("🔔 Callback hit");
  console.log("   Method  :", req.method);
  console.log("   txnId   :", txnId);
  console.log("   Query   :", req.query);
  console.log("   Body    :", req.body);
  console.log("─────────────────────────────────────────");

  if (!txnId) {
    console.error("❌ No txnId found in callback");
    return res.redirect("/failure?txnId=UNKNOWN&reason=no_txn_id");
  }

  try {
    const result = await checkPaymentStatus(txnId);

    console.log("📦 Full Status API Response:");
    console.log(JSON.stringify(result, null, 2));

    const { success, code, data } = result;
    const state = data?.state;
    const paymentCode = code; // e.g. "PAYMENT_SUCCESS", "PAYMENT_PENDING", "PAYMENT_ERROR"

    console.log("   success :", success);
    console.log("   code    :", paymentCode);
    console.log("   state   :", state);

    // PhonePe sandbox may return state="COMPLETED" or code="PAYMENT_SUCCESS"
    const isSuccess = success === true &&
      (state === "COMPLETED" || paymentCode === "PAYMENT_SUCCESS");

    if (isSuccess) {
      const amountPaid = (data?.amount || 0) / 100;
      console.log("✅ Payment successful — redirecting to success page");
      return res.redirect(`/success?txnId=${txnId}&amount=${amountPaid}`);
    } else {
      console.log("❌ Payment not successful — redirecting to failure page");
      return res.redirect(`/failure?txnId=${txnId}&state=${state || "FAILED"}&code=${paymentCode || ""}`);
    }

  } catch (error) {
    const errData = error?.response?.data;
    console.error("💥 Status check threw an error:");
    console.error(JSON.stringify(errData || error.message, null, 2));
    return res.redirect(`/failure?txnId=${txnId}&reason=status_check_failed`);
  }
}

app.get("/payment-callback",  handlePaymentCallback);
app.post("/payment-callback", handlePaymentCallback);
// ─────────────────────────────────────────────────────────────────────────────


// ─── DEBUG Route: manually check any txnId in browser ────────────────────────
// Visit: http://localhost:3000/debug/YOUR_TXN_ID
app.get("/debug/:txnId", async (req, res) => {
  const { txnId } = req.params;
  try {
    const result = await checkPaymentStatus(txnId);
    return res.json(result); // Shows raw PhonePe response in browser
  } catch (error) {
    return res.json({ error: error?.response?.data || error.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────────


// ─── Route: PhonePe Server-to-Server Callback (async background call) ────────
app.post("/callback", (req, res) => {
  const { response: encodedResponse } = req.body;

  if (!encodedResponse) return res.status(400).json({ message: "No payload" });

  try {
    const decoded = JSON.parse(Buffer.from(encodedResponse, "base64").toString("utf-8"));
    console.log("📩 PhonePe S2S Callback:", JSON.stringify(decoded, null, 2));

    // TODO: Update your DB here
    // decoded.data.state                 → "COMPLETED" | "FAILED" | "PENDING"
    // decoded.data.merchantTransactionId → your txnId
    // decoded.data.amount                → in paise

    return res.status(200).json({ message: "Callback received" });
  } catch (err) {
    console.error("Callback decode error:", err.message);
    return res.status(500).json({ message: "Error processing callback" });
  }
});
// ─────────────────────────────────────────────────────────────────────────────


// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
  console.log("🔍 Debug any txnId at: http://localhost:3000/debug/<txnId>");
});