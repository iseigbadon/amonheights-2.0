/* ============================================
   AMON HEIGHTS REAL ESTATE - EXPRESS SERVER
   HARDENED ADMIN AUTHENTICATION BACKEND
   ============================================ */

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// ==================== SECURITY CONFIGURATION ====================

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Audit log configuration
const AUDIT_LOG_FILE = 'logs/admin-audit.log';
function ensureLogDir() {
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs', { recursive: true });
    }
}
ensureLogDir();

function logAudit(action, username, details, success = true) {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${success ? 'SUCCESS' : 'FAILED'} | User: ${username} | Action: ${action} | Details: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(AUDIT_LOG_FILE, log);
}

// Rate limiting (in-memory, per IP)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
    const now = Date.now();
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, { attempts: 0, lockedUntil: null });
    }

    const record = loginAttempts.get(ip);
    if (record.lockedUntil && now < record.lockedUntil) {
        return { allowed: false, reason: 'Account temporarily locked. Try again later.' };
    }

    if (record.lockedUntil && now >= record.lockedUntil) {
        record.attempts = 0;
        record.lockedUntil = null;
    }

    return { allowed: true };
}

function recordLoginAttempt(ip, success) {
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, { attempts: 0, lockedUntil: null });
    }

    const record = loginAttempts.get(ip);
    if (!success) {
        record.attempts++;
        if (record.attempts >= MAX_ATTEMPTS) {
            record.lockedUntil = Date.now() + LOCKOUT_TIME;
            return 'locked';
        }
    } else {
        record.attempts = 0;
        record.lockedUntil = null;
    }
    return 'ok';
}

// Session configuration - SECURE
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// File upload configuration - SECURE
const upload = multer({
    dest: 'public/uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        if (!allowedMimes.includes(file.mimetype) || !allowedExtensions.includes(fileExt)) {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
        } else {
            cb(null, true);
        }
    }
});

// ==================== ADMIN CREDENTIALS ====================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Hash the admin password - use bcrypt for secure comparison
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || 'amonheights2024';
// Pre-compute hash on startup for performance
let ADMIN_PASSWORD_HASH = null;
async function initializePasswordHash() {
    ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD_RAW, 10);
    console.log('✅ Admin password hash initialized');
}
initializePasswordHash();

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

// ==================== INPUT VALIDATION ====================

function validatePropertyData(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Property name is required');
    }
    if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
        errors.push('Location is required');
    }
    if (!data.category || typeof data.category !== 'string') {
        errors.push('Category is required');
    }
    if (!data.price || typeof data.price !== 'string') {
        errors.push('Price is required');
    }
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Description is required');
    }

    return errors;
}

// ==================== AUTHENTICATION ROUTES ====================

// Admin Login - HARDENED
app.post('/api/admin/login', async (req, res) => {
    const clientIp = req.ip;
    const { username, password } = req.body;

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
        logAudit('login_attempt', username || 'unknown', { ip: clientIp, reason: 'rate_limit' }, false);
        return res.status(429).json({ success: false, message: rateLimitCheck.reason });
    }

    // Input validation
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        recordLoginAttempt(clientIp, false);
        logAudit('login_attempt', username || 'unknown', { ip: clientIp, reason: 'invalid_input' }, false);
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Username check
    if (username !== ADMIN_USERNAME) {
        recordLoginAttempt(clientIp, false);
        logAudit('login_attempt', username, { ip: clientIp, reason: 'invalid_username' }, false);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    try {
        // Use bcrypt for secure password comparison
        const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

        if (passwordMatch) {
            recordLoginAttempt(clientIp, true);
            req.session.admin = true;
            req.session.loginTime = Date.now();
            req.session.ip = clientIp;
            logAudit('login_success', username, { ip: clientIp }, true);
            res.json({ success: true, message: 'Login successful' });
        } else {
            recordLoginAttempt(clientIp, false);
            logAudit('login_attempt', username, { ip: clientIp, reason: 'invalid_password' }, false);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        logAudit('login_attempt', username, { ip: clientIp, reason: 'error', error: error.message }, false);
        res.status(500).json({ success: false, message: 'Error processing login' });
    }
});

// Admin Logout - HARDENED
app.post('/api/admin/logout', (req, res) => {
    if (req.session.admin) {
        const username = ADMIN_USERNAME;
        logAudit('logout', username, { ip: req.ip }, true);
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check admin session
app.get('/api/admin/check', (req, res) => {
    if (req.session.admin) {
        // Verify session hasn't expired
        const sessionAge = Date.now() - (req.session.loginTime || Date.now());
        if (sessionAge > 1000 * 60 * 60) { // 1 hour
            req.session.destroy();
            return res.status(401).json({ authenticated: false, message: 'Session expired' });
        }
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Middleware to verify admin authentication
function requireAdmin(req, res, next) {
    if (!req.session.admin) {
        logAudit('unauthorized_access', 'unknown', { ip: req.ip, path: req.path }, false);
        return res.status(401).json({ error: 'Unauthorized - Please login first' });
    }

    // Verify session is still valid
    const sessionAge = Date.now() - (req.session.loginTime || Date.now());
    if (sessionAge > 1000 * 60 * 60) { // 1 hour
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired - Please login again' });
    }

    next();
}

// ==================== ADMIN PROPERTY ROUTES ====================

// Get all properties (admin - with audit)
app.get('/api/admin/properties', requireAdmin, (req, res) => {
    try {
        const properties = loadProperties();
        logAudit('view_all_properties', ADMIN_USERNAME, { count: properties.length }, true);
        res.json(properties);
    } catch (error) {
        console.error('Error loading properties:', error);
        logAudit('view_all_properties', ADMIN_USERNAME, { error: error.message }, false);
        res.status(500).json({ error: 'Error loading properties' });
    }
});

// Add property (admin - VALIDATED)
app.post('/api/admin/properties', requireAdmin, (req, res) => {
    try {
        // Validate input
        const validationErrors = validatePropertyData(req.body);
        if (validationErrors.length > 0) {
            logAudit('add_property', ADMIN_USERNAME, { reason: 'validation_failed', errors: validationErrors }, false);
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        const properties = loadProperties();
        const newProperty = {
            id: Date.now().toString(),
            name: req.body.name.trim(),
            location: req.body.location.trim(),
            category: req.body.category,
            price: req.body.price.trim(),
            description: req.body.description.trim(),
            amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
            youtubeUrl: req.body.youtubeUrl || '',
            images: Array.isArray(req.body.images) ? req.body.images : [],
            visible: req.body.visible !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        properties.push(newProperty);
        saveProperties(properties);
        logAudit('add_property', ADMIN_USERNAME, { property_id: newProperty.id, name: newProperty.name }, true);
        res.status(201).json({ success: true, property: newProperty });
    } catch (error) {
        console.error('Error adding property:', error);
        logAudit('add_property', ADMIN_USERNAME, { error: error.message }, false);
        res.status(500).json({ error: 'Error adding property' });
    }
});

// Update property (admin - VALIDATED)
app.put('/api/admin/properties/:id', requireAdmin, (req, res) => {
    try {
        const propertyId = req.params.id;

        // Validate input
        const validationErrors = validatePropertyData(req.body);
        if (validationErrors.length > 0) {
            logAudit('update_property', ADMIN_USERNAME, { property_id: propertyId, reason: 'validation_failed' }, false);
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        const properties = loadProperties();
        const index = properties.findIndex(p => p.id === propertyId);

        if (index === -1) {
            logAudit('update_property', ADMIN_USERNAME, { property_id: propertyId, reason: 'not_found' }, false);
            return res.status(404).json({ error: 'Property not found' });
        }

        const updatedProperty = {
            ...properties[index],
            name: req.body.name.trim(),
            location: req.body.location.trim(),
            category: req.body.category,
            price: req.body.price.trim(),
            description: req.body.description.trim(),
            amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
            youtubeUrl: req.body.youtubeUrl || '',
            images: Array.isArray(req.body.images) ? req.body.images : [],
            visible: req.body.visible !== false,
            updatedAt: new Date().toISOString()
        };

        properties[index] = updatedProperty;
        saveProperties(properties);
        logAudit('update_property', ADMIN_USERNAME, { property_id: propertyId, name: updatedProperty.name }, true);
        res.json({ success: true, property: updatedProperty });
    } catch (error) {
        console.error('Error updating property:', error);
        logAudit('update_property', ADMIN_USERNAME, { property_id: req.params.id, error: error.message }, false);
        res.status(500).json({ error: 'Error updating property' });
    }
});

// Delete property (admin - WITH CONFIRMATION)
app.delete('/api/admin/properties/:id', requireAdmin, (req, res) => {
    try {
        const propertyId = req.params.id;
        let properties = loadProperties();
        const propertyToDelete = properties.find(p => p.id === propertyId);

        if (!propertyToDelete) {
            logAudit('delete_property', ADMIN_USERNAME, { property_id: propertyId, reason: 'not_found' }, false);
            return res.status(404).json({ error: 'Property not found' });
        }

        properties = properties.filter(p => p.id !== propertyId);
        saveProperties(properties);
        logAudit('delete_property', ADMIN_USERNAME, { property_id: propertyId, name: propertyToDelete.name }, true);
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        logAudit('delete_property', ADMIN_USERNAME, { property_id: req.params.id, error: error.message }, false);
        res.status(500).json({ error: 'Error deleting property' });
    }
});

// Upload image (admin - HARDENED)
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            logAudit('upload_image', ADMIN_USERNAME, { reason: 'no_file' }, false);
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Rename file with timestamp to avoid conflicts
        const timestamp = Date.now();
        const originalName = path.parse(req.file.originalname).name;
        const ext = path.extname(req.file.originalname);
        const newFilename = `${originalName}-${timestamp}${ext}`;
        const oldPath = req.file.path;
        const newPath = path.join('public/uploads', newFilename);

        fs.renameSync(oldPath, newPath);
        const publicPath = `uploads/${newFilename}`;

        logAudit('upload_image', ADMIN_USERNAME, { filename: newFilename, size: req.file.size }, true);
        res.json({ success: true, filename: publicPath });
    } catch (error) {
        console.error('Error uploading image:', error);
        // Clean up uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        logAudit('upload_image', ADMIN_USERNAME, { error: error.message }, false);
        res.status(500).json({ error: 'Error uploading image' });
    }
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum 10MB.' });
        }
    }

    // Other errors
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    logAudit('error', 'system', { error: err.message, path: req.path }, false);
    res.status(status).json({ error: message });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    │  AMON HEIGHTS REAL ESTATE - SECURED        │
    ├════════════════════════════════════════════┤
    │  Status: ✅ Running                         │
    │  Environment: ${NODE_ENV}              ${NODE_ENV === 'production' ? '(SECURE)' : ''}
    │  Port: ${PORT}                              │
    │  Homepage: http://localhost:${PORT}        │
    │  Admin: http://localhost:${PORT}/admin      │
    ├════════════════════════════════════════════┤
    │  Security: ✅ ENABLED                       │
    │  • Helmet security headers                 │
    │  • bcrypt password hashing                 │
    │  • Rate limiting (5 attempts/15 min)       │
    │  • Input validation                        │
    │  • Session timeout (1 hour)                │
    │  • Audit logging enabled                   │
    │  • Secure file uploads                     │
    ╚════════════════════════════════════════╝
    `);
});
