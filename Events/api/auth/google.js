export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ 
    message: "DEBUG: API IS WORKING", 
    method: req.method,
    env: {
      has_cid: !!(process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID),
      has_jwt: !!process.env.JWT_SECRET,
      has_mongo: !!process.env.MONGODB_URI
    }
  });
}
