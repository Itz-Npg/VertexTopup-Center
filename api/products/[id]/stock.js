const { connectToDatabase, corsHeaders } = require('../../../lib/db');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    const { id } = req.query;

    try {
        const { db } = await connectToDatabase();

        if (req.method === 'PUT') {
            const { inStock } = req.body;

            const result = await db.collection('products').findOneAndUpdate(
                { _id: id },
                { $set: { inStock } },
                { returnDocument: 'after' }
            );

            if (!result) {
                res.writeHead(404, corsHeaders());
                return res.end(JSON.stringify({ message: 'Product not found' }));
            }

            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({ success: true, product: result }));
        }

        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
