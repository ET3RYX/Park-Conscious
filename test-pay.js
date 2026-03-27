import payHandler from './Events/api/_routes/pay.js';

const req = {
  method: 'POST',
  body: { name: 'Test User', amount: 1499, phone: '9999999999' },
  headers: { host: 'localhost:3000' }
};

const res = {
  status: (code) => {
    console.log('Status:', code);
    return {
      json: (data) => console.log('Response:', JSON.stringify(data, null, 2))
    };
  }
};

payHandler(req, res).catch(console.error);
