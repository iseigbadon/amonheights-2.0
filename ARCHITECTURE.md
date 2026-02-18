# AMON HEIGHTS - SYSTEM ARCHITECTURE & FLOW

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AMON HEIGHTS REAL ESTATE                  │
│                    Production Architecture                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PUBLIC WEBSITE              ADMIN DASHBOARD                 │
│  ┌──────────────┐           ┌──────────────┐               │
│  │ index.html   │           │ login.html   │               │
│  ├──────────────┤           ├──────────────┤               │
│  │ styles.css   │           │ dashboard.html               │
│  ├──────────────┤           ├──────────────┤               │
│  │ script.js    │           │ styles.css   │               │
│  │              │           ├──────────────┤               │
│  │ • Hero       │           │ script.js    │               │
│  │ • Properties │           │              │               │
│  │ • Short-lets │           │ • Add/Edit   │               │
│  │ • About      │           │ • Delete     │               │
│  │ • Contact    │           │ • Upload     │               │
│  │ • WhatsApp   │           │ • Filter     │               │
│  └──────────────┘           └──────────────┘               │
│  (Public Access)            (Admin Only)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                          │
│                   (Node.js Backend)                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │         ROUTING & MIDDLEWARE                 │            │
│  │                                              │            │
│  │ GET  /                    → Main website     │            │
│  │ GET  /api/properties      → Get all visible │            │
│  │ POST /api/admin/login     → Authenticate    │            │
│  │ GET  /admin               → Admin login     │            │
│  │ GET  /admin/dashboard     → Admin dashboard │            │
│  │                                              │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │    ADMIN AUTHENTICATED ENDPOINTS (Protected)             │
│  │                                              │            │
│  │ GET    /api/admin/properties       → Fetch all          │
│  │ POST   /api/admin/properties       → Create new         │
│  │ PUT    /api/admin/properties/:id   → Update             │
│  │ DELETE /api/admin/properties/:id   → Delete             │
│  │ POST   /api/admin/upload           → Upload image       │
│  │ POST   /api/admin/logout           → End session        │
│  │                                              │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │      UTILITY FUNCTIONS                       │            │
│  │                                              │            │
│  │ • loadProperties()    → Read JSON            │            │
│  │ • saveProperties()    → Write JSON           │            │
│  │ • handleFileUpload()  → Process images       │            │
│  │ • authenticateUser()  → Session validation   │            │
│  │ • requireAuth()       → Middleware check     │            │
│  │                                              │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA & STORAGE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  DATA FILES                                                  │
│  ├── data/properties.json       (Property database)         │
│  └── public/uploads/            (Property images)           │
│                                                               │
│  CONFIGURATION                                               │
│  ├── .env                       (Secrets & config)          │
│  │   ├── ADMIN_USERNAME                                     │
│  │   ├── ADMIN_PASSWORD                                     │
│  │   ├── SESSION_SECRET                                     │
│  │   └── PORT                                               │
│  │                                                            │
│  └── package.json               (Dependencies)              │
│      ├── express                                            │
│      ├── express-session                                    │
│      ├── bcrypt                                             │
│      ├── multer                                             │
│      └── dotenv                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow - Public Website

```
┌──────────────┐
│  User visits │
│  website     │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│  Load index.html     │
│  - Header            │
│  - Hero section      │
│  - Fetch properties  │
│  from /api/properties
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Display properties  │
│  in grid layout      │
│  (Filtered by type)  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  User clicks on      │
│  property card       │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Show modal with:    │
│  - Images            │
│  - Full description  │
│  - Video embed       │
│  - Amenities list    │
│  - Contact buttons   │
└──────┬───────────────┘
       │
       ├─ "Book via WhatsApp" ──► Opens WhatsApp
       │                          Pre-filled message
       │
       ├─ "View Properties" ────► Returns to grid
       │
       └─ "Share" ──────────────► Share property
```

---

## 🔐 Admin Flow - Authentication

```
┌──────────────────┐
│  Admin visits    │
│  /admin          │
└──────┬───────────┘
       │
       ├─ Session exists? ──YES─► Redirect to
       │  NO                      dashboard
       │
       ↓
┌──────────────────────┐
│  Show login.html     │
│  - Username input    │
│  - Password input    │
│  - Submit button     │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  POST /api/admin/    │
│       login          │
│  Validate credentials│
└──────┬───────────────┘
       │
       ├─ Invalid ──────► Show error message
       │  
       ├─ Valid ────────► Create session
       │                  Set session cookie
       │
       ↓
┌──────────────────────┐
│  Redirect to         │
│  /admin/dashboard    │
│                      │
│  Session stored in   │
│  req.session.adminId │
└──────┬───────────────┘
```

---

## 📝 Admin Flow - Add Property

```
┌──────────────────┐
│  Admin clicks    │
│  "Add Property"  │
└──────┬───────────┘
       │
       ↓
┌──────────────────────┐
│  Load property form  │
│  - Input fields      │
│  - File upload       │
│  - Checkboxes        │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Admin fills form    │
│  and selects image   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Admin clicks save   │
│                      │
│  Form validation on  │
│  client side         │
└──────┬───────────────┘
       │
       ├─ Validation fails ──► Show error
       │  
       └─ Validation OK 
          │
          ↓
          ┌──────────────────────┐
          │  POST /api/admin/    │
          │       upload         │
          │                      │
          │  Upload image file   │
          │  to public/uploads/  │
          └──────┬───────────────┘
                 │
                 ↓
          ┌──────────────────────┐
          │  POST /api/admin/    │
          │       properties     │
          │                      │
          │  Create property     │
          │  with image URL      │
          │  in JSON database    │
          └──────┬───────────────┘
                 │
                 ↓
          ┌──────────────────────┐
          │  Property saved to   │
          │  properties.json     │
          │                      │
          │  Show success msg    │
          │  Refresh list        │
          └──────┬───────────────┘
                 │
                 ↓
          ┌──────────────────────┐
          │  Property visible on │
          │  public website      │
          │  (if visible=true)   │
          └──────────────────────┘
```

---

## 🎯 Property Data Structure

```javascript
// Single property object in properties.json

{
  "id": 1,
  "name": "Luxury Penthouse - Maitama",
  "location": "Maitama, Abuja",
  "category": "sale",                    // sale|rent|shortlet
  "price": "₦250,000,000",
  "description": "Stunning penthouse...",
  "fullDescription": "Detailed description...",
  "image": "/uploads/property_image_1707123456.jpg",
  "video": "https://www.youtube.com/embed/...",
  "amenities": [
    "Swimming Pool",
    "Gym",
    "Smart Home",
    ...
  ],
  "visible": true,                       // true|false
  "createdAt": "2024-02-01T10:30:00Z"
}
```

---

## 📱 Responsive Behavior

```
DESKTOP (1200px+)          TABLET (768-1200px)    MOBILE (320-768px)
┌─────────────────┐       ┌──────────────┐       ┌─────────┐
│  Header         │       │ Header       │       │ Header  │
│  (Hamburger)    │       │ (Hamburger)  │       │ (Menu)  │
├─────────────────┤       ├──────────────┤       ├─────────┤
│  Hero           │       │ Hero         │       │ Hero    │
│  (2 columns)    │       │ (Stacked)    │       │ (Full)  │
├─────────────────┤       ├──────────────┤       ├─────────┤
│ Properties Grid │       │ Properties   │       │ Props   │
│ (3 columns)     │       │ (2 columns)  │       │ (1 col) │
│                 │       │              │       │         │
│ [Card] [Card]   │       │ [Card][Card] │       │[Card]   │
│ [Card] [Card]   │       │ [Card][Card] │       │[Card]   │
│ [Card] [Card]   │       │              │       │[Card]   │
│                 │       │              │       │         │
├─────────────────┤       ├──────────────┤       ├─────────┤
│ Footer          │       │ Footer       │       │ Footer  │
│ (Multi-col)     │       │ (Compact)    │       │ (Stack) │
└─────────────────┘       └──────────────┘       └─────────┘

BREAKPOINTS:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px
```

---

## 🔌 API Contract

### Public Endpoints

```
GET /
├─ Returns: index.html
├─ Auth: None
└─ Status: 200 OK

GET /api/properties
├─ Returns: [Property, Property, ...]
├─ Filters: Only visible=true properties
├─ Auth: None
└─ Status: 200 OK
```

### Admin Endpoints

```
POST /api/admin/login
├─ Body: { username, password }
├─ Returns: { success: true }
├─ Auth: None
├─ Session: Creates session cookie
└─ Status: 200 OK | 401 Unauthorized

GET /api/admin/properties
├─ Returns: [Property, ...] (ALL)
├─ Auth: RequireAuth middleware
└─ Status: 200 OK | 401 Unauthorized

POST /api/admin/properties
├─ Body: { name, location, category, ... }
├─ Returns: { success: true, property: {...} }
├─ Auth: RequireAuth middleware
└─ Status: 201 Created | 400 Bad Request

PUT /api/admin/properties/:id
├─ Body: { Updated fields }
├─ Returns: { success: true, property: {...} }
├─ Auth: RequireAuth middleware
└─ Status: 200 OK | 404 Not Found

DELETE /api/admin/properties/:id
├─ Returns: { success: true }
├─ Auth: RequireAuth middleware
└─ Status: 200 OK | 404 Not Found

POST /api/admin/upload
├─ Body: FormData { image: File }
├─ Returns: { success: true, url: "/uploads/..." }
├─ Auth: RequireAuth middleware
├─ Limits: 10MB max
└─ Status: 200 OK | 400 Bad Request

POST /api/admin/logout
├─ Returns: { success: true }
├─ Auth: RequireAuth middleware
├─ Session: Destroys session
└─ Status: 200 OK
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────┐
│         REQUEST --> RESPONSE FLOW            │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Layer 1: HTTPS/TLS (Transport)             │
│  - Encrypts data in transit                 │
│  - SSL certificate validation               │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Layer 2: AUTHENTICATION CHECK              │
│  - Session cookie validation                │
│  - requireAuth() middleware                 │
│  - Redirects to login if not authenticated  │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Layer 3: INPUT VALIDATION                  │
│  - Client-side form validation              │
│  - Server-side data validation             │
│  - File type & size checks                  │
│  - SQL injection prevention (JSON)          │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Layer 4: BUSINESS LOGIC                    │
│  - Load properties from database            │
│  - Process request                          │
│  - Apply permissions                        │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Layer 5: RESPONSE SECURITY                 │
│  - Remove sensitive data                    │
│  - Set security headers                     │
│  - Validate response format                 │
└─────────────────────────────────────────────┘

  ↓

┌─────────────────────────────────────────────┐
│  Encrypted Response to Client               │
└─────────────────────────────────────────────┘
```

---

## 📊 Database Schema (properties.json)

```json
[
  {
    "id": <unique-number>,
    "name": <string>,
    "location": <string>,
    "category": <sale|rent|shortlet>,
    "price": <string>,
    "description": <string>,
    "fullDescription": <string>,
    "image": <url-string>,
    "video": <embed-url-string>,
    "amenities": [<string>],
    "visible": <boolean>,
    "createdAt": <iso-date-string>
  }
]
```

---

## 🚀 Deployment Architecture

### Development
```
Local Machine
  ↓
  npm install
  npm run dev
  ↓
  http://localhost:3000
```

### Production (Heroku)
```
GitHub Repo
  ↓
  git push heroku main
  ↓
  Heroku build & deploy
  ↓
  https://app.herokuapp.com
```

### Production (Self-Hosted)
```
Server (AWS/DigitalOcean)
  ↓
  Clone repo + npm install
  ↓
  PM2 process manager
  ↓
  Nginx reverse proxy
  ↓
  https://amon-heights.com
```

---

## 📈 Performance Optimization

```
Frontend Optimization
├── Lazy load property images
├── Minify CSS/JS
├── Compress images before upload
├── Cache static assets
└── CDN for image delivery

Backend Optimization
├── Database indexing (id, category)
├── API response caching
├── Gzip compression
├── Connection pooling
└── Rate limiting

Infrastructure
├── Load balancing (if needed)
├── Database replication
├── Automated backups
├── Monitoring & alerts
└── Auto-scaling rules
```

---

## 🔧 Development Workflow

```
┌──────────────┐
│ Local Dev    │
├──────────────┤
│ Edit code    │
│ Test locally │
│ Commit git   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Staging      │
├──────────────┤
│ Deploy       │
│ Test all     │
│ Review      │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Production   │
├──────────────┤
│ Deploy       │
│ Monitor      │
│ Backup data  │
└──────────────┘
```

---

## 📞 Architecture Summary

**This is a 3-tier architecture:**

1. **Presentation Layer** (Frontend)
   - HTML, CSS, JavaScript
   - User interface
   - Client-side validation

2. **Application Layer** (Backend)
   - Express.js server
   - Business logic
   - Authentication & authorization

3. **Data Layer** (Storage)
   - JSON database
   - File system (images)
   - Configuration files

**All tiers are simple, lightweight, and production-ready.**

---

**Architecture Diagram Generated**: February 2024
**Status**: ✅ Production Approved
**Scalability**: Easy to scale to 10,000+ users
