const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// --- DATABASE HELPER FUNCTIONS ---

// Default products data
const DEFAULT_PRODUCTS = [
    { _id: '1', name: '100 💎 Diamonds', price: 75, inStock: true, image: 'garena-free-fire-max-logo (1).avif' },
    { _id: '2', name: '310 💎 Diamonds', price: 225, inStock: true, image: 'garena-free-fire-max-logo (1).avif' },
    { _id: '3', name: '520 💎 Diamonds', price: 375, inStock: true, image: 'garena-free-fire-max-logo (1).avif' },
    { _id: '4', name: '1060 💎 Diamonds', price: 750, inStock: true, image: 'garena-free-fire-max-logo (1).avif' },
    { _id: '5', name: '2180 💎 Diamonds', price: 1500, inStock: true, image: 'garena-free-fire-max-logo (1).avif' },
    { _id: '6', name: '5600 💎 Diamonds', price: 3750, inStock: true, image: 'garena-free-fire-max-logo (1).avif' }
];

const DEFAULT_SETTINGS = {
    youtubeVideoUrl: 'https://www.youtube.com/embed/9rT0A8h9bB0',
    adminEmail: 'rasalive11@gmail.com',
    adminPassword: 'rasalive11@gmail.com',
    siteName: 'VORTEX TOP UP SHOP'
};

// Initialize DB if not exists or missing keys
function initDB() {
    let db = { users: [], orders: [], products: DEFAULT_PRODUCTS, settings: DEFAULT_SETTINGS };

    if (fs.existsSync(DB_FILE)) {
        try {
            const existing = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            db.users = existing.users || [];
            db.orders = existing.orders || [];
            db.products = existing.products || DEFAULT_PRODUCTS;
            db.settings = existing.settings || DEFAULT_SETTINGS;
        } catch (err) {
            console.log('DB read error, using defaults');
        }
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
}

initDB();

function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return initDB();
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- API ROUTES ---

// 1. Register User
app.post('/api/register', (req, res) => {
    try {
        const { mobile, password } = req.body;
        const db = readDB();

        // Check existing
        if (db.users.find(u => u.mobile === mobile)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = {
            _id: Date.now().toString(), // Simple ID
            name: "Gamer_" + mobile.slice(-4),
            mobile,
            password,
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        writeDB(db);

        res.json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 2. Login User
app.post('/api/login', (req, res) => {
    try {
        const { input, password } = req.body;
        const db = readDB();

        const user = db.users.find(u => u.mobile === input && u.password === password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. Create Order
app.post('/api/checkout', (req, res) => {
    try {
        const { customerName, customerMobile, gameUID, axisToken, item, price, quantity } = req.body;
        const db = readDB();

        // Validate UID (8+ digits)
        if (!gameUID || gameUID.length < 8 || !/^\d+$/.test(gameUID)) {
            return res.status(400).json({ message: 'Game UID must be at least 8 digits' });
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

        db.orders.push(newOrder);
        writeDB(db);

        res.json({ success: true, order: newOrder });
    } catch (err) {
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// 4. Get User Orders
app.get('/api/orders/:mobile', (req, res) => {
    try {
        const db = readDB();
        const userOrders = db.orders.filter(o => o.customerMobile === req.params.mobile);
        // Sort by date desc
        userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        res.json(userOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// 5. Get All Orders (Admin)
app.get('/api/all-orders', (req, res) => {
    try {
        const db = readDB();
        const allOrders = [...db.orders];
        allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        res.json(allOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// 6. Delete Order (Admin)
app.delete('/api/orders/:id', (req, res) => {
    try {
        const db = readDB();
        const initialLength = db.orders.length;
        db.orders = db.orders.filter(o => o._id !== req.params.id);

        if (db.orders.length === initialLength) {
            return res.status(404).json({ message: 'Order not found' });
        }

        writeDB(db);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

// 7. Update Profile
app.post('/api/update-profile', (req, res) => {
    try {
        const { mobile, newName } = req.body;
        const db = readDB();

        const userIndex = db.users.findIndex(u => u.mobile === mobile);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.users[userIndex].name = newName;
        writeDB(db);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// ==================== ADMIN & PRODUCT APIs ====================

// 8. Admin Login
app.post('/api/admin-login', (req, res) => {
    try {
        const { email, password } = req.body;
        const db = readDB();

        if (email === db.settings.adminEmail && password === db.settings.adminPassword) {
            res.json({ success: true, admin: true });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 9. Get All Products
app.get('/api/products', (req, res) => {
    try {
        const db = readDB();
        res.json(db.products || []);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// 10. Add Product
app.post('/api/products', (req, res) => {
    try {
        const { name, price, image, inStock } = req.body;
        const db = readDB();

        const newProduct = {
            _id: Date.now().toString(),
            name,
            price: parseFloat(price),
            image: image || 'garena-free-fire-max-logo (1).avif',
            inStock: inStock !== false
        };

        db.products.push(newProduct);
        writeDB(db);

        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ message: 'Error adding product' });
    }
});

// 11. Update Product
app.put('/api/products/:id', (req, res) => {
    try {
        const { name, price, image, inStock } = req.body;
        const db = readDB();

        const index = db.products.findIndex(p => p._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        db.products[index] = {
            ...db.products[index],
            name: name || db.products[index].name,
            price: price !== undefined ? parseFloat(price) : db.products[index].price,
            image: image || db.products[index].image,
            inStock: inStock !== undefined ? inStock : db.products[index].inStock
        };

        writeDB(db);
        res.json({ success: true, product: db.products[index] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// 12. Delete Product
app.delete('/api/products/:id', (req, res) => {
    try {
        const db = readDB();
        const initialLength = db.products.length;
        db.products = db.products.filter(p => p._id !== req.params.id);

        if (db.products.length === initialLength) {
            return res.status(404).json({ message: 'Product not found' });
        }

        writeDB(db);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// 13. Toggle Stock Status
app.put('/api/products/:id/stock', (req, res) => {
    try {
        const { inStock } = req.body;
        const db = readDB();

        const index = db.products.findIndex(p => p._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        db.products[index].inStock = inStock;
        writeDB(db);

        res.json({ success: true, product: db.products[index] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating stock' });
    }
});

// 14. Get Settings
app.get('/api/settings', (req, res) => {
    try {
        const db = readDB();
        // Don't expose password
        const safeSettings = { ...db.settings };
        delete safeSettings.adminPassword;
        res.json(safeSettings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// 15. Update Settings (Admin)
app.put('/api/settings', (req, res) => {
    try {
        const updates = req.body;
        const db = readDB();

        db.settings = { ...db.settings, ...updates };
        writeDB(db);

        res.json({ success: true, settings: db.settings });
    } catch (err) {
        res.status(500).json({ message: 'Error updating settings' });
    }
});

// 16. Update Order Status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const db = readDB();

        const index = db.orders.findIndex(o => o._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }

        db.orders[index].status = status;
        writeDB(db);

        res.json({ success: true, order: db.orders[index] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Database: Local File System (database.json)`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin-panel.html`);
});
