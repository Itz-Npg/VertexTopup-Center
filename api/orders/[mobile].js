const { connectToDatabase, corsHeaders } = require('../../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    const { mobile } = req.query;

    try {
        const { db } = await connectToDatabase();

        // GET - Orders by customer mobile
        if (req.method === 'GET') {
            const orders = await db.collection('orders')
                .find({ customerMobile: mobile })
                .sort({ orderDate: -1 })
                .toArray();

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify(orders));
        }

        // DELETE - Delete order by ID (uses mobile as ID here)
        if (req.method === 'DELETE') {
            const result = await db.collection('orders').deleteOne({ _id: mobile });

            if (result.deletedCount === 0) {
                res.writeHead(404, corsHeaders());
                return res.end(JSON.stringify({ message: 'Order not found' }));
            }

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
