const { connectToDatabase, corsHeaders, DEFAULT_SETTINGS } = require('../lib/db');

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
        const { email, password } = req.body;
        const { db } = await connectToDatabase();

        // Get settings from DB
        let settings = await db.collection('settings').findOne({ _id: 'settings' });

        if (!settings) {
            settings = DEFAULT_SETTINGS;
        }

        // Check credentials
        if (email === settings.adminEmail && password === settings.adminPassword) {
            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({ success: true, admin: true }));
        }

        res.writeHead(401, corsHeaders());
        return res.end(JSON.stringify({ message: 'Invalid admin credentials' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
