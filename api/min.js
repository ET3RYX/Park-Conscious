export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ 
        status: 'MINIMAL_API_LIVE', 
        message: 'Infrastructure check passed. Vercel is executing code correctly.',
        url: req.url,
        time: new Date().toISOString()
    }));
}
