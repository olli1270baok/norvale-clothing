/* ==========================================================================
   nørvale clothing - Interactive Client Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initSearchOverlay();
    initColorDots();
    initNewsletter();
    setupShopLoadingState();
    
    // Start syncing the shopping cart quantity badge
    setInterval(syncCartCount, 1000);
    document.addEventListener('click', () => setTimeout(syncCartCount, 200));
});

/**
 * SPA-like Navigation System
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .logo-container a, .mobile-nav-link, .footer-col a, .legal-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            const href = link.getAttribute('href');
            
            if (targetId) {
                // If it's a Spreadshop route (starts with #!), let the hash change naturally
                if (href && href.startsWith('#!')) {
                    return;
                }
                
                // If it's an internal link, prevent default href behavior
                e.preventDefault();
                navigateToView(targetId);
                
                // Close mobile menu if open
                const drawer = document.querySelector('.mobile-nav-drawer');
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (drawer && drawer.classList.contains('open')) {
                    drawer.classList.remove('open');
                    toggle.classList.remove('active');
                }
            }
        });
    });

    // Check hash on initial load
    handleUrlHash();
    window.addEventListener('hashchange', handleUrlHash);
}

function handleUrlHash() {
    const hash = window.location.hash;
    const activeView = document.querySelector('.view.active');
    const activeViewId = activeView ? activeView.id : '';

    if (hash === '#collections') {
        navigateToView('collections-view');
    } else if (hash === '#about') {
        navigateToView('about-view');
    } else if (hash === '#home') {
        navigateToView('home-view');
    } else if (hash === '#shop' || hash.startsWith('#!')) {
        navigateToView('shop-view');
    } else if (hash === '' || hash === '#') {
        // Only default to home on initial load or if we are already on home.
        // Prevents Spreadshop state resets from kicking the user back to the home screen.
        if (activeViewId === '' || activeViewId === 'home-view') {
            navigateToView('home-view');
        }
    }
}

function navigateToView(viewId) {
    const targetView = document.getElementById(viewId);
    if (!targetView) return;

    // If the requested view is already active, don't perform transitions or scroll back to top
    if (targetView.classList.contains('active')) {
        return;
    }

    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Hide all views
    views.forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    targetView.classList.add('active');
    
    // Trigger a redraw/scroll for Spreadshop container if it is active
    if (viewId === 'shop-view') {
        window.dispatchEvent(new Event('resize'));
    }
    
    // Update active nav link classes
    navLinks.forEach(link => {
        const target = link.getAttribute('data-target');
        if (target === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Scroll to top smoothly when switching between main sections
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Global exposure for inline onclicks
window.navigateToView = navigateToView;

/**
 * Handle Shop Category Navigation
 */
function navigateToShopCategory(category) {
    navigateToView('shop-view');
    
    // Spreadshop uses URL parameters or hash tags for category routing internally when embedded.
    // If the shop is already loaded, we let the user explore. We also log the selected category.
    console.log(`Navigating to Spreadshop category: ${category}`);
    
    // Optionally, scroll down to the shop container
    const shopContainer = document.getElementById('myShop');
    if (shopContainer) {
        setTimeout(() => {
            shopContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}
window.navigateToShopCategory = navigateToShopCategory;

/**
 * Handle Shop Product Navigation (Bestseller Grid)
 */
function navigateToShopProduct(productId) {
    navigateToView('shop-view');
    console.log(`Navigating to Spreadshop product: ${productId}`);
    
    const shopContainer = document.getElementById('myShop');
    if (shopContainer) {
        setTimeout(() => {
            shopContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}
window.navigateToShopProduct = navigateToShopProduct;

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    
    if (toggle && drawer) {
        toggle.addEventListener('click', () => {
            const isOpen = drawer.classList.contains('open');
            if (isOpen) {
                drawer.classList.remove('open');
                toggle.classList.remove('active');
                // Animate hamburger lines back
                toggle.children[0].style.transform = 'none';
                toggle.children[1].style.transform = 'none';
            } else {
                drawer.classList.add('open');
                toggle.classList.add('active');
                // Animate hamburger lines to X
                toggle.children[0].style.transform = 'translateY(3.5px) rotate(45deg)';
                toggle.children[1].style.transform = 'translateY(-3px) rotate(-45deg)';
            }
        });
    }
}

/**
 * Search Overlay Overlay
 */
function initSearchOverlay() {
    const trigger = document.querySelector('.search-toggle');
    const overlay = document.querySelector('.search-overlay');
    const close = document.querySelector('.search-close');
    const input = document.querySelector('.search-input');
    
    if (trigger && overlay && close) {
        trigger.addEventListener('click', () => {
            overlay.classList.add('open');
            setTimeout(() => input.focus(), 300);
        });
        
        close.addEventListener('click', () => {
            overlay.classList.remove('open');
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
            }
        });
    }
}

/**
 * Interactive Product Card Color Dot Selectors
 */
function initColorDots() {
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering product card click event
            
            // Get all siblings in parent
            const siblings = dot.parentNode.querySelectorAll('.color-dot');
            siblings.forEach(s => s.classList.remove('active'));
            
            // Activate selected
            dot.classList.add('active');
            
            // Interactive visual response: change image based on color choice (for demonstration)
            const card = dot.closest('.product-card');
            const img = card.querySelector('.product-image');
            const colorName = dot.getAttribute('title');
            
            // Muted toast feedback
            console.log(`Ausgewählte Farbe für Produkt: ${colorName}`);
        });
    });
}

/**
 * Premium Newsletter Feedback Handler
 */
function initNewsletter() {
    window.handleNewsletterSubmit = function(event) {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('input');
        const email = input.value;
        
        if (email) {
            // Replace form with elegant thank you message
            const parent = form.parentNode;
            parent.innerHTML = `
                <div class="newsletter-success animate-fade-in" style="padding: 1rem 0; color: var(--color-accent);">
                    <h4 style="font-family: var(--font-heading); font-size: 1rem; margin-bottom: 0.5rem; text-transform: uppercase;">Vielen Dank!</h4>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--color-text-secondary);">Wir haben deine E-Mail-Adresse (${email}) registriert. Freue dich auf exklusive Updates.</p>
                </div>
            `;
        }
    };
}

/**
 * Setup Spreadshop Loading & Integration Handler
 */
function setupShopLoadingState() {
    // Hide the spinner once Spreadshop has initialized or after 4 seconds as a fallback
    const shopContainer = document.getElementById('myShop');
    
    // Poll to check if Spreadshop loaded its content
    let checkInterval = setInterval(() => {
        const hasLoadedIFrameOrProducts = shopContainer && (shopContainer.querySelector('iframe') || shopContainer.querySelector('.sprd-app') || shopContainer.children.length > 1);
        if (hasLoadedIFrameOrProducts) {
            removeLoadingSpinner();
        }
    }, 500);

    // Fallback to remove loader after 4 seconds
    setTimeout(() => {
        removeLoadingSpinner();
    }, 4000);

    function removeLoadingSpinner() {
        clearInterval(checkInterval);
        const spinner = document.querySelector('.shop-loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
}

/**
 * Sync custom basket quantity badge with Spreadshop's internal state
 */
function syncCartCount() {
    const shopContainer = document.getElementById('myShop');
    if (!shopContainer) return;
    
    const customBadge = document.querySelector('.bag-count');
    if (!customBadge) return;
    
    // Selectors for finding Spreadshop's quantity badges in the DOM
    const selectors = [
        '[class*="basket-amount"]',
        '[class*="basket-count"]',
        '[class*="cart-count"]',
        '[class*="quantity-badge"]',
        '.sprd-basket-amount',
        '.sprd-basket-quantity',
        '.sprd-cart-count'
    ];
    
    let quantityText = '';
    for (let selector of selectors) {
        const el = shopContainer.querySelector(selector);
        if (el) {
            const text = el.textContent.trim().replace(/\D/g, '');
            if (text !== '') {
                quantityText = text;
                break;
            }
        }
    }
    
    // Fallback: search for numbers inside links or buttons pointing to the basket
    if (quantityText === '') {
        const cartLinks = shopContainer.querySelectorAll('a[href*="basket"], a[href*="cart"], button[class*="basket"], button[class*="cart"]');
        for (let link of cartLinks) {
            const badge = link.querySelector('[class*="badge"], [class*="count"], [class*="amount"]');
            if (badge) {
                const text = badge.textContent.trim().replace(/\D/g, '');
                if (text !== '') {
                    quantityText = text;
                    break;
                }
            } else {
                const text = link.textContent.trim().replace(/\D/g, '');
                if (text !== '' && text.length <= 2) {
                    quantityText = text;
                    break;
                }
            }
        }
    }
    
    // Update parent badge
    if (quantityText !== '') {
        customBadge.textContent = quantityText;
        customBadge.style.display = 'flex';
    } else {
        customBadge.textContent = '0';
    }
}

