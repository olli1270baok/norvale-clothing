/* ==========================================================================
   nørvale clothing - Interactive Client Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initNavigation();
    initMobileMenu();
    initSearchOverlay();
    initColorDots();
    initNewsletter();
    setupShopLoadingState();
    loadBestsellers();
    
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

/**
 * Dynamically load bestseller products from the Spreadshop API feed
 */
async function loadBestsellers() {
    const grid = document.querySelector('.bestsellers-section .products-grid');
    if (!grid) return;
    
    try {
        const response = await fetch('https://baokmedia.myspreadshop.de/api/v1/shops/1553354/sellables');
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();
        const sellables = data.sellables || [];
        
        if (sellables.length === 0) return;
        
        // Clear static placeholders
        grid.innerHTML = '';
        
        // Take the first 3 products to display
        const itemsToShow = sellables.slice(0, 3);
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Generate deep link to Spreadshop product details page
            card.onclick = () => {
                window.location.hash = `#!/sellable/${item.sellableId}`;
            };
            
            // Format price amount
            const price = typeof item.price.amount === 'number' 
                ? `${item.price.amount.toFixed(2).replace('.', ',')} €`
                : '34,90 €';
                
            // Render color dots if appearances are available
            let colorsHtml = '';
            if (item.appearanceIds && item.appearanceIds.length > 0) {
                colorsHtml = `<div class="product-colors">`;
                
                // Map common Spreadshop appearance IDs to aesthetic hexadecimal color codes
                const colorMap = {
                    '1': '#ffffff',     // White
                    '1271': '#d7d0c5',  // Sand
                    '1250': '#363432',  // Anthracite / Charcoal
                    '1265': '#2b2b2a',  // Black
                    '1259': '#1e1c1b',  // Deep Charcoal
                    '270': '#6c7a6b',   // Sage Green
                    '805': '#4a423a',   // Walnut Brown
                    '689': '#cfc7bc',   // Oatmeal / Light Grey
                    '843': '#9a958e',   // Warm Taupe
                    '195': '#414f6b',   // Navy Blue
                    '1254': '#b5a596'   // Muted Ochre
                };
                
                item.appearanceIds.slice(0, 4).forEach((appId, idx) => {
                    const hex = colorMap[appId] || '#c9c0b3';
                    const isActive = appId === item.defaultAppearanceId ? 'active' : '';
                    colorsHtml += `<span class="color-dot ${isActive}" style="background-color: ${hex};" title="Farbe ID ${appId}"></span>`;
                });
                colorsHtml += `</div>`;
            }
            
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${item.previewImage.url}" alt="${item.name}" class="product-image" loading="lazy">
                    <span class="badge">Original</span>
                </div>
                <div class="product-details">
                    <h3 class="product-name">${item.name}</h3>
                    <p class="product-price">${price}</p>
                    ${colorsHtml}
                </div>
            `;
            grid.appendChild(card);
        });
        
        // Re-initialize color dots click listeners
        initColorDots();
        
    } catch (err) {
        console.warn('Could not load dynamic bestsellers from Spreadshop:', err);
    }
}

/**
 * Translations Dictionary for DE and EN
 */
const translations = {
    de: {
        announcement: "Kostenloser Versand für alle Bestellungen ab 150 €",
        nav_home: "Home",
        nav_shop: "Shop",
        nav_collections: "Kollektionen",
        nav_about: "Über uns",
        hero_tag: "Nordic by Nature",
        hero_title: "MADE TO LAST.",
        hero_desc: "Zeitloses Design. Nachhaltige Materialien. Kleidung inspiriert von der rauen Schönheit des Nordens.",
        hero_btn_shop: "Kollektion Entdecken",
        hero_btn_about: "Unsere Story",
        cat_tag: "Kategorien",
        cat_title: "Kollektionen durchstöbern",
        cat_tshirt_desc: "Clean. Komfortabel. Essenziell.",
        cat_tshirt_cta: "Jetzt Shoppen",
        cat_hoodie_desc: "Für Komfort gebaut. Gemacht für Beständigkeit.",
        cat_hoodie_cta: "Jetzt Shoppen",
        cat_accessories_title: "Accessoires",
        cat_accessories_desc: "Klare Akzente. Zeitloser Stil.",
        cat_accessories_cta: "Entdecken",
        value_title_1: "Nordisches Erbe",
        value_desc_1: "Inspiriert von der rauen Natur und der Einfachheit Skandinaviens.",
        value_title_2: "Nachhaltigkeit",
        value_desc_2: "Bewusste Materialauswahl und faire Produktionsbedingungen.",
        value_title_3: "Zeitloses Design",
        value_desc_3: "Minimalismus, der sich Modetrends widersetzt und langlebig bleibt.",
        value_title_4: "Langlebigkeit",
        value_desc_4: "Mit Sorgfalt gefertigt, um Jahre intensiver Nutzung zu überstehen.",
        best_tag: "Auswahl",
        best_title: "Unsere Bestseller",
        best_view_all: "Alle Produkte ansehen →",
        badge_essential: "Essential",
        badge_premium: "Premium",
        shop_tag: "Offizieller Store",
        shop_title: "nørvale Online-Shop",
        shop_desc: "Bestelle unsere Kollektionen direkt über den eingebetteten Store. Sicher, schnell und direkt geliefert.",
        shop_loading: "Kollektionen werden geladen...",
        shop_fallback_btn: "Direkt zu Spreadshop öffnen",
        coll_tag: "Unsere Drops",
        coll_title: "Kollektionen",
        coll_row_tag_1: "Neu eingetroffen",
        coll_row_desc_1: "Erlesene Essentials, designt für Klarheit, Komfort und Bewegung. Gefertigt aus feinster Bio-Baumwolle und mit dezentem Logo-Stick.",
        coll_row_btn_1: "Drop Shoppen",
        coll_row_tag_2: "Klassiker",
        coll_row_desc_2: "Unsere zeitlose Linie, die vom schlichten skandinavischen Lebensstil inspiriert ist. Dauerhaft im Sortiment und die perfekte Basis für jedes Outfit.",
        coll_row_btn_2: "Kollektion ansehen",
        about_tag: "Unsere Philosophie",
        about_heading: "Die Seele des Nordens.",
        about_lead: "nørvale entstand aus der Sehnsucht nach Klarheit, Natur und langlebiger Kleidung. Unsere Designs spiegeln die weite, raue Landschaft des Nordens wider.",
        about_story_title_1: "Bewusster Minimalismus",
        about_story_desc_1: "Wir glauben nicht an schnelllebige Trends. Jedes nørvale-Stück ist so konzipiert, dass es vielseitig kombinierbar ist und Saison für Saison getragen werden kann.",
        about_story_title_2: "Verantwortung & Materialien",
        about_story_desc_2: "In Zusammenarbeit mit Spreadshop setzen wir auf eine bedarfsgerechte Produktion (Print-on-Demand), um Textilmüll und Überproduktion zu minimieren. Wir bevorzugen biologische Fasern und umweltfreundliche Druckverfahren.",
        search_placeholder: "Suche nach Produkten...",
        search_btn: "Suchen",
        search_suggestions: "Beliebte Suchanfragen: <span>Hoodies</span>, <span>T-Shirts</span>, <span>Caps</span>",
        footer_title_shop: "Shop",
        footer_shop_all: "Alle Produkte",
        footer_shop_tshirts: "T-Shirts",
        footer_shop_hoodies: "Hoodies",
        footer_shop_accessories: "Accessoires",
        footer_title_company: "Unternehmen",
        footer_company_about: "Über uns",
        footer_company_sustain: "Nachhaltigkeit",
        footer_company_values: "Werte",
        footer_company_contact: "Kontakt",
        footer_title_newsletter: "Newsletter",
        footer_newsletter_desc: "Melde dich für unseren Newsletter an, um exklusiven Vorabzugriff auf neue Drops und Angebote zu erhalten.",
        footer_newsletter_placeholder: "Deine E-Mail-Adresse",
        footer_copyright: "&copy; 2026 nørvale clothing. Alle Rechte vorbehalten.",
        footer_privacy: "Datenschutz",
        footer_terms: "AGB",
        footer_imprint: "Impressum"
    },
    en: {
        announcement: "Free shipping on all orders over 150 €",
        nav_home: "Home",
        nav_shop: "Shop",
        nav_collections: "Collections",
        nav_about: "About Us",
        hero_tag: "Nordic by Nature",
        hero_title: "MADE TO LAST.",
        hero_desc: "Timeless design. Sustainable materials. Garments inspired by the raw beauty of the North.",
        hero_btn_shop: "Explore Collection",
        hero_btn_about: "Our Story",
        cat_tag: "Categories",
        cat_title: "Browse Collections",
        cat_tshirt_desc: "Clean. Comfortable. Essential.",
        cat_tshirt_cta: "Shop Now",
        cat_hoodie_desc: "Built for comfort. Made to endure.",
        cat_hoodie_cta: "Shop Now",
        cat_accessories_title: "Accessories",
        cat_accessories_desc: "Fresh styles. Timeless purpose.",
        cat_accessories_cta: "Explore",
        value_title_1: "Nordic Heritage",
        value_desc_1: "Inspired by the raw nature and simplicity of Scandinavia.",
        value_title_2: "Sustainability",
        value_desc_2: "Conscious material choices and fair production conditions.",
        value_title_3: "Timeless Design",
        value_desc_3: "Minimalism that defies fast trends and remains long-lasting.",
        value_title_4: "Built to Endure",
        value_desc_4: "Made with care to withstand years of intensive wear.",
        best_tag: "Selected",
        best_title: "Our Bestsellers",
        best_view_all: "View all products →",
        badge_essential: "Essential",
        badge_premium: "Premium",
        shop_tag: "Official Store",
        shop_title: "nørvale Online Shop",
        shop_desc: "Order our collections directly through the embedded store. Secure, fast, and delivered straight to you.",
        shop_loading: "Loading collections...",
        shop_fallback_btn: "Open Spreadshop directly",
        coll_tag: "Our Drops",
        coll_title: "Collections",
        coll_row_tag_1: "New Arrivals",
        coll_row_desc_1: "Elevated essentials designed for clarity, comfort, and movement. Crafted from the finest organic cotton with subtle logo embroidery.",
        coll_row_btn_1: "Shop Drop",
        coll_row_tag_2: "Classics",
        coll_row_desc_2: "Our timeless line inspired by the simple Scandinavian lifestyle. Permanently in stock and the perfect foundation for any outfit.",
        coll_row_btn_2: "View Collection",
        about_tag: "Our Philosophy",
        about_heading: "The Soul of the North.",
        about_lead: "nørvale was born from a desire for clarity, nature, and long-lasting garments. Our designs reflect the wide, raw landscape of the North.",
        about_story_title_1: "Conscious Minimalism",
        about_story_desc_1: "We do not believe in fast-paced trends. Each nørvale piece is designed to be versatile and worn season after season.",
        about_story_title_2: "Responsibility & Materials",
        about_story_desc_2: "In partnership with Spreadshop, we rely on print-on-demand production to minimize textile waste and overproduction. We prefer organic fibers and eco-friendly printing methods.",
        search_placeholder: "Search for products...",
        search_btn: "Search",
        search_suggestions: "Popular searches: <span>Hoodies</span>, <span>T-Shirts</span>, <span>Caps</span>",
        footer_title_shop: "Shop",
        footer_shop_all: "All Products",
        footer_shop_tshirts: "T-Shirts",
        footer_shop_hoodies: "Hoodies",
        footer_shop_accessories: "Accessories",
        footer_title_company: "Company",
        footer_company_about: "About Us",
        footer_company_sustain: "Sustainability",
        footer_company_values: "Our Values",
        footer_company_contact: "Contact",
        footer_title_newsletter: "Newsletter",
        footer_newsletter_desc: "Sign up for our newsletter to get exclusive early access to new drops and offers.",
        footer_newsletter_placeholder: "Your email address",
        footer_copyright: "&copy; 2026 nørvale clothing. All rights reserved.",
        footer_privacy: "Privacy Policy",
        footer_terms: "Terms & Conditions",
        footer_imprint: "Imprint"
    }
};

/**
 * Initialize Language Switcher
 */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('norvale_lang') || 'de';
    
    // Set initial active state in header
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            if (selectedLang) {
                switchLanguage(selectedLang);
            }
        });
    });
    
    // Apply saved language immediately
    applyLanguage(savedLang, false); // false = do not reload Spreadshop on initial boot (it's already loading)
}

/**
 * Switch page language dynamically
 */
function switchLanguage(lang) {
    const currentLang = localStorage.getItem('norvale_lang') || 'de';
    if (lang === currentLang) return;
    
    // Save to local storage
    localStorage.setItem('norvale_lang', lang);
    
    // Update active class on buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply changes
    applyLanguage(lang, true); // true = reload Spreadshop to change shop locale
}

/**
 * Translate elements and reload Spreadshop
 */
function applyLanguage(lang, shouldReloadShop) {
    document.documentElement.setAttribute('lang', lang);
    
    // Translate text contents
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    
    // Translate placeholders
    const translatablePlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
    translatablePlaceholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
    
    // Reload Spreadshop with new locale
    if (shouldReloadShop) {
        reloadSpreadshop(lang);
    }
}

/**
 * Re-render Spreadshop dynamically to switch languages
 */
function reloadSpreadshop(lang) {
    const shopContainer = document.getElementById('myShop');
    if (!shopContainer) return;
    
    // Clear current shop elements
    shopContainer.innerHTML = '';
    
    // Re-insert loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'shop-loading-spinner';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <p data-i18n="shop_loading">${lang === 'de' ? 'Kollektionen werden geladen...' : 'Loading collections...'}</p>
        <a href="https://baokmedia.myspreadshop.de" class="btn btn-secondary" data-i18n="shop_fallback_btn">${lang === 'de' ? 'Direkt zu Spreadshop öffnen' : 'Open Spreadshop directly'}</a>
    `;
    shopContainer.appendChild(spinner);
    
    // Re-configure the global Spreadshop settings object
    window.spread_shop_config = {
        shopName: 'baokmedia',
        locale: lang === 'de' ? 'de_DE' : 'en_GB',
        prefix: 'https://baokmedia.myspreadshop.de',
        baseId: 'myShop'
    };
    
    // Remove existing shop client script tags to avoid conflicts
    const oldScripts = document.querySelectorAll('script[src*="shopclient.nocache.js"]');
    oldScripts.forEach(s => s.remove());
    
    // Delete GWT hooks
    delete window.spreadshop;
    
    // Append new script tag to trigger re-rendering
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://baokmedia.myspreadshop.de/shopfiles/shopclient/shopclient.nocache.js?t=' + Date.now();
    document.body.appendChild(script);
    
    // Trigger shop loading check
    setupShopLoadingState();
}


