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
        const { mobile, password } = req.body;
        const { db } = await connectToDatabase();

        // Check if user exists
        const existing = await db.collection('users').findOne({ mobile });
        if (existing) {
            res.writeHead(400, corsHeaders());
            return res.end(JSON.stringify({ message: 'User already exists' }));
        }

        const newUser = {
            _id: Date.now().toString(),
            name: "Gamer_" + mobile.slice(-4),
            mobile,
            password,
            createdAt: new Date().toISOString()
        };

        await db.collection('users').insertOne(newUser);

        res.writeHead(200, corsHeaders());
        return res.end(JSON.stringify({ success: true, user: newUser }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
