const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

// Default data for initialization
const DEFAULT_PRODUCTS = [
    { _id: '1', name: '200 💎 50% Top Up Event Complete', price: 150, inStock: true, image: 'diamond_3d.png' },
    { _id: '2', name: '620 💎 50% Top Up Event Complete', price: 410, inStock: true, image: 'diamond_3d.png' },
    { _id: '3', name: '930 💎 50% Top Up Event Complete', price: 630, inStock: true, image: 'diamond_3d.png' },
    { _id: '4', name: '1040 💎 50% Top Up Event Complete', price: 690, inStock: true, image: 'diamond_3d.png' },
    { _id: '5', name: '1150 💎 50% Top Up Event Complete', price: 770, inStock: true, image: 'diamond_3d.png' },
    { _id: '6', name: '2120 💎 50% Top Up Event Complete', price: 1310, inStock: true, image: 'diamond_3d.png' },
    { _id: '7', name: '4360 💎 50% Top Up Event Complete', price: 2720, inStock: true, image: 'diamond_3d.png' },
    { _id: '8', name: '5300 💎 50% Top Up Event Complete', price: 3330, inStock: true, image: 'diamond_3d.png' },
    { _id: '9', name: '9800 💎 50% Top Up Event Complete', price: 5340, inStock: true, image: 'diamond_3d.png' },
    { _id: '10', name: '11200 💎 50% Top Up Event Complete', price: 6100, inStock: true, image: 'diamond_3d.png' },
    { _id: '11', name: '1Weekly 200💎 instant (Id&Pass)', price: 150, inStock: true, image: 'mnthly.png' },
    { _id: '12', name: '2Weekly 400💎 instant (Id&Pass)', price: 290, inStock: true, image: 'mnthly.png' },
    { _id: '13', name: '3Weekly 600💎 instant (Id&Pass)', price: 440, inStock: true, image: 'mnthly.png' },
    { _id: '14', name: '4Weekly 800💎 instant (Id&Pass)', price: 580, inStock: true, image: 'mnthly.png' },
    { _id: '15', name: '5Weekly 1000💎 instant (Id&Pass)', price: 720, inStock: true, image: 'mnthly.png' },
    { _id: '16', name: 'Monthly Instant 1000💎', price: 770, inStock: true, image: 'membership_monthly_new.png' },
    { _id: '17', name: 'Monthly+Weekly 1200💎 Instant', price: 920, inStock: true, image: 'membership_monthly_new.png' },
    { _id: '18', name: '10 Weekly Instant 2000💎', price: 1500, inStock: true, image: 'membership_monthly_new.png' },
    { _id: '19', name: '5Weekly+1Monthly 2000💎 Instant', price: 1550, inStock: true, image: 'membership_monthly_new.png' },
    { _id: '20', name: '2Monthly Instant 2000💎', price: 1600, inStock: true, image: 'membership_monthly_new.png' }
];

const DEFAULT_SETTINGS = {
    _id: 'settings',
    youtubeVideoUrl: 'https://www.youtube.com/embed/9rT0A8h9bB0',
    adminEmail: process.env.ADMIN_EMAIL || 'rasalive11@gmail.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'rasalive11@gmail.com',
    siteName: 'VORTEX TOP UP SHOP'
};

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable not set');
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('vortexshop');

    cachedClient = client;
    cachedDb = db;

    // Initialize collections if empty
    const productsCount = await db.collection('products').countDocuments();
    if (productsCount === 0) {
        await db.collection('products').insertMany(DEFAULT_PRODUCTS);
    }

    const settings = await db.collection('settings').findOne({ _id: 'settings' });
    if (!settings) {
        await db.collection('settings').insertOne(DEFAULT_SETTINGS);
    }

    return { client, db };
}

// CORS headers for all responses
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
}

module.exports = { connectToDatabase, corsHeaders, DEFAULT_SETTINGS };
