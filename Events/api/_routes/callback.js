export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { response: encodedResponse } = req.body || {};

  if (!encodedResponse) {
    return res.status(400).json({ message: "No payload" });
  }

  try {
    const decoded = JSON.parse(Buffer.from(encodedResponse, "base64").toString("utf-8"));
    console.log("📩 PhonePe S2S Callback:", JSON.stringify(decoded, null, 2));

    // In a full implementation, you'd verify the checksum here via X-VERIFY header
    // and update the MongoDB database with `decoded.data.state` and `decoded.data.merchantTransactionId`

    return res.status(200).json({ message: "Callback received" });
  } catch (err) {
    console.error("Callback decode error:", err.message);
    return res.status(500).json({ message: "Error processing callback" });
  }
}
