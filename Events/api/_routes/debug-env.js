export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    nodeVersion: process.version,
    envVars: Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY")),
    cwd: process.cwd(),
    time: new Date().toISOString(),
    query: req.query
  }));
}
