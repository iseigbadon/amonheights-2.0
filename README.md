# Amon Heights Real Estate - Installation & Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

```bash
# Navigate to project directory
cd "Amonheights LTD"

# Install dependencies
npm install
```

## Configuration

1. **Edit `.env` file** with your settings:
   - `ADMIN_USERNAME`: Admin login username
   - `ADMIN_PASSWORD`: Admin login password
   - `SESSION_SECRET`: Session encryption key
   - `PORT`: Server port (default: 3000)

2. **For production**, ensure:
   - Strong password for ADMIN_PASSWORD
   - Cryptographically secure SESSION_SECRET
   - NODE_ENV set to "production"
   - HTTPS enabled

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:3000`

## Accessing the Website

- **Public Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
  - Default credentials: admin / amonheights2024
  - Change these immediately in production!

## Features

### Public Website
- Browse luxury properties
- Filter by category (Sale, Rent, Short-Let)
- View detailed property information
- Embedded YouTube property tours
- WhatsApp inquiry integration
- Fully responsive design

### Admin Dashboard
- Login with secure session
- Add/edit/delete properties
- Upload property images
- Add amenities and descriptions
- Embed YouTube video tours
- Toggle property visibility
- Manage all listings from one place

## File Structure

```
Amonheights LTD/
├── public/              # Frontend files
│   ├── index.html      # Main website
│   ├── styles.css      # Global styles
│   ├── script.js       # Frontend JavaScript
│   └── uploads/        # Property images (auto-created)
├── admin/              # Admin dashboard files
│   ├── login.html      # Admin login page
│   ├── dashboard.html  # Admin dashboard
│   ├── styles.css      # Admin styles
│   └── script.js       # Admin JavaScript
├── data/               # Data storage
│   └── properties.json # Property data (JSON format)
├── server.js           # Express server
├── package.json        # Dependencies
├── .env               # Configuration
└── README.md          # This file
```

## API Endpoints

### Public Endpoints
- `GET /` - Main website
- `GET /api/properties` - Get all visible properties

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/properties` - Get all properties (admin only)
- `POST /api/admin/properties` - Create property (admin only)
- `PUT /api/admin/properties/:id` - Update property (admin only)
- `DELETE /api/admin/properties/:id` - Delete property (admin only)
- `POST /api/admin/upload` - Upload image (admin only)

## Security Notes

⚠️ **Important Security Considerations**

1. **Never commit `.env` file** to version control
2. **Change default credentials** before any deployment
3. **Use HTTPS in production** - Plain HTTP is insecure
4. **Generate new SESSION_SECRET** - Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. **Hash passwords** - Don't store plain text passwords
6. **Validate all inputs** - Always validate on both client and server
7. **Limit file uploads** - Images are limited to 10MB
8. **Use environment variables** - Never hardcode secrets

## Generating Secure Password Hash

```bash
node -e "console.log(require('bcrypt').hashSync('your-password-here', 10))"
```

Then set `ADMIN_PASSWORD_HASH` in `.env` (remove `ADMIN_PASSWORD`).

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env to another number (e.g., 3001)
# Or kill the existing process:
# On Windows: netstat -ano | findstr :3000
```

### Images Not Uploading
- Check `public/uploads/` directory exists
- Verify file permissions
- Check file size (max 10MB)
- Supported formats: JPEG, PNG, WebP, GIF

### Admin Login Failed
- Verify credentials in `.env`
- Check SESSION_SECRET is set
- Clear browser cookies and try again
- Check server console for errors

## Deployment

### Heroku
```bash
# Install Heroku CLI
# Create app: heroku create your-app-name
# Set environment variables: heroku config:set ADMIN_PASSWORD=xxx
# Deploy: git push heroku main
```

### Digital Ocean / AWS / Azure
1. SSH into server
2. Clone repository
3. Install Node.js
4. Set environment variables via `.env`
5. Use PM2 for process management
6. Configure Nginx reverse proxy
7. Set up SSL with Let's Encrypt

## Support & Contact

For issues or questions:
- Contact: Amon Heights Real Estate Ltd
- Email: [your-email@amonheights.com]
- WhatsApp: +234 901 444 3333

---

Built with ❤️ for Amon Heights Real Estate Ltd
Production-ready, secure, and scalable.
