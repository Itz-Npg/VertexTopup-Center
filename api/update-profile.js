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
        const { mobile, newName } = req.body;
        const { db } = await connectToDatabase();

        const result = await db.collection('users').findOneAndUpdate(
            { mobile },
            { $set: { name: newName } },
            { returnDocument: 'after' }
        );

        if (!result) {
            res.writeHead(404, corsHeaders());
            return res.end(JSON.stringify({ message: 'User not found' }));
        }

        res.writeHead(200, corsHeaders());
        return res.end(JSON.stringify({ success: true }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Error updating profile' }));
    }
};
