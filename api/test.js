export default function handler(req, res) {
  res.status(200).json({ status: "Vercel Node.js is working!", timestamp: new Date().toISOString() });
}
