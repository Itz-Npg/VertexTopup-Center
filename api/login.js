const { connectToDatabase, corsHeaders } = require('../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    if (req.method !== 'POST') {
        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    }

    try {
        const { input, password } = req.body;
        const { db } = await connectToDatabase();

        const user = await db.collection('users').findOne({
            mobile: input,
            password: password
        });

        if (!user) {
            res.writeHead(401, corsHeaders());
            return res.end(JSON.stringify({ message: 'Invalid Credentials' }));
        }

        res.writeHead(200, corsHeaders());
        return res.end(JSON.stringify({ success: true, user }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
