/* ============================================
   AMON HEIGHTS - FRONTEND JAVASCRIPT
   Complete System: Properties, Blog, Contact
   ============================================ */

// ========== LOAD DATA FROM STORAGE ==========
// Check if admin has saved updated data, otherwise use defaults
function loadBlogPosts() {
    const stored = localStorage.getItem('amonHeightsBlogPosts');
    return stored ? JSON.parse(stored) : [
        {
            id: 1,
            title: "Luxury Living in Abuja: A Guide to Premium Neighborhoods",
            author: "Sarah Johnson",
            date: "2024-01-15",
            image: "Images/abuja.jpg",
            excerpt: "Discover the most exclusive neighborhoods offering world-class living experiences and investment opportunities.",
            content: "Abuja's premium neighborhoods offer unparalleled luxury and convenience. From Maitama to Asokoro, each area provides unique advantages for investors and residents seeking high-end properties. This comprehensive guide covers lifestyle, amenities, investment potential, and what makes each location special. Learn about security features, community standards, and long-term value appreciation in these elite neighborhoods."
        },
        {
            id: 2,
            title: "Investment Guide: Why Nigerian Real Estate is the Future",
            author: "Michael Chen",
            date: "2024-01-10",
            image: "Images/living room 2.jpg",
            excerpt: "Explore compelling reasons why intelligent investors are focusing on Nigerian property markets.",
            content: "Nigerian real estate presents exceptional investment opportunities with strong growth potential. Economic development, increasing urbanization, rising demand for premium housing, and favorable demographics create a perfect storm of opportunity. This guide explores capital appreciation potential, rental yield possibilities, market trends, and portfolio diversification benefits. Learn from successful investors and understand why now is the ideal time to invest."
        },
        {
            id: 3,
            title: "Interior Design Trends: Creating the Perfect Luxury Home",
            author: "Emma Williams",
            date: "2024-01-05",
            image: "Images/living room 1.jpg",
            excerpt: "Master the art of luxury interior design with insights from top designers in Africa.",
            content: "Contemporary luxury design blends comfort with sophistication. Discover how to incorporate minimalism, natural materials, smart technology, and sustainable elements into your dream home. This article covers color palettes, furniture selection, lighting design, and how to work with interior designers to create personalized spaces that reflect your lifestyle and values. Includes case studies of award-winning luxury homes in Abuja."
        }
    ];
}

function loadProperties() {
    const stored = localStorage.getItem('amonHeightsProperties');
    return stored ? JSON.parse(stored) : [
        { id: 1, title: "Luxury Penthouse", type: "apartment", location: "Maitama", price: "850M", rating: "4.95", image: "Images/living room 2.jpg", beds: 4, baths: 3, size: "450 sqm", desc: "Stunning luxury apartment with premium finishes and breathtaking views." },
        { id: 2, title: "Executive Villa", type: "villa", location: "Asokoro", price: "1.2B", rating: "4.88", image: "Images/duplex and pool outdoor 1.jpg", beds: 5, baths: 4, size: "650 sqm", desc: "Contemporary villa with state-of-the-art features in exclusive neighborhood." },
        { id: 3, title: "Premium Duplex", type: "duplex", location: "Wuse II", price: "750M", rating: "4.92", image: "Images/duplex.jpg", beds: 4, baths: 3, size: "520 sqm", desc: "Spacious duplex with modern architecture and premium finishes." },
        { id: 4, title: "Luxury Shortlet", type: "shortlet", location: "Maitama", price: "2.5M/mo", rating: "4.90", image: "Images/shortlet1.jpg", beds: 3, baths: 2, size: "380 sqm", desc: "Fully furnished luxury apartment perfect for short-term stays." },
        { id: 5, title: "High-End Apartment", type: "apartment", location: "CBD", price: "680M", rating: "4.85", image: "Images/living room 1.jpg", beds: 3, baths: 2, size: "420 sqm", desc: "Modern apartment in prime business district location." },
        { id: 6, title: "Exclusive Estate", type: "villa", location: "Jahi", price: "1.4B", rating: "4.98", image: "Images/duplex and pool out door.jpg", beds: 6, baths: 5, size: "780 sqm", desc: "Magnificent estate with world-class amenities and sprawling grounds." },
    ];
}

// ========== BLOG DATA ==========
const blogPosts = loadBlogPosts();

// ========== PROPERTY DATA ==========
const properties = loadProperties();

let currentFilter = 'all';

// ========== RENDER PROPERTIES ==========
function renderProperties(data = properties) {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;
    
    grid.innerHTML = data.map(p => `
        <div class="card" onclick="openModal(${p.id})">
            <img src="${p.image}" alt="${p.title}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22280%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3C/svg%3E'">
            <div class="card-body">
                <div class="card-header">
                    <span class="card-title">${p.title}</span>
                    <span class="card-rating">★ ${p.rating}</span>
                </div>
                <div class="card-type">${p.type} • ${p.location}</div>
                <div class="card-price">₦${p.price}</div>
            </div>
        </div>
    `).join('');
}

// ========== FILTER PROPERTIES BY TYPE ==========
function filter(type) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const filtered = type === 'all' ? properties : properties.filter(p => p.type === type);
    renderProperties(filtered);
}

// ========== SEARCH PROPERTIES ==========
function filterBySearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const filtered = properties.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.location.toLowerCase().includes(query)
    );
    renderProperties(filtered);
}

// ========== OPEN PROPERTY MODAL ==========
function openModal(id) {
    const p = properties.find(x => x.id === id);
    if (!p) return;
    
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="modal-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22/%3E%3C/svg%3E'">
        <h2 class="modal-title">${p.title}</h2>
        <div class="modal-meta">
            <span>★ ${p.rating}</span>
            <span>${p.type}</span>
            <span>${p.location}</span>
        </div>
        <div class="modal-price">₦${p.price}</div>
        <p class="modal-desc">${p.desc}</p>
        <div class="modal-details">
            <div class="detail-item"><strong>Bedrooms</strong> ${p.beds}</div>
            <div class="detail-item"><strong>Bathrooms</strong> ${p.baths}</div>
            <div class="detail-item"><strong>Size</strong> ${p.size}</div>
        </div>
        <div class="modal-actions">
            <button class="btn-primary" onclick="contactWhatsApp('${p.title}')">Book Viewing</button>
            <button class="btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('active');
}

// ========== CLOSE MODAL ==========
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

// ========== RENDER BLOG POSTS ==========
function renderBlogPosts(data = blogPosts) {
    const container = document.getElementById('blogContainer');
    if (!container) return;
    
    container.innerHTML = data.map(post => `
        <article class="blog-card">
            <img src="${post.image}" alt="${post.title}" class="blog-image">
            <div class="blog-content">
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-meta">${post.date} • By ${post.author}</p>
                <p class="blog-excerpt">${post.excerpt}</p>
                <a href="blog-post.html?id=${post.id}" class="read-more">Read Full Article →</a>
            </div>
        </article>
    `).join('');
}

// ========== GET SINGLE BLOG POST ==========
function getBlogPost(id) {
    return blogPosts.find(p => p.id === parseInt(id));
}

// ========== CONTACT FUNCTIONS ==========
function contactWhatsApp(propertyName = 'property') {
    const message = `Hello Amon Heights, I'm interested in the ${propertyName}. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/2349000000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function contactEmail() {
    window.location.href = 'mailto:info@amonheights.com?subject=Property Inquiry&body=Hello Amon Heights Team, I am interested in learning more about your properties.';
}

function contactPhone() {
    window.location.href = 'tel:+234-800-000-0000';
}

// ========== SOCIAL MEDIA FUNCTIONS ==========
function openInstagram() {
    window.open('https://instagram.com/amonheights', '_blank');
}

function openYouTube() {
    window.open('https://youtube.com/@amonheights', '_blank');
}

function openTwitter() {
    window.open('https://twitter.com/amonheights', '_blank');
}

function openLinkedIn() {
    window.open('https://linkedin.com/company/amonheights', '_blank');
}

// ========== NAVIGATION FUNCTIONS ==========
function navigateTo(url) {
    window.location.href = url;
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize property grid
    renderProperties();
    
    // Close modal when clicking outside
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Initialize blog if on blog page
    const blogContainer = document.getElementById('blogContainer');
    if (blogContainer) {
        renderBlogPosts();
    }
    
    // Handle URL parameters for blog post page
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('id');
    if (blogId) {
        const post = getBlogPost(blogId);
        if (post) {
            const postContainer = document.getElementById('singleBlogPost');
            if (postContainer) {
                postContainer.innerHTML = `
                    <article class="blog-post-full">
                        <img src="${post.image}" alt="${post.title}" class="blog-post-image">
                        <h1>${post.title}</h1>
                        <p class="blog-post-meta">By ${post.author} on ${post.date}</p>
                        <div class="blog-post-body">${post.content}</div>
                        <a href="blog.html" class="back-link">← Back to Blog</a>
                    </article>
                `;
            }
        }
    }
});
