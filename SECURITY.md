# AMON HEIGHTS - SECURITY CONFIGURATION GUIDE

## 🔐 Before Going Live

Complete this checklist before deploying to production.

---

## 1. Change Admin Credentials

### Current Default (⚠️ INSECURE)
```
Username: admin
Password: amonheights2024
```

### Generate Strong Credentials

**Username** (optional, keep as 'admin' or change):
```bash
# Generate username (alphanumeric, 8-20 chars)
node -e "console.log(require('crypto').randomBytes(10).toString('hex'))"
```

**Password** (MUST change):
```bash
# Generate random password
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Or create passphrase:
```
Format: [verb]-[adjective]-[noun]-[number]
Example: Launch-Premium-Estates-2024
```

### Update .env File
```env
ADMIN_USERNAME=your-new-username
ADMIN_PASSWORD=your-new-secure-password
```

### Verify Changes
1. Stop server: `Ctrl+C`
2. Start server: `npm start`
3. Test login at http://localhost:3000/admin
4. Confirm new credentials work

---

## 2. Generate Secure Session Secret

Default: `your-super-secret-session-key-change-in-production`

### Generate New Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save output and update .env:
```env
SESSION_SECRET=your-output-here
```

Example output:
```
7f8e9d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f
```

---

## 3. Enable HTTPS in Production

### Update server.js (line ~23)
```javascript
cookie: {
    secure: process.env.NODE_ENV === 'production',  // ✅ This auto-enables HTTPS check
    httpOnly: true,
    sameSite: 'strict'
}
```

### Get SSL Certificate (Let's Encrypt - Free)

**For Heroku:**
Heroku provides free SSL - no action needed.

**For Self-Hosted:**
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate paths:
# Certificate: /etc/letsencrypt/live/your-domain.com/fullchain.pem
# Key: /etc/letsencrypt/live/your-domain.com/privkey.pem
```

**For DigitalOcean/AWS:**
Use their certificate services or Certbot.

---

## 4. Secure Password Storage (Advanced)

Instead of plain text password:

### Step 1: Generate Hash
```bash
node -e "console.log(require('bcrypt').hashSync('your-password-here', 10))"
```

Output example:
```
$2b$10$x8Y/jZ.K9dPqf.GhLnK.q.O9YdN3EjQ4TM2.1QpW1M5.9Yyz8L6u6
```

### Step 2: Update .env
```env
# Option 1: Keep plaintext (simple, but less secure)
ADMIN_PASSWORD=your-password

# Option 2: Use hash (recommended for production)
ADMIN_PASSWORD_HASH=$2b$10$x8Y/jZ.K9dPqf.GhLnK.q.O9YdN3EjQ4TM2.1QpW1M5.9Yyz8L6u6
# Remove ADMIN_PASSWORD line
```

### Step 3: Update server.js
```javascript
// Line ~15-17
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'amonheights2024', 10);
```

If using only hash:
```javascript
// Line ~15
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
    bcrypt.hashSync('fallback-password', 10);
```

### Step 4: Restart Server
```bash
npm start
```

---

## 5. Important Environment Variables

### Development (.env)
```env
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=amonheights2024
SESSION_SECRET=your-super-secret-session-key-change-in-production
```

### Production (.env)
```env
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=your-custom-username
ADMIN_PASSWORD_HASH=$2b$10$...hash...
SESSION_SECRET=7f8e9d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f
```

---

## 6. Database Backup Security

### Backup Configuration

Create `backup.js`:
```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function backupProperties() {
    const date = new Date().toISOString().split('T')[0];
    const sourceFile = path.join(__dirname, 'data', 'properties.json');
    const backupDir = path.join(__dirname, 'backups');
    
    // Create backup directory if not exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup
    const backupFile = path.join(backupDir, `properties-${date}.json`);
    fs.copyFileSync(sourceFile, backupFile);
    
    console.log(`✅ Backup created: ${backupFile}`);
}

// Run backup daily
backupProperties();
```

### Add to package.json
```json
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "backup": "node backup.js"
}
```

### Schedule Backup (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line (daily at 2 AM)
0 2 * * * cd /path/to/app && npm run backup
```

---

## 7. File Upload Security

Current security in `server.js` (lines ~65-75):

✅ File size limit: 10MB
✅ Allowed types: JPEG, PNG, WebP, GIF
✅ Files stored in `public/uploads/`

### Optional: Add More Restrictions

```javascript
// Additional filename sanitization
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .slice(0, 255);
};

// In storage config:
filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = sanitizeFilename(file.fieldname) + '_' + timestamp + ext;
    cb(null, safeName);
}
```

---

## 8. API Security Headers

Add to `server.js` (top of middleware section):

```javascript
// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
```

Or use helmet.js (production):
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 9. Rate Limiting (Prevent Brute Force)

Install:
```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
});

// Use on login endpoint
app.post('/api/admin/login', loginLimiter, (req, res) => {
    // ... existing code
});
```

---

## 10. Production Deployment Checklist

```
SECURITY
[x] Changed ADMIN_USERNAME & ADMIN_PASSWORD
[x] Generated new SESSION_SECRET
[x] Set NODE_ENV=production
[x] Enabled HTTPS/SSL
[x] Added security headers
[x] Implemented rate limiting
[x] Configured file upload restrictions
[x] Set up automated backups
[x] Reviewed .gitignore

PERFORMANCE
[x] Optimized images
[x] Enabled gzip compression
[x] Set up caching headers
[x] Used CDN for assets (optional)

MONITORING
[x] Error logging configured
[x] Backup verification tested
[x] Uptime monitoring enabled
[x] Security monitoring active

COMPLIANCE
[x] Privacy policy reviewed
[x] Terms of service reviewed
[x] Data retention policy set
[x] GDPR compliance verified (if applicable)
```

---

## 11. Ongoing Security Maintenance

### Weekly
- Monitor admin login attempts in logs
- Review backup integrity
- Check for disk space issues

### Monthly
- Update Node.js dependencies: `npm update`
- Review security advisories: `npm audit`
- Test backup restoration
- Review access logs for suspicious activity

### Quarterly
- Update SSL certificate
- Rotate session secret
- Audit user permissions
- Review security configurations

### Annually
- Full security audit
- Dependency upgrade cycle
- Penetration testing (recommended)
- Security training for team

---

## 12. Emergency Response

### If Credentials Are Compromised
```bash
# 1. Immediately change password
# 2. Generate new session secret
# 3. Clear all active sessions
# 4. Review access logs for unauthorized access
# 5. Restore from latest clean backup if needed
```

### If Server Is Hacked
```bash
# 1. Take server offline immediately
# 2. Restore from clean backup
# 3. Audit all changes
# 4. Update all credentials
# 5. Run security scan
# 6. Deploy patched version
```

---

## 📞 Security Support

Report security issues:
- **Email**: security@amonheights.com
- **Do NOT** publish vulnerability publicly
- Expected response time: 24 hours
- Will be fixed within 72 hours

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [SSL/TLS Guide](https://www.ssl.com/article/how-to-setup-ssl-certificate-on-nginx/)

---

**Status**: Critical Security Configuration
**Last Updated**: 2024
**Review Frequency**: Before ogni production deployment
