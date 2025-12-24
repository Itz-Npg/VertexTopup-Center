const { connectToDatabase, corsHeaders } = require('../lib/db');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }

    try {
        const { db } = await connectToDatabase();

        if (req.method === 'GET') {
            const products = await db.collection('products').find({}).toArray();
            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify(products));
        }

        if (req.method === 'POST') {
            const { name, price, image, inStock } = req.body;

            const newProduct = {
                _id: Date.now().toString(),
                name,
                price: parseFloat(price),
                image: image || 'diamond_3d.png',
                inStock: inStock !== false
            };

            await db.collection('products').insertOne(newProduct);
            res.writeHead(200, corsHeaders());
            return res.end(JSON.stringify({ success: true, product: newProduct }));
        }

        res.writeHead(405, corsHeaders());
        return res.end(JSON.stringify({ message: 'Method not allowed' }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, corsHeaders());
        return res.end(JSON.stringify({ message: 'Server error' }));
    }
};
