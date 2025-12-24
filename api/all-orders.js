const { connectToDatabase, corsHeaders } = require('../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    try {
        const { db } = await connectToDatabase();

        // GET - All orders (admin)
        if (req.method === 'GET') {
            const orders = await db.collection('orders')
                .find({})
                .sort({ orderDate: -1 })
                .toArray();

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify(orders));
        }

        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
