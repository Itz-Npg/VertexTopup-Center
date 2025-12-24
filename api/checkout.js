const { connectToDatabase, corsHeaders } = require('../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    try {
        const { db } = await connectToDatabase();

        // POST - Create new order (checkout)
        if (req.method === 'POST') {
            const { customerName, customerMobile, gameUID, axisToken, item, price, quantity } = req.body;

            // Validate UID
            if (!gameUID || gameUID.length < 8 || !/^\d+$/.test(gameUID)) {
                res.writeHead(400, corsHeaders());
                return res.end(JSON.stringify({ message: 'Game UID must be at least 8 digits' }));
            }

            const newOrder = {
                _id: Date.now().toString(),
                customerName,
                customerMobile,
                gameUID,
                axisToken,
                item,
                price,
                quantity,
                status: 'Processing',
                orderDate: new Date().toISOString()
            };

            await db.collection('orders').insertOne(newOrder);

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({ success: true, order: newOrder }));
        }

        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Failed to place order' }));
    }
};
