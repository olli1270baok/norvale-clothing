/* ==========================================================================
   nørvale clothing - Interactive Client Application Logic
   ========================================================================== */

let ignoreNextShopHashChange = (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#home' || window.location.hash === '#about' || window.location.hash === '#collections' || window.location.hash === '#sustainability' || window.location.hash === '#values' || window.location.hash === '#contact' || window.location.hash === '#imprint' || window.location.hash === '#shipping-returns' || window.location.hash === '#privacy' || window.location.hash === '#terms');

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initNavigation();
    initMobileMenu();
    initSearchOverlay();
    initColorDots();
    initNewsletter();
    setupShopLoadingState();
    loadBestsellers();
    initLegalTabs();
    
    // Start syncing the shopping cart quantity badge
    setInterval(syncCartCount, 1000);
    document.addEventListener('click', () => setTimeout(syncCartCount, 200));
});

/**
 * SPA-like Navigation System
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .logo-container a, .mobile-nav-drawer a, .footer-col a, .legal-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            const href = link.getAttribute('href');
            
            if (targetId) {
                // If it's a Spreadshop route (starts with #!), let the hash change naturally and ensure view transitions
                if (href && href.startsWith('#!')) {
                    navigateToView(targetId);
                    return;
                }
                
                // Prevent default hash navigation to prevent Spreadshop script from hijacking
                e.preventDefault();
                navigateToView(targetId);
                
                // Update URL in address bar without triggering hashchange event
                if (href) {
                    history.pushState(null, null, href);
                }
                
                // If it's a legal page link, switch to the correct tab directly
                if (targetId === 'legal-view' && href) {
                    const tabName = href.replace('#', '');
                    if (tabName === 'imprint' || tabName === 'privacy' || tabName === 'terms' || tabName === 'shipping-returns') {
                        switchLegalTab(tabName);
                    }
                }
            }
            
            // Close mobile menu if open
            const drawer = document.querySelector('.mobile-nav-drawer');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (drawer && drawer.classList.contains('open')) {
                drawer.classList.remove('open');
                if (toggle) {
                    toggle.classList.remove('active');
                    if (toggle.children.length >= 2) {
                        toggle.children[0].style.transform = 'none';
                        toggle.children[1].style.transform = 'none';
                    }
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

    if (hash === '#collections' || hash === '#!/collections') {
        navigateToView('collections-view');
    } else if (hash === '#about' || hash === '#!/about') {
        navigateToView('about-view');
    } else if (hash === '#sustainability' || hash === '#!/sustainability') {
        navigateToView('sustainability-view');
    } else if (hash === '#values' || hash === '#!/values') {
        navigateToView('values-view');
    } else if (hash === '#contact' || hash === '#!/contact') {
        navigateToView('contact-view');
    } else if (hash === '#home' || hash === '#!/home') {
        navigateToView('home-view');
    } else if (hash === '#imprint' || hash === '#!/imprint') {
        navigateToView('legal-view');
        switchLegalTab('imprint');
    } else if (hash === '#shipping-returns' || hash === '#!/shipping-returns') {
        navigateToView('legal-view');
        switchLegalTab('shipping-returns');
    } else if (hash === '#privacy' || hash === '#!/privacy') {
        navigateToView('legal-view');
        switchLegalTab('privacy');
    } else if (hash === '#terms' || hash === '#!/terms') {
        navigateToView('legal-view');
        switchLegalTab('terms');
    } else if (hash === '#shop' || hash.startsWith('#!')) {
        // If it's a default Spreadshop redirect on initial load of a non-shop page, ignore it.
        if (ignoreNextShopHashChange && (hash === '#!' || hash === '#!/')) {
            ignoreNextShopHashChange = false; // Reset the flag so future navigation works
            if (activeViewId && activeViewId !== 'shop-view') {
                const correctHash = activeViewId === 'home-view' ? '#home' : '#' + activeViewId.replace('-view', '');
                history.pushState(null, null, correctHash);
            }
            return;
        }
        ignoreNextShopHashChange = false; // Any other hash change resets the ignore flag
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
    navigateToView('shop-view'); // Switch view first to ensure we display it
    if (category === 't-shirts') {
        window.location.hash = '#!/search?q=shirt';
    } else if (category === 'hoodies') {
        window.location.hash = '#!/search?q=hoodie';
    } else if (category === 'accessories') {
        window.location.hash = '#!/search?q=accessoire';
    } else {
        navigateToView('shop-view');
    }
    
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

        // Clickable search suggestions using event delegation
        const suggestionsContainer = document.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'SPAN') {
                    const query = e.target.textContent;
                    if (input) {
                        input.value = query;
                        const form = document.querySelector('.search-form');
                        if (form) {
                            handleSearchSubmit(new Event('submit'));
                        }
                    }
                }
            });
        }
    }
}

/**
 * Handle Search Form Submission
 */
function handleSearchSubmit(event) {
    if (event) event.preventDefault();
    const input = document.querySelector('.search-input');
    const query = input ? input.value.trim() : '';
    
    // Close the search overlay
    const overlay = document.querySelector('.search-overlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
    
    if (query) {
        // Redirect to shop view with search query hash
        window.location.hash = `#!/search?q=${encodeURIComponent(query)}`;
    } else {
        window.location.hash = '#!/';
    }
}
window.handleSearchSubmit = handleSearchSubmit;

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
 * Premium Contact Form Submission Handler
 */
window.handleContactSubmit = function(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#contact-name').value;
    const email = form.querySelector('#contact-email').value;
    const message = form.querySelector('#contact-message').value;
    
    if (name && email && message) {
        const parent = form.parentNode;
        const currentLang = localStorage.getItem('norvale_lang') || 'de';
        const titleText = currentLang === 'de' ? 'Vielen Dank!' : 'Thank you!';
        const bodyText = currentLang === 'de' 
            ? `Hallo ${name}, deine Nachricht wurde erfolgreich übermittelt. Wir werden uns unter <strong>${email}</strong> in Kürze bei dir melden.`
            : `Hello ${name}, your message has been sent successfully. We will get back to you at <strong>${email}</strong> shortly.`;
        
        parent.innerHTML = `
            <div class="contact-success animate-fade-in" style="padding: 2rem; background-color: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--border-radius-sm); color: var(--color-text-primary);">
                <h4 style="font-family: var(--font-heading); font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--color-accent); text-transform: uppercase;">${titleText}</h4>
                <p style="font-size: 0.95rem; line-height: 1.6; color: var(--color-text-secondary);">${bodyText}</p>
            </div>
        `;
        console.log(`Kontakt-Nachricht von ${name} (${email}): ${message}`);
    }
};

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
        
        // Select specific bestsellers for dynamic showcase (or fallback if not found)
        const targetIds = [
            'ybQyJ8mRgZTdxgE8Mgmy-20-22', // Nø Statement Hoodie
            'ybQyJ8mRgZTdxgE8Mgmy-1155-33', // Nø Statement T-Shirt
            'nAdQz7Oan2HzlDnjEavN-20-22'  // Nordisches Norvale Logo mit Flagge Hoodie
        ];
        
        let itemsToShow = [];
        targetIds.forEach(id => {
            const found = sellables.find(item => item.sellableId === id);
            if (found) {
                itemsToShow.push(found);
            }
        });
        
        // Fallback if target IDs are not found or incomplete
        if (itemsToShow.length < 3) {
            itemsToShow = sellables.slice(0, 3);
        }
        
        itemsToShow.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Generate deep link to Spreadshop product details page
            card.onclick = () => {
                navigateToView('shop-view'); // Ensure shop view is visible
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
                    '1247': '#d7d0c5',  // Cream/Sand
                    '1271': '#d7d0c5',  // Sand
                    '1250': '#363432',  // Anthracite / Charcoal
                    '1265': '#2b2b2a',  // Black
                    '1259': '#1e1c1b',  // Deep Charcoal
                    '270': '#6c7a6b',   // Sage Green
                    '1274': '#6c7a6b',  // Sage Green alternative
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
            
            // Determine badge translation key
            let badgeKey = 'badge_essential';
            if (item.sellableId.includes('oNdqmkw5') || item.sellableId.includes('gNL8RyaM') || item.sellableId.includes('BvyXM3R')) {
                badgeKey = 'badge_limited';
            } else if (item.sellableId === 'ybQyJ8mRgZTdxgE8Mgmy-20-22') {
                badgeKey = 'badge_new';
            } else if (item.sellableId === 'NnQjBgmVJ0T8rB079exd-20-22') {
                badgeKey = 'badge_premium';
            } else if (item.sellableId === 'nAdQz7Oan2HzlDnjEavN-20-22') {
                badgeKey = 'badge_new';
            } else if (item.sellableId === 'ybQyJ8mRgZTdxgE8Mgmy-1155-33') {
                badgeKey = 'badge_essential';
            } else {
                badgeKey = 'badge_essential';
            }
            
            const currentLang = localStorage.getItem('norvale_lang') || 'de';
            const badgeText = translations[currentLang] && translations[currentLang][badgeKey] 
                ? translations[currentLang][badgeKey] 
                : 'Essential';
            
            const isLimited = badgeKey === 'badge_limited' ? 'badge-limited' : '';
            
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${item.previewImage.url}" alt="${item.name}" class="product-image" loading="lazy">
                    <span class="badge ${isLimited}">${badgeText}</span>
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
        announcement: "Kostenloser Versand für alle Bestellungen ab 99,99 €",
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
        badge_new: "Neu",
        badge_limited: "Limitiert",
        tournament_home_tag: "Limitierter Drop",
        tournament_home_title: "Summer Fan Edition",
        tournament_home_desc: "Unterstütze dein Team im puren nordischen Stil. Limitiert, minimalistisch und nachhaltig gefertigt.",
        tournament_germany_title: "Deutschland Edition",
        tournament_germany_desc: "Das deutsche Sommerturnier-Design im sportlichen College-Stil.",
        tournament_sweden_title: "Schweden Edition",
        tournament_sweden_desc: "Das schwedische Sommerturnier-Design im sportlichen College-Stil.",
        tournament_norway_title: "Norwegen Edition",
        tournament_norway_desc: "Das norwegische Sommerturnier-Design im sportlichen College-Stil.",
        btn_discover_drop: "Drop Entdecken",
        coll_tournament_tag: "Limited Summer Drop",
        coll_tournament_title: "Summer Tournament Fan Edition",
        coll_tournament_desc: "Die exklusiven Fan-Editionen für Deutschland, Schweden und Norwegen. Minimalistisches, nordisch inspiriertes College-Design für das Sommerturnier.",
        coll_tournament_btn: "Fan-Editionen ansehen",
        shop_tag: "Offizieller Store",
        shop_title: "nørvale Online-Shop",
        shop_desc: "Bestelle unsere Kollektionen direkt über den eingebetteten Store. Sicher, schnell und direkt geliefert.",
        shop_loading: "Kollektionen werden geladen...",
        shop_fallback_btn: "Direkt zu Spreadshop öffnen",
        coll_tag: "Unsere Drops",
        coll_title: "Kollektionen",
        coll_noe_tag: "Neu eingetroffen",
        coll_noe_title: "Nø Statement Collection",
        coll_noe_desc: "Clean, reduziert und ausdrucksstark: Nø ist minimalistisches Statement-Wear mit nordischem Stil und klarer Haltung.",
        coll_noe_btn: "Kollektion shoppen",
        coll_norvale_tag: "Heritage Line",
        coll_norvale_title: "Nørvale Collection – Nordic Style",
        coll_norvale_desc: "Klassische Schnitte, feine Typografie und unser markantes Logo-Stick. Diese Linie verkörpert die Essenz des nordischen Minimalismus.",
        coll_norvale_btn: "Kollektion ansehen",
        coll_iceland_tag: "Special Drop",
        coll_iceland_title: "Iceland Heritage Collection",
        coll_iceland_desc: "Inspiriert von der rauen Vulkanlandschaft und den Gletschern Islands. Diese exklusive Linie verbindet die isländische Flagge mit der Seele von nørvale.",
        coll_iceland_btn: "Kollektion shoppen",
        coll_preview_title: "Highlights der Kollektion",
        founders_tag: "Handgemachtes Konzept",
        founders_title: "Mit Herzblut &amp; Natur im Sinn.",
        founders_text: "Hinter nørvale steht kein unpersönlicher Großkonzern, sondern ein kleines Gründerteam mit einer klaren Vision und einer großen Portion Herzblut.<br><br>nørvale entstand aus unserer Sehnsucht nach Klarheit, der ungezähmten skandinavischen Natur und Kleidung, auf die man sich verlassen kann. Wir stecken unzählige Stunden in die Auswahl ehrlicher, biologischer Materialien, minimalistischer Schnitte und zeitloser Details.<br><br>Für uns ist nørvale nicht einfach nur Kleidung – es ist ein Lebensgefühl von Freiheit, Langlebigkeit und Bewusstsein, das wir mit dir teilen möchten. Danke, dass du Teil unserer Reise bist.",
        about_tag: "Unsere Philosophie",
        about_heading: "Die Seele des Nordens.",
        about_lead: "nørvale entstand aus der Sehnsucht nach Klarheit, Natur und langlebiger Kleidung. Unsere Designs spiegeln die weite, raue Landschaft des Nordens wider.",
        about_story_title_1: "Bewusster Minimalismus",
        about_story_desc_1: "Wir glauben nicht an schnelllebige Trends. Jedes nørvale-Stück ist so konzipiert, dass es vielseitig kombinierbar ist und Saison für Saison getragen werden kann.",
        about_story_title_2: "Verantwortung & Materialien",
        about_story_desc_2: "In Zusammenarbeit mit Spreadshop setzen wir auf eine bedarfsgerechte Produktion (Print-on-Demand), um Textilmüll und Überproduktion zu minimieren. Wir bevorzugen biologische Fasern und umweltfreundliche Druckverfahren.",
        sustain_tag: "Verantwortung",
        sustain_title: "Nachhaltigkeit bei nørvale",
        sustain_intro: "Unsere Natur ist nicht nur Inspiration – sie ist unsere Lebensgrundlage. Deshalb tun wir alles, um sie zu schützen.",
        sustain_card_title_1: "On-Demand Produktion",
        sustain_card_desc_1: "Wir drucken erst, wenn du bestellst. Das vermeidet Überproduktion und schont wertvolle Ressourcen.",
        sustain_card_title_2: "GOTS-Bio-Baumwolle",
        sustain_card_desc_2: "Unsere Kleidung besteht aus kontrolliert biologisch angebauter Baumwolle – ohne Pestizide oder giftige Chemie.",
        sustain_card_title_3: "Plastikfreier Versand",
        sustain_card_desc_3: "Deine Bestellung wird in recycelten und plastikfreien Papierverpackungen klimaneutral an dich versendet.",
        values_view_tag: "Wofür wir stehen",
        values_view_title: "Unsere Werte",
        values_view_intro: "Bei nørvale geht es um mehr als Kleidung. Es geht um eine Lebenseinstellung.",
        value_card_title_1: "Nordische Gelassenheit",
        value_card_desc_1: "Unsere Entwürfe strahlen die Einfachheit und Klarheit skandinavischer Landschaften aus. Ruhe statt Hektik, Design statt Modewahn.",
        value_card_title_2: "Langlebige Qualität",
        value_card_desc_2: "Ein Kleidungsstück sollte dich über Jahre begleiten. Wir designen Essentials, die langlebig, robust und zeitlos bleiben.",
        value_card_title_3: "Echter Minimalismus",
        value_card_desc_3: "Wir glauben an den \"Pursuit of Less\" – weniger kaufen, aber dafür bewusster auswählen und pflegen.",
        contact_tag: "Schreib uns",
        contact_heading: "Kontaktiere das nørvale Team",
        contact_desc: "Hast du Fragen zu deiner Bestellung, unseren Produkten oder Kooperationen? Wir sind für dich da.",
        contact_detail_label_email: "E-Mail",
        contact_detail_label_phone: "Telefon",
        contact_detail_label_hours: "Support-Zeiten",
        contact_detail_val_hours: "Montag – Freitag: 09:00 – 17:00 Uhr",
        contact_form_name: "Dein Name",
        contact_form_email: "Deine E-Mail",
        contact_form_msg: "Nachricht",
        contact_form_submit: "Nachricht senden",
        contact_placeholder_name: "z.B. Anna Müller",
        contact_placeholder_email: "z.B. anna@email.de",
        contact_placeholder_msg: "Wie können wir dir helfen?",
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
        footer_imprint: "Impressum",
        footer_shipping_returns: "Versand & Rückgabe",
        legal_tab_imprint: "Impressum",
        legal_tab_shipping_returns: "Versand & Rückgabe",
        legal_tab_privacy: "Datenschutz",
        legal_tab_terms: "AGB",
        legal_imprint_content: `<h2>Impressum</h2><p><strong>Nørvale Clothing / baokmedia</strong></p><p>Eupener Straße 4<br>22049 Hamburg</p><p><strong>Vertreten durch:</strong><br>Olaf Balko</p><p><strong>Kontakt:</strong><br>E-Mail: olli1270@gmail.com<br>Telefon: +49 (0) 176 84128588</p><p><strong>Haftungshinweis:</strong><br>Wir sind für die Inhalte unserer eigenen Seiten nach den allgemeinen Gesetzen verantwortlich. Alle Kaufverträge, Lieferungen und Kundenservice-Angelegenheiten der Spreadshop-Kollektionen werden ausschließlich von der sprd.net AG (Spreadshirt) abgewickelt.</p><p><strong>Online-Streitbeilegung (OS):</strong><br>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a> finden. Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`,
        legal_shipping_returns_content: `<h2>Versand &amp; Rückgabe</h2><h3>1. Versandbedingungen</h3><p>Alle Bestellungen und Lieferungen werden in Kooperation mit unserem Partner <strong>sprd.net AG (Spreadshirt)</strong> abgewickelt und versendet. Dadurch können wir eine bedarfsgerechte Produktion (Print-on-Demand) anbieten, was Ressourcen schont und Überproduktion vermeidet.</p><ul><li><strong>Versandkosten:</strong> Standardversand innerhalb Deutschlands und der EU ab 3,99 € (abhängig von Produktart und Gewicht). Der genaue Betrag wird dir vor dem Kauf im Warenkorb angezeigt.</li><li><strong>Kostenloser Versand:</strong> Ab einem Bestellwert von 99,99 € liefern wir standardmäßig versandkostenfrei.</li><li><strong>Lieferzeiten:</strong> Die Lieferzeit innerhalb Deutschlands und der EU beträgt in der Regel 3 bis 7 Werktage ab Bestelleingang. Da jedes Produkt individuell für dich bedruckt wird, kann es in Ausnahmefällen zu geringfügigen Verzögerungen kommen.</li><li><strong>Versanddienstleister:</strong> Der Versand erfolgt klimaneutral in plastikfreier Papierverpackung über DHL, DPD oder UPS.</li></ul><h3>2. Rückgaberichtlinien &amp; Widerrufsrecht</h3><p>Wir möchten, dass du mit deiner Bestellung rundum zufrieden bist. Sollte ein Kleidungsstück einmal nicht passen oder dir nicht gefallen, profitierst du von unserer kundenfreundlichen Rückgabegarantie:</p><ul><li><strong>30 Tage Rückgaberecht:</strong> Du kannst ungetragene und unbeschädigte Produkte innerhalb von 30 Tagen ab Erhalt der Ware zurückgeben.</li><li><strong>Rückgabeoptionen:</strong> Du kannst deine Produkte problemlos gegen eine andere Größe umtauschen, einen Gutschein für deine nächste Bestellung erhalten oder dir den Kaufpreis zurückerstatten lassen.</li><li><strong>Rücksendeadresse:</strong> Alle Retouren werden direkt durch das Rücksendezentrum unseres Partners abgewickelt. Bitte sende Retouren an folgende Adresse:<br><em>sprd.net AG<br>Retouren / nørvale<br>Gießerstraße 27<br>04229 Leipzig<br>Deutschland</em></li><li><strong>Ablauf einer Retoure:</strong> Den Rücksende-Prozess kannst du ganz einfach über den Link in deiner Versandbestätigung starten oder indem du dich mit deiner Bestellnummer an unseren Kundenservice unter <a href="mailto:olli1270@gmail.com">olli1270@gmail.com</a> wendest.</li></ul>`,
        legal_privacy_content: `<h2>Datenschutzerklärung</h2><h3>1. Datenschutz auf einen Blick</h3><p>Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf unserer Landingpage und dem eingebetteten Spreadshop-Bereich auf.</p><h3>2. Hosting durch Vercel</h3><p>Wir hosten unsere Website bei Vercel (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA). Zur Bereitstellung der Website erfasst Vercel automatisiert Server-Logfiles (IP-Adresse, Browsertyp, Referrer-URL, Uhrzeit). Dies erfolgt auf Grundlage unserer berechtigten Interessen an einem sicheren und effizienten Betrieb unserer Website (Art. 6 Abs. 1 lit. f DSGVO).</p><h3>3. Eingebetteter Spreadshop (sprd.net AG)</h3><p>Auf dieser Website ist ein Online-Shop eingebettet, der technisch und rechtlich von der <strong>sprd.net AG (Spreadshirt)</strong>, Gießerstraße 27, 04229 Leipzig, Deutschland, betrieben wird. Wenn Sie den Shop-Bereich aufrufen oder eine Bestellung tätigen, verarbeitet Spreadshirt Ihre Daten (inkl. IP-Adresse, Browser-Details, Cookies und Bestelldaten) eigenverantwortlich für die Zahlungsabwicklung, Produktion und Lieferung. Weitere Informationen finden Sie in der <a href="https://www.spreadshirt.de/datenschutz-C3858" target="_blank">Datenschutzerklärung von Spreadshirt</a>.</p><h3>4. Lokaler Speicher (LocalStorage)</h3><p>Wir speichern Ihre ausgewählte Sprache (DE/EN) in Ihrem Browser (LocalStorage), um Ihnen die Seite beim nächsten Aufruf direkt in Ihrer Wunschsprache anzuzeigen. Dies stellt ein berechtigtes Interesse dar (Art. 6 Abs. 1 lit. f DSGVO).</p>`,
        legal_terms_content: `<h2>Allgemeine Geschäftsbedingungen (AGB)</h2><h3>1. Geltungsbereich</h3><p>Diese Bedingungen gelten für die Nutzung der Landingpage nørvaleclothing.store. Für Bestellungen im Online-Shop gelten gesonderte Bedingungen.</p><h3>2. Vertragspartner für Bestellungen</h3><p>Alle Verträge, Lieferungen und Serviceleistungen, die über den auf dieser Website eingebetteten Online-Shop getätigt werden, kommen ausschließlich zwischen dem Besteller und der <strong>sprd.net AG (Spreadshirt)</strong>, Gießerstraße 27, 04229 Leipzig, Deutschland zustande. Es gelten die allgemeinen Geschäftsbedingungen und Widerrufsbelehrungen von sprd.net AG, die im integrierten Shop-Widget einsehbar sind.</p><h3>3. Haftungsbeschränkung für Inhalte</h3><p>Wir erstellen die redaktionellen Inhalte dieser Landingpage mit größter Sorgfalt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte von verlinkten Spreadshirt-Produkten oder Preisen können wir jedoch keine Gewähr übernehmen, da diese direkt und dynamisch von Spreadshirt bereitgestellt werden.</p>`
    },
    en: {
        announcement: "Free shipping on all orders over 99.99 €",
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
        badge_new: "New",
        badge_limited: "Limited",
        tournament_home_tag: "Limited Drop",
        tournament_home_title: "Summer Fan Edition",
        tournament_home_desc: "Support your team in pure Nordic style. Limited, minimalist, and sustainably crafted.",
        tournament_germany_title: "Germany Edition",
        tournament_germany_desc: "The German summer tournament design in an athletic college style.",
        tournament_sweden_title: "Sweden Edition",
        tournament_sweden_desc: "The Swedish summer tournament design in an athletic college style.",
        tournament_norway_title: "Norway Edition",
        tournament_norway_desc: "The Norwegian summer tournament design in an athletic college style.",
        btn_discover_drop: "Discover Drop",
        coll_tournament_tag: "Limited Summer Drop",
        coll_tournament_title: "Summer Tournament Fan Edition",
        coll_tournament_desc: "The exclusive fan editions for Germany, Sweden, and Norway. Minimalist, Nordic-inspired college design for the summer tournament.",
        coll_tournament_btn: "Explore Fan Editions",
        shop_tag: "Official Store",
        shop_title: "nørvale Online Shop",
        shop_desc: "Order our collections directly through the embedded store. Secure, fast, and delivered straight to you.",
        shop_loading: "Loading collections...",
        shop_fallback_btn: "Open Spreadshop directly",
        coll_tag: "Our Drops",
        coll_title: "Collections",
        coll_noe_tag: "New In",
        coll_noe_title: "Nø Statement Collection",
        coll_noe_desc: "Clean, reduced, and expressive: Nø is minimalist statement wear with Nordic style and a clear attitude.",
        coll_noe_btn: "Shop Collection",
        coll_norvale_tag: "Heritage Line",
        coll_norvale_title: "Nørvale Collection – Nordic Style",
        coll_norvale_desc: "Classic cuts, fine typography, and our signature logo embroidery. This line embodies the essence of Nordic minimalism.",
        coll_norvale_btn: "View Collection",
        coll_iceland_tag: "Special Drop",
        coll_iceland_title: "Iceland Heritage Collection",
        coll_iceland_desc: "Inspired by the raw volcanic landscape and glaciers of Iceland. This exclusive line combines the Icelandic flag with the soul of nørvale.",
        coll_iceland_btn: "Shop Collection",
        coll_preview_title: "Highlights of the Collection",
        founders_tag: "Our Philosophy",
        founders_title: "Crafted with heart, soul, and nature in mind.",
        founders_text: "Behind nørvale is not an impersonal corporation, but a small team of founders with a clear vision and a whole lot of heart and soul.<br><br>nørvale was born from our longing for clarity, the untamed Scandinavian nature, and garments you can truly rely on. We spend countless hours selecting honest, organic materials, minimalist cuts, and timeless details.<br><br>For us, nørvale is not just clothing – it is a lifestyle of freedom, longevity, and awareness that we want to share with you. Thank you for being a part of our journey.",
        about_tag: "Our Philosophy",
        about_heading: "The Soul of the North.",
        about_lead: "nørvale was born from a desire for clarity, nature, and long-lasting garments. Our designs reflect the wide, raw landscape of the North.",
        about_story_title_1: "Conscious Minimalism",
        about_story_desc_1: "We do not believe in fast-paced trends. Each nørvale piece is designed to be versatile and worn season after season.",
        about_story_title_2: "Responsibility & Materials",
        about_story_desc_2: "In partnership with Spreadshop, we rely on print-on-demand production to minimize textile waste and overproduction. We prefer organic fibers and eco-friendly printing methods.",
        sustain_tag: "Responsibility",
        sustain_title: "Sustainability at nørvale",
        sustain_intro: "Nature is not just our inspiration – it is our source of life. That is why we do everything to protect it.",
        sustain_card_title_1: "On-Demand Production",
        sustain_card_desc_1: "We print only when you order. This prevents overproduction and conserves valuable resources.",
        sustain_card_title_2: "GOTS Organic Cotton",
        sustain_card_desc_2: "Our clothing is made from certified organic cotton – without pesticides or toxic chemicals.",
        sustain_card_title_3: "Plastic-Free Shipping",
        sustain_card_desc_3: "Your order is shipped climate-neutrally in recycled, plastic-free paper packaging.",
        values_view_tag: "What we stand for",
        values_view_title: "Our Values",
        values_view_intro: "At nørvale, it is about more than just clothing. It is about a mindset.",
        value_card_title_1: "Nordic Serenity",
        value_card_desc_1: "Our designs reflect the simplicity and clarity of Scandinavian landscapes. Quietness over hecticness, purpose over fashion trends.",
        value_card_title_2: "Long-lasting Quality",
        value_card_desc_2: "A garment should accompany you for years. We design essentials that remain durable, robust, and timeless.",
        value_card_title_3: "Conscious Minimalism",
        value_card_desc_3: "We believe in the \"Pursuit of Less\" – buying less, but selecting and caring for items more consciously.",
        contact_tag: "Get in touch",
        contact_heading: "Contact the nørvale Team",
        contact_desc: "Do you have questions about your order, our products, or collaborations? We are here to help.",
        contact_detail_label_email: "Email",
        contact_detail_label_phone: "Phone",
        contact_detail_label_hours: "Support Hours",
        contact_detail_val_hours: "Monday – Friday: 09:00 AM – 05:00 PM",
        contact_form_name: "Your Name",
        contact_form_email: "Your Email",
        contact_form_msg: "Message",
        contact_form_submit: "Send Message",
        contact_placeholder_name: "e.g. Jane Doe",
        contact_placeholder_email: "e.g. jane@email.com",
        contact_placeholder_msg: "How can we help you?",
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
        footer_imprint: "Imprint",
        footer_shipping_returns: "Shipping & Returns",
        legal_tab_imprint: "Imprint",
        legal_tab_shipping_returns: "Shipping & Returns",
        legal_tab_privacy: "Privacy Policy",
        legal_tab_terms: "Terms & Conditions",
        legal_imprint_content: `<h2>Imprint</h2><p><strong>Nørvale Clothing / baokmedia</strong></p><p>Eupener Straße 4<br>22049 Hamburg</p><p><strong>Represented by:</strong><br>Olaf Balko</p><p><strong>Contact:</strong><br>Email: olli1270@gmail.com<br>Phone: +49 (0) 176 84128588</p><p><strong>Disclaimer:</strong><br>We are responsible for the content of our own pages according to general laws. All sales contracts, deliveries, and customer service inquiries regarding the Spreadshop collections are handled exclusively by sprd.net AG (Spreadshirt).</p><p><strong>Online Dispute Resolution (ODR):</strong><br>The European Commission provides a platform for online dispute resolution (ODR), which can be found at <a href="https://ec.europa.eu/consumers/odr" target="_blank">https://ec.europa.eu/consumers/odr</a>. We are neither willing nor obligated to participate in dispute resolution proceedings before a consumer arbitration board.</p>`,
        legal_shipping_returns_content: `<h2>Shipping &amp; Returns</h2><h3>1. Shipping Terms</h3><p>All orders and deliveries are processed and shipped in cooperation with our partner <strong>sprd.net AG (Spreadshirt)</strong>. This allows us to offer print-on-demand production, which conserves resources and avoids overproduction.</p><ul><li><strong>Shipping Costs:</strong> Standard shipping within Germany and the EU starts at 3.99 € (depending on product type and weight). The exact amount will be displayed in your shopping cart before checkout.</li><li><strong>Free Shipping:</strong> For orders over 99.99 €, we offer free standard shipping.</li><li><strong>Delivery Times:</strong> Delivery within Germany and the EU usually takes 3 to 7 business days from receipt of order. Since each product is printed individually for you, minor delays may occur in exceptional cases.</li><li><strong>Shipping Carrier:</strong> Shipping is climate-neutral in plastic-free paper packaging via DHL, DPD, or UPS.</li></ul><h3>2. Return Policy &amp; Right of Withdrawal</h3><p>We want you to be completely satisfied with your order. If a garment does not fit or you do not like it, you can take advantage of our customer-friendly return guarantee:</p><ul><li><strong>30-Day Return Right:</strong> You can return unworn and undamaged products within 30 days of receipt.</li><li><strong>Return Options:</strong> You can easily exchange your products for a different size, receive a voucher for your next order, or get a refund of the purchase price.</li><li><strong>Return Address:</strong> All returns are handled directly by our partner's return center. Please send returns to the following address:<br><em>sprd.net AG<br>Returns / nørvale<br>Gießerstraße 27<br>04229 Leipzig<br>Germany</em></li><li><strong>Return Process:</strong> You can easily start the return process via the link in your shipping confirmation email, or by contacting our customer service with your order number at <a href="mailto:olli1270@gmail.com">olli1270@gmail.com</a>.</li></ul>`,
        legal_privacy_content: `<h2>Privacy Policy</h2><h3>1. Privacy at a Glance</h3><p>This privacy policy explains the nature, scope, and purpose of the processing of personal data on our landing page and the embedded Spreadshop section.</p><h3>2. Hosting by Vercel</h3><p>We host our website with Vercel (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA). To deliver the website, Vercel automatically collects server log files (IP address, browser type, referrer URL, timestamp). This is based on our legitimate interests in operating our website securely and efficiently (Art. 6 para. 1 lit. f GDPR).</p><h3>3. Embedded Spreadshop (sprd.net AG)</h3><p>An online shop is embedded on this website, which is technically and legally operated by <strong>sprd.net AG (Spreadshirt)</strong>, Gießerstraße 27, 04229 Leipzig, Germany. When you access the shop section or place an order, Spreadshirt processes your data (including IP address, browser details, cookies, and order information) under its own responsibility for payment processing, production, and delivery. For more details, please view the <a href="https://www.spreadshirt.com/privacy-policy-C3858" target="_blank">Spreadshirt Privacy Policy</a>.</p><h3>4. Local Storage</h3><p>We store your selected language (DE/EN) in your browser's LocalStorage to display the site in your preferred language upon your next visit. This constitutes a legitimate interest (Art. 6 para. 1 lit. f GDPR).</p>`,
        legal_terms_content: `<h2>Terms & Conditions (AGB)</h2><h3>1. Scope of Application</h3><p>These terms apply to the use of the landing page nørvaleclothing.store. Separate terms apply to orders placed in the online shop.</p><h3>2. Contractual Partner for Orders</h3><p>All contracts, deliveries, and services placed via the online shop embedded on this website are established exclusively between the customer and <strong>sprd.net AG (Spreadshirt)</strong>, Gießerstraße 27, 04229 Leipzig, Germany. The terms and conditions and cancellation policy of sprd.net AG apply, which can be viewed inside the integrated shop widget.</p><h3>3. Limitation of Liability for Content</h3><p>We create the editorial content of this landing page with the utmost care. However, we cannot assume liability for the accuracy, completeness, or timeliness of prices or product details, as they are provided dynamically by Spreadshirt.</p>`
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

/**
 * Initialize Legal Tab Click Event Handlers
 */
function initLegalTabs() {
    const tabButtons = document.querySelectorAll('.legal-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-legal-section');
            if (section) {
                window.location.hash = `#${section}`;
            }
        });
    });
}
window.initLegalTabs = initLegalTabs;

/**
 * Switch Active Legal Section Tab & Content Panel
 */
function switchLegalTab(tabName) {
    const tabButtons = document.querySelectorAll('.legal-tab-btn');
    const contentPanels = document.querySelectorAll('.legal-section-content');
    
    // Toggle active state for tab buttons
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-legal-section') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Toggle active state for content panels
    contentPanels.forEach(panel => {
        if (panel.id === `legal-section-${tabName}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}
window.switchLegalTab = switchLegalTab;


