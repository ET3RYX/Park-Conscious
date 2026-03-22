module.exports = (req, res) => {
  res.json({
    nodeVersion: process.version,
    envVars: Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY")),
    cwd: process.cwd(),
    time: new Date().toISOString(),
    query: req.query
  });
};
