# Spreadshop Custom CSS (Schwarze Balken entfernen)

Da der Spreadshop auf deiner Seite über ein geschütztes **Iframe** eingebunden ist, greift das Stylesheet deiner Website nicht im Inneren des Shops. Du musst diesen CSS-Code kopieren und direkt in deinem **Spreadshirt/Spreadshop-Partnerbereich** einfügen.

---

## 📋 Schritt-für-Schritt-Anleitung

1. Melde dich im **[Spreadshop Partnerbereich](https://www.spreadshirt.de/partnerbereich/)** an.
2. Gehe im linken Menü auf **Erweiterte Einstellungen** -> **HTML & CSS**.
3. Klicke auf den Reiter **Shop-CSS bearbeiten**.
4. Kopiere den untenstehenden CSS-Code vollständig.
5. Füge ihn in das Textfeld ein und klicke auf **Speichern**.

---

## 💻 CSS-Code zum Kopieren

```css
/* ==========================================
   NØRVALE SHOP CUSTOM CSS (Scoped to #myShop)
   Removes black bars and matches minimalist style
   ========================================== */

/* 1. Kategorie-Navigationsleiste (von Schwarz auf Weiß/Transparent) */
#myShop .sprd-navigation,
#myShop [class*="navigation-bar"],
#myShop [class*="category-menu"],
#myShop [class*="category-list"],
#myShop [class*="menu-bar"] {
    background-color: #fcfbfa !important; /* Weißer/Off-White Hintergrund */
    background: #fcfbfa !important;
    border-top: 1px solid #e5e5e5 !important; /* Dünner, grauer Trenner */
    border-bottom: 1px solid #e5e5e5 !important;
    border-left: none !important;
    border-right: none !important;
    box-shadow: none !important;
    padding: 0.5rem 1rem !important;
}

/* Navigations-Schriftfarben und Buttons */
#myShop .sprd-navigation *,
#myShop [class*="navigation-bar"] *,
#myShop [class*="category-menu"] *,
#myShop [class*="category-list"] *,
#myShop [class*="menu-bar"] * {
    background-color: transparent !important;
    color: #1c1b1a !important; /* Dunkelgrauer Text */
}

/* Entfernt Rahmen und Box-Hintergründe um einzelne Navigations-Buttons und Menü-Einträge */
#myShop .sprd-navigation button,
#myShop .sprd-navigation a,
#myShop [class*="navigation-bar"] button,
#myShop [class*="navigation-bar"] a,
#myShop [class*="category-menu"] button,
#myShop [class*="category-menu"] a,
#myShop [class*="category-list"] button,
#myShop [class*="category-list"] a,
#myShop [class*="category-list"] li,
#myShop [class*="menu-bar"] button,
#myShop [class*="menu-bar"] a,
#myShop [class*="category-list"] [class*="item"] {
    border: none !important;
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0.5rem 0.75rem !important;
}

/* Hover-Farbe der Links in der Navigation */
#myShop .sprd-navigation a:hover,
#myShop [class*="navigation-bar"] a:hover,
#myShop [class*="category-menu"] a:hover,
#myShop .sprd-navigation button:hover,
#myShop [class*="navigation-bar"] button:hover,
#myShop [class*="category-menu"] button:hover,
#myShop [class*="category-list"] a:hover,
#myShop [class*="category-list"] button:hover {
    color: #8b8070 !important; /* Accent-Farbe */
}

/* Aktiver Link in der Navigation */
#myShop .sprd-navigation [class*="active"],
#myShop .sprd-navigation [class*="active"] * {
    color: #8b8070 !important;
    font-weight: 500 !important;
}

/* Dropdown-Menüs bei Klick auf "Männer", "Frauen" usw. */
#myShop [class*="dropdown"],
#myShop [class*="popover"],
#myShop [class*="menu-dropdown"],
#myShop [class*="active-filters"] {
    background-color: #fcfbfa !important;
    border: 1px solid #e5e5e5 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

#myShop [class*="dropdown"] *,
#myShop [class*="popover"] * {
    color: #1c1b1a !important;
}

#myShop [class*="dropdown"] *:hover,
#myShop [class*="popover"] *:hover {
    background-color: #f5f4f2 !important;
    color: #8b8070 !important;
}


/* 2. Produkt-Detailseite (Schwarze Balken links/rechts neben Bild entfernen) */
#myShop,
#myShop .sprd-app,
#myShop [class*="app-container"] {
    background-color: #fcfbfa !important;
    background: #fcfbfa !important;
}

#myShop .sprd-detail-stage,
#myShop [class*="detail-stage"],
#myShop [class*="detail-image"],
#myShop [class*="img-container"],
#myShop .sprd-img-container,
#myShop [class*="stage"],
#myShop [class*="slider"],
#myShop [class*="carousel"],
#myShop [class*="gallery"],
#myShop [class*="view"],
#myShop [class*="slide"] {
    background-color: #fcfbfa !important;
    background: #fcfbfa !important;
}

/* 3. Detail-Elemente wie Beschreibungen und Akkordeons */
#myShop [class*="detail"] [class*="description"],
#myShop [class*="detail"] [class*="tabs"],
#myShop [class*="detail"] [class*="accordion"],
#myShop [class*="detail"] [class*="panel"],
#myShop [class*="size-select"],
#myShop [class*="quantity-select"],
#myShop [class*="appearance-select"] {
    background-color: transparent !important;
    background: transparent !important;
    color: #1c1b1a !important;
}

/* 4. Reset für Slider- und Karussell-Navigationspfeile (entfernt weiße Boxen an den Seiten) */
#myShop .sprd-detail-stage__next,
#myShop .sprd-detail-stage__prev,
#myShop [class*="stage__next"],
#myShop [class*="stage__prev"],
#myShop [class*="slider__button"],
#myShop [class*="carousel__button"],
#myShop [class*="button--next"],
#myShop [class*="button--prev"],
#myShop [class*="arrow"],
#myShop [class*="chevron"],
#myShop [class*="control"] {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

#myShop .sprd-detail-stage__next *,
#myShop .sprd-detail-stage__prev *,
#myShop [class*="stage__next"] *,
#myShop [class*="stage__prev"] *,
#myShop [class*="slider__button"] *,
#myShop [class*="carousel__button"] * {
    background-color: transparent !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* 5. Pagination und Seitenlimit-Auswahl (entfernt überlappende schwarze Blöcke) */
#myShop [class*="pagination"],
#myShop [class*="pagination"] *,
#myShop [class*="page-size"],
#myShop [class*="page-size"] *,
#myShop [class*="limit"],
#myShop [class*="limit"] *,
#myShop [class*="items-per-page"],
#myShop [class*="items-per-page"] * {
    background-color: transparent !important;
    background: transparent !important;
    color: #1c1b1a !important;
    border-color: #e5e5e5 !important;
    box-shadow: none !important;
}

#myShop [class*="pagination"] button,
#myShop [class*="pagination"] a,
#myShop [class*="page-size"] button,
#myShop [class*="page-size"] a,
#myShop [class*="limit"] button,
#myShop [class*="limit"] a {
    border: 1px solid #e5e5e5 !important;
    background-color: #fcfbfa !important;
    color: #1c1b1a !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    border-radius: 4px !important;
    transition: all 0.2s ease-in-out !important;
    display: inline-block !important;
    margin: 0 0.25rem !important;
}

#myShop [class*="pagination"] button:hover,
#myShop [class*="pagination"] a:hover,
#myShop [class*="page-size"] button:hover,
#myShop [class*="page-size"] a:hover,
#myShop [class*="limit"] button:hover,
#myShop [class*="limit"] a:hover {
    background-color: #f5f4f2 !important;
    border-color: #1c1b1a !important;
    color: #1c1b1a !important;
}

#myShop [class*="pagination"] [class*="active"],
#myShop [class*="pagination"] [class*="current"] {
    background-color: #1c1b1a !important;
    border-color: #1c1b1a !important;
    color: #fcfbfa !important;
}



```
