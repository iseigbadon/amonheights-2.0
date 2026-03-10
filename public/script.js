/* ============================================
   AMON HEIGHTS - OPTIMIZED FRONTEND JAVASCRIPT
   Premium Real Estate Website
   Performance-Optimized, Mobile-First
   ============================================ */

// ============================================
// MOBILE MENU TOGGLE
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        const isMenu = e.target.closest('#navMenu');
        const isToggle = e.target.closest('#menuToggle');
        if (!isMenu && !isToggle) {
            navMenu.classList.remove('mobile-open');
        }
    });
}

// ============================================
// SMOOTH SCROLL ENHANCEMENT
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });
}

// ============================================
// PROPERTIES LOADING & RENDERING
// ============================================

let allProperties = [];

async function loadProperties() {
    try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');
        
        allProperties = await response.json();
        if (allProperties.length > 0) {
            displayProperties(allProperties);
        }
    } catch (error) {
        console.log('Properties loading with demo data');
    }
}

function displayProperties(properties) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid || !properties || properties.length === 0) return;

    const html = properties.slice(0, 9).map(prop => createPropertyCard(prop)).join('');
    grid.innerHTML = html;
}

function createPropertyCard(prop) {
    const imageUrl = prop.images?.[0] || prop.image || '';
    const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${prop.name || 'Property'}" class="property-image" loading="lazy">`
        : `<div class="property-image" style="background: linear-gradient(135deg, #c41e3a, #e63946); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">No Image</div>`;

    return `
        <div class="property-card">
            <div style="position: relative; overflow: hidden;">
                ${imageHtml}
                ${prop.category ? `<div class="property-badge">${formatCategory(prop.category)}</div>` : ''}
            </div>
            <div class="property-content">
                <div class="property-header">
                    <div class="property-title">
                        <h3>${prop.name || 'Luxury Property'}</h3>
                        <p class="property-location">${prop.location || 'Abuja, Nigeria'}</p>
                    </div>
                    <div class="property-price">₦${formatPrice(prop.price)}</div>
                </div>
                <p class="property-description">${prop.description || 'Premium luxury property in Abuja'}</p>
                <div class="property-features">
                    ${prop.bedrooms ? `<span class="feature-item">🛏️ ${prop.bedrooms}</span>` : ''}
                    ${prop.bathrooms ? `<span class="feature-item">🚿 ${prop.bathrooms}</span>` : ''}
                    ${prop.size ? `<span class="feature-item">📐 ${prop.size}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

function formatCategory(category) {
    const map = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'shortlet': 'Short-Let'
    };
    return map[category] || category;
}

function formatPrice(price) {
    if (!price) return 'POA';
    if (typeof price === 'number') return price.toLocaleString('en-NG');
    return price;
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(
        '.feature-card, .property-card, .contact-item'
    ).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

function initLazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '50px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const scrollHandler = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
    }, 100);

    window.addEventListener('scroll', scrollHandler);
}

// ============================================
// UTILITIES
// ============================================

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// ============================================
// INITIALIZATION
// ============================================

function initApp() {
    console.log('🏘️  Amon Heights Platform Initializing...');

    // Mobile menu
    initMobileMenu();

    // Smooth scroll
    initSmoothScroll();

    // Properties
    loadProperties();

    // Scroll animations
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        initScrollAnimations();
    }

    // Lazy load images
    initLazyLoadImages();

    // Header scroll effect
    initHeaderScroll();

    console.log('✅ Amon Heights Platform Ready');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
