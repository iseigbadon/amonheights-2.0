/* ============================================
   AMON HEIGHTS REAL ESTATE - EXPRESS SERVER
   Admin Dashboard Backend
   ============================================ */

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'amonheights-luxury-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// File upload configuration
const upload = multer({
    dest: 'public/uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'amonheights2024';

// Properties data file
const PROPERTIES_FILE = 'data/properties.json';

// Helper: Load properties from JSON
function loadProperties() {
    try {
        if (fs.existsSync(PROPERTIES_FILE)) {
            return JSON.parse(fs.readFileSync(PROPERTIES_FILE, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error loading properties:', error);
        return [];
    }
}

// Helper: Save properties to JSON
function saveProperties(properties) {
    try {
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data', { recursive: true });
        }
        fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
    } catch (error) {
        console.error('Error saving properties:', error);
    }
}

// ==================== ADMIN ROUTES ====================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.admin = true;
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.admin = false;
    res.json({ success: true });
});

// Check admin session
app.get('/api/admin/check', (req, res) => {
    if (req.session.admin) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Get all properties (admin)
app.get('/api/admin/properties', (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const properties = loadProperties();
    res.json(properties);
});

// Add property (admin)
app.post('/api/admin/properties', (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = loadProperties();
    const newProperty = {
        id: Date.now().toString(),
        name: req.body.name,
        location: req.body.location,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        amenities: req.body.amenities || [],
        youtubeUrl: req.body.youtubeUrl,
        images: req.body.images || [],
        visible: true,
        createdAt: new Date().toISOString()
    };

    properties.push(newProperty);
    saveProperties(properties);
    res.json({ success: true, property: newProperty });
});

// Update property (admin)
app.put('/api/admin/properties/:id', (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const properties = loadProperties();
    const index = properties.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Property not found' });
    }

    properties[index] = {
        ...properties[index],
        ...req.body,
        id: properties[index].id,
        createdAt: properties[index].createdAt
    };

    saveProperties(properties);
    res.json({ success: true, property: properties[index] });
});

// Delete property (admin)
app.delete('/api/admin/properties/:id', (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let properties = loadProperties();
    properties = properties.filter(p => p.id !== req.params.id);
    saveProperties(properties);
    res.json({ success: true, message: 'Property deleted' });
});

// Upload image (admin)
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `uploads/${req.file.filename}`;
    res.json({ success: true, filename });
});

// ==================== PUBLIC ROUTES ====================

// Get visible properties (public)
app.get('/api/properties', (req, res) => {
    const properties = loadProperties();
    const visibleProperties = properties.filter(p => p.visible !== false);
    res.json(visibleProperties);
});

// Get single property (public)
app.get('/api/properties/:id', (req, res) => {
    const properties = loadProperties();
    const property = properties.find(p => p.id === req.params.id && p.visible !== false);

    if (!property) {
        return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
});

// ==================== PAGE ROUTES ====================

// Serve admin login
app.get('/admin', (req, res) => {
    if (req.session.admin) {
        return res.sendFile(path.join(__dirname, 'admin/dashboard.html'));
    }
    res.sendFile(path.join(__dirname, 'admin/login.html'));
});

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
});
    │  Server running on http://localhost:${PORT}│
    │  Admin dashboard: http://localhost:${PORT}/admin│
    ╚════════════════════════════════════════╝
    `);
});
