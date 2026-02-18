/* ============================================
   AMON HEIGHTS REAL ESTATE - EXPRESS SERVER
   Admin Dashboard Backend
   ============================================ */

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CONFIGURATION
// ============================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'amonheights2024', 10);

const PROPERTIES_FILE = path.join(__dirname, 'data', 'properties.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '_' + timestamp + ext;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF allowed.'));
        }
    }
});

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'amon-heights-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Admin authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function loadProperties() {
    try {
        if (fs.existsSync(PROPERTIES_FILE)) {
            const data = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading properties:', error);
    }
    return [];
}

function saveProperties(properties) {
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
}

// ============================================
// PUBLIC ROUTES
// ============================================

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Get all properties
app.get('/api/properties', (req, res) => {
    const properties = loadProperties();
    // Only return visible properties for public view
    const visibleProperties = properties.filter(p => p.visible !== false);
    res.json(visibleProperties);
});

// ============================================
// ADMIN ROUTES
// ============================================

// Admin login page
app.get('/admin', (req, res) => {
    if (req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Admin dashboard page
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Admin login API
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        req.session.adminId = 'admin';
        return res.json({ success: true, message: 'Login successful' });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

// Admin logout API
app.post('/api/admin/logout', requireAuth, (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Admin: Get all properties (including hidden)
app.get('/api/admin/properties', requireAuth, (req, res) => {
    const properties = loadProperties();
    res.json(properties);
});

// Admin: Upload property image
app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
});

// Admin: Add new property
app.post('/api/admin/properties', requireAuth, (req, res) => {
    const {
        name,
        location,
        category,
        price,
        description,
        fullDescription,
        image,
        video,
        amenities,
        visible
    } = req.body;

    if (!name || !location || !category || !price || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const properties = loadProperties();
    const newProperty = {
        id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
        name,
        location,
        category,
        price,
        description,
        fullDescription: fullDescription || description,
        image,
        video: video || '',
        amenities: amenities || [],
        visible: visible !== false,
        createdAt: new Date().toISOString()
    };

    properties.push(newProperty);
    saveProperties(properties);

    res.status(201).json({ success: true, property: newProperty });
});

// Admin: Update property
app.put('/api/admin/properties/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const properties = loadProperties();
    const propertyIndex = properties.findIndex(p => p.id == id);

    if (propertyIndex === -1) {
        return res.status(404).json({ error: 'Property not found' });
    }

    properties[propertyIndex] = {
        ...properties[propertyIndex],
        ...updates,
        id: parseInt(id) // Ensure ID doesn't change
    };

    saveProperties(properties);

    res.json({ success: true, property: properties[propertyIndex] });
});

// Admin: Delete property
app.delete('/api/admin/properties/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    let properties = loadProperties();
    const initialLength = properties.length;

    properties = properties.filter(p => p.id != id);

    if (properties.length === initialLength) {
        return res.status(404).json({ error: 'Property not found' });
    }

    saveProperties(properties);

    res.json({ success: true, message: 'Property deleted' });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum 10MB.' });
        }
    }
    
    res.status(500).json({ error: err.message || 'Server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    │  AMON HEIGHTS REAL ESTATE              │
    │  Server running on http://localhost:${PORT}│
    │  Admin dashboard: http://localhost:${PORT}/admin│
    ╚════════════════════════════════════════╝
    `);
});
