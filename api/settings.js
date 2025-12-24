const { connectToDatabase, corsHeaders } = require('../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    try {
        const { db } = await connectToDatabase();

        // GET - Get settings (without password)
        if (req.method === 'GET') {
            const settings = await db.collection('settings').findOne({ _id: 'settings' });

            if (settings) {
                const safeSettings = { ...settings };
                delete safeSettings.adminPassword;
                res.writeHead(200, corsHeaders());
                return res.end(JSON.stringify(safeSettings));
            }

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({}));
        }

        // PUT - Update settings
        if (req.method === 'PUT') {
            const updates = req.body;

            await db.collection('settings').updateOne(
                { _id: 'settings' },
                { $set: updates },
                { upsert: true }
            );

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({ success: true }));
        }

        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
