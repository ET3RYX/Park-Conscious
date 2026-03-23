const handler = require("./api/discussions/[id]/index.js");
require("dotenv").config();

const req = {
    method: "GET",
    query: { id: "69c0575d5c23290110b8d9dd" }
};

const res = {
    setHeader: (name, value) => console.log(`Header: ${name}=${value}`),
    status: (code) => {
        console.log(`Status: ${code}`);
        return {
            json: (data) => console.log("JSON Response:", JSON.stringify(data, null, 2)),
            end: () => console.log("Response Ended")
        };
    }
};

async function test() {
    try {
        console.log("Starting local handler test...");
        await handler(req, res);
        console.log("Test finished.");
    } catch (err) {
        console.error("HANDLER CRASHED:", err);
    }
}

test();
