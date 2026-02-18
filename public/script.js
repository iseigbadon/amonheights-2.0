/* ============================================
   AMON HEIGHTS - FRONTEND JAVASCRIPT
   Airbnb-Style Luxury Real Estate Website
   ============================================ */

// ============================================
// WHATSAPP INTEGRATION
// ============================================

function openWhatsApp(message, propertyName = null) {
    const fullMessage = propertyName 
        ? `Hello! I'm interested in ${propertyName}. ${message}`
        : `Hello! ${message}`;
    
    const encodedMessage = encodeURIComponent(fullMessage);
    // Main WhatsApp contact: +234 813 786 8434
    const whatsappNumber = '2348137868434';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const menuToggle = document.querySelector('.menu-toggle');
const navMobile = document.querySelector('.nav-mobile');

if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', () => {
        navMobile.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Animate hamburger
        const hamburgers = menuToggle.querySelectorAll('.hamburger');
        if (navMobile.classList.contains('active')) {
            hamburgers[0].style.transform = 'rotate(45deg) translateY(15px)';
            hamburgers[1].style.opacity = '0';
            hamburgers[2].style.transform = 'rotate(-45deg) translateY(-15px)';
        } else {
            hamburgers[0].style.transform = 'none';
            hamburgers[1].style.opacity = '1';
            hamburgers[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when link is clicked
const mobileNavLinks = document.querySelectorAll('.nav-mobile a');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMobile) navMobile.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        
        // Reset hamburger
        const hamburgers = menuToggle?.querySelectorAll('.hamburger');
        if (hamburgers) {
            hamburgers[0].style.transform = 'none';
            hamburgers[1].style.opacity = '1';
            hamburgers[2].style.transform = 'none';
        }
    });
});

// ============================================
// PROPERTIES DATA & RENDERING
// ============================================

let allProperties = [];

// Fetch properties from backend
async function loadProperties() {
    try {
        const response = await fetch('/api/properties');
        allProperties = await response.json();
        renderProperties(allProperties);
    } catch (error) {
        console.error('Error loading properties:', error);
        // Load sample data if backend unavailable
        loadSampleProperties();
    }
}

function loadSampleProperties() {
    allProperties = [
        {
            id: 1,
            name: 'Luxury Penthouse - Maitama',
            location: 'Maitama, Abuja',
            category: 'sale',
            price: '₦250,000,000',
            description: 'Stunning 4-bedroom penthouse with panoramic views, smart home features.',
            image: '../Images/duplex white.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['Swimming Pool', 'Gym', 'Smart Home', 'Rooftop Terrace', 'Wine Cellar', 'Home Cinema'],
            fullDescription: 'This exquisite luxury penthouse offers the pinnacle of sophistication and comfort. Featuring premium finishes, floor-to-ceiling windows, and state-of-the-art amenities, this property is perfect for discerning clients seeking exceptional Abuja living.'
        },
        {
            id: 2,
            name: 'Modern Villa - Asokoro',
            location: 'Asokoro, Abuja',
            category: 'sale',
            price: '₦180,000,000',
            description: 'Contemporary 5-bedroom villa with modern architectural design.',
            image: '../Images/duplex and pool outdoor 1.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['Garden', 'Pool', 'Cinema', 'Garage', 'Staff Quarters', 'Security Gate'],
            fullDescription: 'A masterpiece of modern design, this villa combines elegance with functionality. The open-plan living areas, premium kitchen, and expansive outdoor spaces make it ideal for luxury living and entertaining.'
        },
        {
            id: 3,
            name: 'Executive Apartment - Wuse II',
            location: 'Wuse II, Abuja',
            category: 'rent',
            price: '₦800,000/month',
            description: '3-bedroom luxury apartment perfect for executives and diplomats.',
            image: '../Images/living room 2.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['Concierge', 'Fitness Center', '24/7 Security', 'Parking', 'Balcony'],
            fullDescription: 'This premium apartment offers unparalleled comfort and security. Located in the heart of Wuse II, it provides convenient access to business districts while maintaining complete privacy.'
        },
        {
            id: 4,
            name: 'Luxury Short-Let - Garki I',
            location: 'Garki I, Abuja',
            category: 'shortlet',
            price: '₦150,000/night',
            description: 'Fully furnished luxury suite with premium hospitality services.',
            image: '../Images/shortlet.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['WiFi', 'Kitchenette', 'Daily Service', 'Laundry', 'Airport Transfer'],
            fullDescription: 'Experience luxury hospitality in our meticulously maintained short-let property. Perfect for business travelers and tourists seeking premium comfort during their stay in Abuja.'
        },
        {
            id: 5,
            name: 'Premium Plot - Katampe',
            location: 'Katampe, Abuja',
            category: 'sale',
            price: '₦45,000,000',
            description: 'Exclusive land plot with approved status and excellent investment potential.',
            image: '../Images/duplex outdoor.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['Approved Land', 'Good Access Road', 'Survey Plan', 'Fenced', 'C of O Ready'],
            fullDescription: 'An excellent investment opportunity on premium land in one of Abuja\'s most sought-after residential areas. High appreciation potential with excellent infrastructure.'
        },
        {
            id: 6,
            name: 'Holiday Home - Jahi',
            location: 'Jahi, Abuja',
            category: 'shortlet',
            price: '₦120,000/night',
            description: 'Serene holiday home with garden and family-friendly amenities.',
            image: '../Images/shortlet1.jpg',
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            amenities: ['Garden', 'Playground', 'BBQ Area', 'Games Room', 'WiFi'],
            fullDescription: 'A perfect retreat for families and groups. This spacious home offers comfort, security, and all amenities needed for a memorable stay in Abuja.'
        }
    ];
    
    renderProperties(allProperties);
}

// Render properties in grid
function renderProperties(properties) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (properties.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #6b6b6b; padding: 3rem;">No properties found.</p>';
        return;
    }
    
    properties.forEach((property, index) => {
        const card = createPropertyCard(property);
        grid.appendChild(card);
        
        // Trigger animation
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 50);
    });
}

// Create property card element
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.style.opacity = '0';
    
    const categoryLabel = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'shortlet': 'Short-Let'
    }[property.category] || property.category;
    
    card.innerHTML = `
        <img src="${property.image}" alt="${property.name}" class="property-image" loading="lazy">
        <div class="property-info">
            <div class="property-header">
                <h3 class="property-name">${property.name}</h3>
                <span class="property-type">${categoryLabel}</span>
            </div>
            <p class="property-location">📍 ${property.location}</p>
            <p class="property-price">${property.price}</p>
            <p class="property-description">${property.description}</p>
            <div class="property-footer">
                <button class="btn-view">View Details</button>
                <button class="btn-whatsapp">Inquire</button>
            </div>
        </div>
    `;
    
    // View details button
    card.querySelector('.btn-view').addEventListener('click', (e) => {
        e.stopPropagation();
        openPropertyModal(property);
    });
    
    // WhatsApp button
    card.querySelector('.btn-whatsapp').addEventListener('click', (e) => {
        e.stopPropagation();
        openWhatsApp('I\'d like to inquire about this property.', property.name);
    });
    
    return card;
}

// ============================================
// PROPERTY MODAL
// ============================================

const modal = document.getElementById('propertyModal');
const modalOverlay = document.querySelector('.modal') ? document.querySelector('.modal') : null;
const modalClose = document.querySelector('.modal-close');

function openPropertyModal(property) {
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;
    
    const videoHTML = property.video ? `
        <div class="modal-video">
            <iframe src="${property.video}" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
        </div>
    ` : '';
    
    const amenitiesHTML = property.amenities && property.amenities.length > 0 ? `
        <h3 class="modal-section-title">Amenities & Features</h3>
        <div class="modal-amenities">
            ${property.amenities.map(a => `<div class="amenity-item">${a}</div>`).join('')}
        </div>
    ` : '';
    
    const categoryLabel = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'shortlet': 'Short-Let'
    }[property.category] || property.category;
    
    modalBody.innerHTML = `
        <img src="${property.image}" alt="${property.name}" class="modal-image" loading="lazy">
        <h2 class="modal-title">${property.name}</h2>
        
        <div class="modal-meta">
            <div class="modal-meta-item">
                <label>Type</label>
                <value>${categoryLabel}</value>
            </div>
            <div class="modal-meta-item">
                <label>Location</label>
                <value>${property.location}</value>
            </div>
            <div class="modal-meta-item">
                <label>Price</label>
                <value>${property.price}</value>
            </div>
        </div>
        
        <h3 class="modal-section-title">Description</h3>
        <p class="modal-description">${property.fullDescription}</p>
        
        ${videoHTML}
        ${amenitiesHTML}
        
        <div class="modal-cta">
            <button class="btn btn-primary" onclick="openWhatsApp('I would like to schedule a viewing or get more information about this property.', '${property.name}')">Contact on WhatsApp</button>
        </div>
    `;
    
    if (modal) {
        modal.classList.add('active');
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// Close modal on overlay click
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ============================================
// FILTER FUNCTIONALITY
// ============================================

const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter properties
        const filter = button.dataset.filter;
        if (filter === 'all') {
            renderProperties(allProperties);
        } else {
            const filtered = allProperties.filter(p => p.category === filter);
            renderProperties(filtered);
        }
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('fade-in')) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (header) {
        if (scrollTop > 100) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load properties
    loadProperties();
    
    // Observe why items for animation
    document.querySelectorAll('.why-item').forEach(item => {
        observer.observe(item);
    });
    
    // Observe property cards
    document.querySelectorAll('.property-card').forEach(card => {
        observer.observe(card);
    });
    
    // Smooth hash navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#propertyModal') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Close mobile menu if open
                    if (navMobile) navMobile.classList.remove('active');
                    if (menuToggle) menuToggle.classList.remove('active');
                    
                    // Scroll to target
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Set first filter button as active
    const firstFilterBtn = document.querySelector('.filter-btn');
    if (firstFilterBtn) {
        firstFilterBtn.classList.add('active');
    }
});
