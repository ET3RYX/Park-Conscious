const jwt = require("jsonwebtoken");

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    if (!res.headersSent) {
      res.status(401).json({ error: "Unauthorized" });
    }
    return null;
  }
  return user;
}

module.exports = { verifyToken, requireAuth };
