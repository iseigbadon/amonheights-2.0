# AMON HEIGHTS REAL ESTATE - QUICK START GUIDE

## ⚡ 5-Minute Quick Start

### Step 1: Install Dependencies
```bash
cd "Amonheights LTD"
npm install
```

### Step 2: Configure Admin Credentials
Edit `.env`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Step 3: Start Server
```bash
npm start
```

### Step 4: Access
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

---

## 🚀 First Time Setup (Complete)

### 1. Initialize Project
```bash
cd "Amonheights LTD"
npm install
```

### 2. Customize Environment
```bash
# Edit .env file
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_strong_password
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PORT=3000
```

### 3. Start Development Server
```bash
npm run dev
```

Output:
```
╔════════════════════════════════════════╗
│  AMON HEIGHTS REAL ESTATE              │
│  Server running on http://localhost:3000│
│  Admin dashboard: http://localhost:3000/admin│
╚════════════════════════════════════════╝
```

### 4. First Admin Login
- URL: http://localhost:3000/admin
- Username: (from `.env` ADMIN_USERNAME)
- Password: (from `.env` ADMIN_PASSWORD)

### 5. Add Your First Property
1. Go to Admin Dashboard
2. Click "Add Property"
3. Fill in details:
   - Property name
   - Location
   - Category (Sale/Rent/Short-Let)
   - Price
   - Description
   - Upload image
   - (Optional) Add YouTube embed link
   - Add amenities
4. Click "Save Property"

### 6. View on Public Site
- Go to http://localhost:3000
- Properties appear immediately
- Click "Explore Properties" to see listings

---

## 📱 Testing on Mobile

### Local Network Access
```bash
# Find your IP address
# Windows: ipconfig
# Mac/Linux: ifconfig

# Access from phone: http://YOUR_IP:3000
```

### Features to Test
- [ ] Mobile header navigation
- [ ] Hero section responsiveness
- [ ] Property card layout
- [ ] Filter functionality
- [ ] Property detail modal
- [ ] WhatsApp integration
- [ ] Image uploads
- [ ] Form validation

---

## 🔐 Security Checklist

Before any production deployment:

```
[ ] Change ADMIN_PASSWORD to strong password (12+ chars, mixed case, numbers)
[ ] Generate new SESSION_SECRET
[ ] Set NODE_ENV=production in .env
[ ] Configure HTTPS/SSL
[ ] Set secure=true in session cookie config
[ ] Review .gitignore (never commit .env)
[ ] Add rate limiting to login endpoint
[ ] Set up automated backups for properties.json
[ ] Implement CORS if needed
[ ] Add security headers (helmet.js)
[ ] Test file upload security
```

---

## 📦 Production Deployment

### Option 1: Heroku (Easiest)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create amon-heights-abuja

# Set environment variables
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your-super-secure-password
heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

URL: `https://amon-heights-abuja.herokuapp.com`

### Option 2: DigitalOcean / Linode / AWS

```bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Clone repository
git clone your-repo-url
cd "Amonheights LTD"

# Install dependencies
npm install

# Create .env
nano .env
# (Add secure credentials)

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name "amon-heights"
pm2 startup
pm2 save

# Install Nginx
sudo apt install nginx

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/default
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name amon-heights.com www.amon-heights.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name amon-heights.com www.amon-heights.com;

    ssl_certificate /etc/letsencrypt/live/amon-heights.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amon-heights.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Setup SSL:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d amon-heights.com
```

Restart services:
```bash
sudo systemctl restart nginx
pm2 restart amon-heights
```

### Option 3: Docker (Advanced)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `.dockerignore`:
```
node_modules
.env.local
.git
public/uploads
```

Build and run:
```bash
docker build -t amon-heights .
docker run -p 3000:3000 --env-file .env amon-heights
```

---

## 📊 Monitoring & Maintenance

### Monitor Server Health
```bash
# With PM2
pm2 monit

# View logs
pm2 logs amon-heights
```

### Backup Properties
```bash
# Daily backup script (crontab)
0 2 * * * cp /app/data/properties.json /backups/properties-$(date +\%Y\%m\%d).json
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart application
pm2 restart amon-heights
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'express'"
**Solution**: Run `npm install`

### Problem: "Port 3000 already in use"
**Solution**: 
- Change PORT in .env to 3001
- Or kill process: `lsof -i :3000 | grep node | awk '{print $2}' | xargs kill`

### Problem: Admin login fails
**Solution**:
- Verify .env credentials
- Clear browser cookies
- Check server logs: `npm run dev`

### Problem: Images not uploading
**Solution**:
- Check `public/uploads/` directory exists
- Verify file permissions: `chmod 755 public/uploads`
- Check file size < 10MB
- Supported formats: JPEG, PNG, WebP, GIF

### Problem: WhatsApp link not working
**Solution**:
- Verify phone number format in script.js
- Check URL encoding in openWhatsApp() function
- Test on mobile device

---

## 💡 Tips & Best Practices

### Performance
- Optimize images before uploading (compress to <2MB)
- Use lazy loading for property images
- Enable gzip compression in Nginx
- Cache static assets with long expiration

### User Experience
- Write compelling property descriptions
- Use high-quality images (1200x800px minimum)
- Keep amenities concise and relevant
- Test WhatsApp messaging on actual devices

### Maintenance
- Regularly backup properties.json
- Monitor server disk space
- Update Node.js and dependencies quarterly
- Review admin logs for suspicious activity

---

## 📞 Support

For issues or questions:
- **Email**: support@amonheights.com
- **WhatsApp**: +234 901 444 3333
- **Office**: Suite 106, Holborn House, Apo, Abuja

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024
