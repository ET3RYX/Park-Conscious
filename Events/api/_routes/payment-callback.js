import axios from "axios";
import crypto from "crypto";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
const SALT_KEY    = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX || 1;
const BASE_URL    = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

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

export default async function handler(req, res) {
  // Support both GET and POST for callback
  const txnId = req.query.txnId || req.body?.txnId || req.body?.merchantTransactionId;

  if (!txnId) {
    console.error("❌ No txnId found in callback");
    return res.redirect("/failure.html?txnId=UNKNOWN&reason=no_txn_id");
  }

  try {
    const result = await checkPaymentStatus(txnId);

    const { success, code, data } = result;
    const state = data?.state;
    const paymentCode = code;

    const isSuccess = success === true &&
      (state === "COMPLETED" || paymentCode === "PAYMENT_SUCCESS");

    if (isSuccess) {
      const amountPaid = (data?.amount || 0) / 100;
      console.log("✅ Payment successful — redirecting to success page");
      return res.redirect(`/success.html?txnId=${txnId}&amount=${amountPaid}`);
    } else {
      console.log("❌ Payment not successful — redirecting to failure page");
      return res.redirect(`/failure.html?txnId=${txnId}&state=${state || "FAILED"}&code=${paymentCode || ""}`);
    }

  } catch (error) {
    const errData = error?.response?.data;
    console.error("💥 Status check threw an error:", errData || error.message);
    return res.redirect(`/failure.html?txnId=${txnId}&reason=status_check_failed`);
  }
}
