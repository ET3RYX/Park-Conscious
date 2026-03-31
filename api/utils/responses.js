export function sendJSON(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = status;
    res.end(JSON.stringify(data));
}

export function sendError(res, status, message, details = null) {
    return sendJSON(res, status, {
        error: true,
        message,
        details,
        timestamp: new Date().toISOString()
    });
}
