/**
 * Alberto Watch Company - Interactive Application Logic
 * Implements: Slider, Catalog Filtering, Modal Windows, Visitor Counter,
 * HTML5 Geolocation Ticker, Price List, Gallery Lightbox, and Smooth Navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all subsystems
  initThemeSwitcher();
  initVisitorCounter();
  initGeolocationTicker();
  initNavigation();
  initHeroSlider();
  initProductCatalog();
  initWatchModal();
  initPriceList();
  initStoreLocator();
  initGalleryLightbox();
  initContactForm();
  initWishlist();
});

/* ==========================================================================
   0. THEME SWITCHER (Forest Midnight, Ivory Atelier, Midnight Atelier)
   ========================================================================== */
function initThemeSwitcher() {
  const storedTheme = localStorage.getItem("alberto_theme") || "forest-midnight";
  applyTheme(storedTheme, false);

  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const themeChoice = btn.getAttribute("data-theme-choice");
      applyTheme(themeChoice, true);
    });
  });

  document.querySelectorAll(".theme-showcase-card").forEach(card => {
    card.addEventListener("click", () => {
      const themeChoice = card.getAttribute("data-theme-trigger");
      applyTheme(themeChoice, true);
    });
  });
}

function applyTheme(themeName, showNotification = true) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("alberto_theme", themeName);

  document.querySelectorAll(".theme-btn").forEach(btn => {
    if (btn.getAttribute("data-theme-choice") === themeName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".theme-showcase-card").forEach(card => {
    if (card.getAttribute("data-theme-trigger") === themeName) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  if (showNotification) {
    const formatted = themeName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    showToast(`Active Theme: ${formatted}`);
  }
}

window.switchTheme = applyTheme;

/* ==========================================================================
   1. VISITOR COUNTER (Requirement: Display visitor count at top right corner)
   ========================================================================== */
function initVisitorCounter() {
  const visitorElement = document.getElementById("visitor-count-number");
  if (!visitorElement) return;

  // Base seed number + localStorage increment
  const STORAGE_KEY = "alberto_visitor_counter";
  let currentCount = localStorage.getItem(STORAGE_KEY);

  if (!currentCount) {
    currentCount = 148920; // Prestigious initial visitor count
  } else {
    currentCount = parseInt(currentCount, 10) + 1;
  }
  localStorage.setItem(STORAGE_KEY, currentCount.toString());

  // Animate counter upwards
  const target = parseInt(currentCount, 10);
  const start = Math.max(0, target - 50);
  let current = start;
  const duration = 1200; // ms
  const stepTime = Math.abs(Math.floor(duration / 50));

  const timer = setInterval(() => {
    current += 1;
    visitorElement.textContent = current.toLocaleString();
    if (current >= target) {
      clearInterval(timer);
      visitorElement.textContent = target.toLocaleString();
    }
  }, stepTime);
}

/* ==========================================================================
   2. GEOLOCATION TICKER (Requirement: Continuous scrolling ticker at bottom)
      Current date, time, and location using HTML5 Geolocation
   ========================================================================== */
function initGeolocationTicker() {
  const timeElements = document.querySelectorAll(".ticker-live-time");
  const dateElements = document.querySelectorAll(".ticker-live-date");
  const locationElements = document.querySelectorAll(".ticker-live-location");

  // Real-time Clock
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    timeElements.forEach(el => el.textContent = timeStr);
    dateElements.forEach(el => el.textContent = dateStr);
  }

  updateClock();
  setInterval(updateClock, 1000);

  // HTML5 Geolocation API
  if ("geolocation" in navigator) {
    locationElements.forEach(el => el.textContent = "Detecting Coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        const locDisplay = `${lat}° N, ${lon}° E (Client Terminal)`;
        locationElements.forEach(el => {
          el.innerHTML = `<i class="fas fa-location-crosshairs"></i> ${locDisplay}`;
        });
      },
      (error) => {
        // Fallback to Alberto Flagship Atelier locations
        locationElements.forEach(el => {
          el.innerHTML = `<i class="fas fa-globe-americas"></i> Geneva • New York • Dubai`;
        });
      },
      { timeout: 8000 }
    );
  } else {
    locationElements.forEach(el => {
      el.innerHTML = `<i class="fas fa-globe-americas"></i> Geneva • New York • Dubai`;
    });
  }
}

/* ==========================================================================
   3. NAVIGATION (Fixed Header, Scrollspy, Smooth Offset, Mobile Menu)
   ========================================================================== */
function initNavigation() {
  const headerWrapper = document.getElementById("header-wrapper") || document.querySelector(".main-header");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("main-nav-menu");

  // Scroll effect on fixed header wrapper
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      headerWrapper.classList.add("scrolled");
    } else {
      headerWrapper.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("mobile-open");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      }
    });
  }

  // Active state on click + smooth scroll with exact header offset
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Remove active from all
          navLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");

          // Close mobile menu if open
          if (navMenu) navMenu.classList.remove("mobile-open");
          if (mobileToggle) {
            const icon = mobileToggle.querySelector("i");
            if (icon) {
              icon.classList.add("fa-bars");
              icon.classList.remove("fa-times");
            }
          }

          // Smooth scroll with offset for fixed header
          const navOffset = (headerWrapper && headerWrapper.classList.contains("scrolled")) ? 70 : 85;
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: "smooth"
          });
        }
      }
    });
  });

  // Scrollspy: update active link as user scrolls
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
        // Highlight parent dropdown if the section belongs to it
        const childItem = document.querySelector(`.dropdown-panel a.dropdown-item[href="#${sectionId}"]`);
        if (childItem) {
          const parentToggle = childItem.closest(".nav-dropdown").querySelector(".nav-dropdown-toggle");
          if (parentToggle) parentToggle.classList.add("active");
        }
      }
    });
  });

  initDropdowns(headerWrapper, navMenu, mobileToggle);
}

/* ==========================================================================
   3b. NAVBAR DROPDOWNS (hover on desktop, tap on mobile)
   ========================================================================== */
function initDropdowns(headerWrapper, navMenu, mobileToggle) {
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  const isMobile = () => window.matchMedia("(max-width: 1280px)").matches;

  function closeAll(except = null) {
    dropdowns.forEach(d => { if (d !== except) d.classList.remove("open"); });
  }

  function closeMobileMenu() {
    if (navMenu) navMenu.classList.remove("mobile-open");
    if (mobileToggle) {
      const icon = mobileToggle.querySelector("i");
      if (icon) { icon.classList.add("fa-bars"); icon.classList.remove("fa-times"); }
    }
  }

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(".nav-dropdown-toggle");

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobile()) { closeAll(dropdown); dropdown.classList.add("open"); return; }
      const willOpen = !dropdown.classList.contains("open");
      closeAll(dropdown);
      dropdown.classList.toggle("open", willOpen);
    });

    // Desktop hover
    dropdown.addEventListener("mouseenter", () => { if (!isMobile()) { closeAll(dropdown); dropdown.classList.add("open"); } });
    dropdown.addEventListener("mouseleave", () => { if (!isMobile()) dropdown.classList.remove("open"); });
  });

  // Section links inside dropdowns
  document.querySelectorAll(".dropdown-panel a.dropdown-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const filter = item.getAttribute("data-filter");
      if (filter) filterCategory(filter);

      const target = document.querySelector(item.getAttribute("href"));
      if (target) {
        const navOffset = (headerWrapper && headerWrapper.classList.contains("scrolled")) ? 70 : 85;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
      closeAll();
      closeMobileMenu();
    });
  });

  // Theme items: close dropdown after choosing
  document.querySelectorAll(".dropdown-panel .theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAll();
      closeMobileMenu();
    });
  });

  // Click outside / Escape closes dropdowns
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

/* Select a product category tab programmatically */
function filterCategory(category) {
  const tab = document.querySelector(`.category-tab-btn[data-category="${category}"]`);
  if (tab) tab.click();
}
window.filterCategory = filterCategory;

/* ==========================================================================
   4. HERO SLIDER (Visual Presentation with Auto-play & Controls)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll(".slider-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");

  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval = null;
  const INTERVAL_TIME = 5500;

  dots.forEach(dot => dot.style.setProperty("--slide-interval", `${INTERVAL_TIME}ms`));

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
    if (dots[currentSlide]) dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, INTERVAL_TIME);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const slideIndex = parseInt(dot.getAttribute("data-slide"), 10);
      showSlide(slideIndex);
      startAutoplay();
    });
  });

  showSlide(0);
  startAutoplay();
}

/* ==========================================================================
   5. PRODUCT CATALOG & LINE-UP FILTERING
   Inspired by Rolex presentation card grid (Page 1)
   ========================================================================== */
let currentCategory = "All";
let searchQuery = "";
let currentSort = "default";

function initProductCatalog() {
  const categoryTabs = document.querySelectorAll(".category-tab-btn");
  const searchInput = document.getElementById("catalog-search-input");
  const sortSelect = document.getElementById("catalog-sort-select");

  categoryTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      renderWatchGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderWatchGrid();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderWatchGrid();
    });
  }

  renderWatchGrid();
}

function renderWatchGrid() {
  const gridContainer = document.getElementById("watch-cards-grid");
  if (!gridContainer) return;

  // Fade out transition
  gridContainer.style.opacity = "0.2";

  setTimeout(() => {
    let filtered = [...WATCH_CATALOG];

    // Filter by Category
    if (currentCategory !== "All") {
      filtered = filtered.filter(w => w.category === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchQuery) ||
        w.brand.toLowerCase().includes(searchQuery) ||
        w.reference.toLowerCase().includes(searchQuery) ||
        w.description.toLowerCase().includes(searchQuery)
      );
    }

    // Sorting
    if (currentSort === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-catalog-message">
          <i class="fas fa-clock fa-3x" style="color: var(--primary-gold); margin-bottom: 15px;"></i>
          <h3 class="title-serif" style="color: #fff; margin-bottom: 8px;">No Timepieces Found</h3>
          <p>No models match your current selection. Please adjust your search criteria or explore another category.</p>
        </div>
      `;
    } else {
      gridContainer.innerHTML = filtered.map(watch => `
        <div class="watch-card" data-watch-id="${watch.id}">
          <div class="watch-card-bg" style="background: ${watch.bgStyle};"></div>
          
          <div class="watch-card-top-tags">
            <span class="watch-tag">${watch.category}</span>
            <button class="watch-btn-wishlist ${wishlistItems.includes(watch.id) ? 'active' : ''}" data-watch-id="${watch.id}" title="${wishlistItems.includes(watch.id) ? 'In Wishlist' : 'Add to Wishlist'}">
              <i class="${wishlistItems.includes(watch.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
          </div>

          <div class="watch-card-img-stage">
            <img class="watch-card-img" 
                 src="${watch.image}" 
                 alt="${watch.name}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='assets/watch-rolex-fallback.svg';">
          </div>

          <div class="watch-card-label-bar">
            <div class="watch-model-title">${watch.name}</div>
            <div class="watch-card-micro-info">
              <span class="watch-card-price">${watch.priceFormatted}</span>
              <span class="watch-quick-view-prompt">Inspect <i class="fas fa-arrow-right"></i></span>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Attach click events to cards
    document.querySelectorAll(".watch-card").forEach(card => {
      card.addEventListener("click", (e) => {
        // If clicked wishlist button, don't open modal
        if (e.target.closest(".watch-btn-wishlist")) return;
        const watchId = card.getAttribute("data-watch-id");
        openWatchModal(watchId);
      });
    });

    // Wishlist click listeners
    document.querySelectorAll(".watch-btn-wishlist").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const watchId = btn.getAttribute("data-watch-id");
        toggleWishlist(watchId, btn);
      });
    });

    gridContainer.style.opacity = "1";
  }, 200);
}

/* ==========================================================================
   6. WATCH DETAILS MODAL (Requirement: Details displayed on popup window)
   ========================================================================== */
function initWatchModal() {
  const modal = document.getElementById("watch-details-modal");
  const closeBtn = document.getElementById("modal-close-btn");

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeWatchModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeWatchModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeWatchModal();
    }
  });
}

function openWatchModal(watchId) {
  const watch = WATCH_CATALOG.find(w => w.id === watchId);
  if (!watch) return;

  const modal = document.getElementById("watch-details-modal");
  const modalContainer = document.getElementById("modal-dynamic-content");

  modalContainer.innerHTML = `
    <div class="modal-body-grid">
      <div class="modal-visual-side" style="background: ${watch.bgStyle}">
        <img class="modal-watch-image" 
             src="${watch.image}" 
             alt="${watch.name}" 
             onerror="this.onerror=null; this.src='assets/watch-rolex-fallback.svg';">
      </div>
      <div class="modal-info-side">
        <span class="modal-brand-tag">${watch.brand} • ${watch.category}</span>
        <h2 class="modal-watch-title">${watch.name}</h2>
        <div class="modal-price-ref">
          <span class="modal-price-val">${watch.priceFormatted}</span>
          <span class="modal-ref-val">REF: ${watch.reference}</span>
        </div>
        <p class="modal-description">${watch.description}</p>

        <div class="modal-specs-table">
          <div class="modal-spec-row">
            <span class="modal-spec-label">Calibre / Movement</span>
            <span class="modal-spec-value">${watch.movement}</span>
          </div>
          <div class="modal-spec-row">
            <span class="modal-spec-label">Case Material</span>
            <span class="modal-spec-value">${watch.caseMaterial}</span>
          </div>
          <div class="modal-spec-row">
            <span class="modal-spec-label">Dial & Luminescence</span>
            <span class="modal-spec-value">${watch.dial}</span>
          </div>
          <div class="modal-spec-row">
            <span class="modal-spec-label">Diameter</span>
            <span class="modal-spec-value">${watch.diameter}</span>
          </div>
          <div class="modal-spec-row">
            <span class="modal-spec-label">Water Resistance</span>
            <span class="modal-spec-value">${watch.waterResistance}</span>
          </div>
          <div class="modal-spec-row">
            <span class="modal-spec-label">Power Reserve</span>
            <span class="modal-spec-value">${watch.powerReserve}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-primary-gold" onclick="inquireWatch('${watch.name}', '${watch.reference}')">
            <i class="fas fa-calendar-check"></i> Book Private Viewing
          </button>
          <button class="btn-ghost-luxury modal-btn-wishlist ${wishlistItems.includes(watch.id) ? 'active' : ''}" data-watch-id="${watch.id}" onclick="toggleWishlist('${watch.id}', this)">
            <i class="${wishlistItems.includes(watch.id) ? 'fas' : 'far'} fa-heart"></i> ${wishlistItems.includes(watch.id) ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeWatchModal() {
  const modal = document.getElementById("watch-details-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function inquireWatch(watchName, ref) {
  closeWatchModal();
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    const messageBox = document.getElementById("contact-message");
    if (messageBox) {
      messageBox.value = `Dear Alberto Concierge,\n\nI would like to inquire about reserving a private viewing for the ${watchName} (Ref: ${ref}). Please advise available appointments.`;
    }
    contactSection.scrollIntoView({ behavior: "smooth" });
    showToast(`Inquiry loaded for ${watchName}. Please finalize your contact details.`);
  }
}

/* ==========================================================================
   7. PRICE LIST (Requirement: Price list for all watches available)
   ========================================================================== */
function initPriceList() {
  const tableBody = document.getElementById("price-list-tbody");
  const searchInput = document.getElementById("price-table-search");
  const countDisplay = document.getElementById("price-list-count");

  if (!tableBody) return;

  function renderTable(filterQuery = "") {
    const filtered = PRICE_LIST_DATA.filter(item => 
      item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.reference.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (countDisplay) {
      countDisplay.textContent = filtered.length;
    }

    tableBody.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <div class="table-watch-cell">
            <img class="table-thumb" src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='assets/watch-rolex-fallback.svg';">
            <div>
              <div class="table-watch-title">${item.name}</div>
              <div class="table-watch-brand">${item.brand}</div>
            </div>
          </div>
        </td>
        <td><code>${item.reference}</code></td>
        <td><span class="watch-tag">${item.category}</span></td>
        <td>${item.movement}</td>
        <td><span class="table-price-tag">${item.priceFormatted}</span></td>
        <td>
          <span class="status-badge ${item.availability.includes('Vault') ? 'status-vault' : 'status-in-stock'}">
            ${item.availability}
          </span>
        </td>
        <td>
          <button class="btn-luxury-outline" style="padding: 5px 12px; font-size: 0.72rem;" onclick="openWatchModal('${item.id}')">
            View
          </button>
        </td>
      </tr>
    `).join("");
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderTable(e.target.value);
    });
  }

  renderTable();
}

/* ==========================================================================
   8. STORE LOCATOR & APPOINTMENT BOOKING (Requirement: Store locator)
   ========================================================================== */
function initStoreLocator() {
  const storeCards = document.querySelectorAll(".store-card");
  const previewCity = document.getElementById("preview-city-name");
  const previewAddress = document.getElementById("preview-address");
  const previewPhone = document.getElementById("preview-phone");
  const previewHours = document.getElementById("preview-hours");
  const previewServices = document.getElementById("preview-services");

  storeCards.forEach(card => {
    card.addEventListener("click", () => {
      storeCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      const city = card.getAttribute("data-city");
      const store = STORES_DATA.find(s => s.city.toLowerCase() === city.toLowerCase());
      if (store && previewCity) {
        previewCity.textContent = store.name;
        previewAddress.textContent = store.address;
        previewPhone.textContent = store.phone;
        previewHours.textContent = store.hours;
        if (previewServices) {
          previewServices.innerHTML = store.services.split(", ").map(s => 
            `<span class="service-pill">${s}</span>`
          ).join("");
        }
      }
    });
  });
}

/* ==========================================================================
   9. GALLERY LIGHTBOX (Requirement: Gallery for viewing different images)
   ========================================================================== */
function initGalleryLightbox() {
  const galleryCards = document.querySelectorAll(".gallery-card");
  const lightboxModal = document.getElementById("gallery-lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-expanded-img");
  const lightboxCaption = document.getElementById("lightbox-caption-text");
  const lightboxClose = document.getElementById("lightbox-close-btn");

  if (!galleryCards.length || !lightboxModal) return;

  galleryCards.forEach(card => {
    card.addEventListener("click", () => {
      const imgSrc = card.getAttribute("data-full-img");
      const title = card.getAttribute("data-title");
      const desc = card.getAttribute("data-caption");

      if (lightboxImg) lightboxImg.src = imgSrc;
      if (lightboxCaption) {
        lightboxCaption.innerHTML = `<h3 class="title-serif" style="color:#d4af37; margin-bottom: 5px;">${title}</h3><p style="color:#c2c8d0;">${desc}</p>`;
      }
      lightboxModal.classList.add("active");
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightboxModal.classList.remove("active");
    });
  }

  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove("active");
    }
  });
}

/* ==========================================================================
   10. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("alberto-contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;

    showToast(`Thank you, ${name}. Your inquiry has been routed to our Senior Horologist.`);
    form.reset();
  });
}

/* ==========================================================================
   11. WISHLIST MANAGEMENT (VIP Slide-over Drawer Screen)
   ========================================================================== */
let wishlistItems = JSON.parse(localStorage.getItem("alberto_wishlist") || "[]");

function initWishlist() {
  updateWishlistBadge();

  // Close wishlist drawer when clicking overlay background
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeWishlistScreen();
      }
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const overlay = document.getElementById("wishlist-drawer-overlay");
      if (overlay && overlay.classList.contains("active")) {
        closeWishlistScreen();
      }
    }
  });
}

function openWishlistScreen() {
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (!overlay) return;

  renderWishlistDrawer();
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeWishlistScreen() {
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
  // Restore body scroll only if watch details modal is also not active
  const watchModal = document.getElementById("watch-details-modal");
  if (!watchModal || !watchModal.classList.contains("active")) {
    document.body.style.overflow = "";
  }
}

function renderWishlistDrawer() {
  const itemsContainer = document.getElementById("wishlist-drawer-items");
  const footerContainer = document.getElementById("wishlist-drawer-footer");
  const countBadge = document.getElementById("wishlist-drawer-count");

  if (!itemsContainer) return;

  if (countBadge) {
    countBadge.textContent = `${wishlistItems.length} ${wishlistItems.length === 1 ? 'Item' : 'Items'}`;
  }

  if (wishlistItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="wishlist-empty-state">
        <div class="wishlist-empty-icon"><i class="far fa-heart"></i></div>
        <h4>Your Wishlist is Empty</h4>
        <p>Explore our master crafted timepieces and click the heart icon to save your preferred references for private inquiry.</p>
        <button class="btn btn-secondary" onclick="closeWishlistScreen()" style="margin: 0 auto; display: inline-flex;">Explore Catalog</button>
      </div>
    `;
    if (footerContainer) {
      footerContainer.innerHTML = "";
    }
    return;
  }

  // Map IDs to catalog watches
  const items = wishlistItems
    .map(id => (typeof WATCH_CATALOG !== 'undefined' ? WATCH_CATALOG.find(w => w.id === id) : null))
    .filter(Boolean);

  const totalValuation = items.reduce((acc, curr) => acc + (curr.price || 0), 0);

  itemsContainer.innerHTML = items.map(watch => `
    <div class="wishlist-item-card" data-id="${watch.id}">
      <img src="${watch.image}" alt="${watch.name}" class="wishlist-item-thumb" onerror="this.onerror=null; this.src='assets/watch-rolex-fallback.svg';">
      <div class="wishlist-item-info">
        <div class="wishlist-item-category">${watch.category}</div>
        <h4 class="wishlist-item-title">${watch.name}</h4>
        <div class="wishlist-item-ref">Ref: ${watch.reference}</div>
        <div class="wishlist-item-price">${watch.priceFormatted}</div>
      </div>
      <div class="wishlist-item-actions">
        <button class="wishlist-btn-inspect" onclick="inspectFromWishlist('${watch.id}')" title="View Specifications">Inspect</button>
        <button class="wishlist-btn-remove" onclick="removeFromWishlist('${watch.id}')" title="Remove from Wishlist"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
  `).join("");

  if (footerContainer) {
    footerContainer.innerHTML = `
      <div class="wishlist-valuation-row">
        <span class="wishlist-valuation-label">Estimated Valuation</span>
        <span class="wishlist-valuation-amount">PKR ${totalValuation.toLocaleString()}</span>
      </div>
      <div class="wishlist-footer-buttons">
        <button class="wishlist-btn-clear" onclick="clearWishlist()">Clear All</button>
        <button class="wishlist-btn-inquire-all" onclick="inquireAllWishlist()"><i class="fas fa-paper-plane"></i> Inquire Concierge</button>
      </div>
    `;
  }
}

function syncWishlistUI() {
  updateWishlistBadge();

  // Sync cards in catalog grid
  document.querySelectorAll(".watch-btn-wishlist").forEach(btn => {
    const watchId = btn.getAttribute("data-watch-id");
    const isSaved = wishlistItems.includes(watchId);
    if (isSaved) {
      btn.classList.add("active");
      btn.setAttribute("title", "In Wishlist");
      btn.innerHTML = `<i class="fas fa-heart"></i>`;
    } else {
      btn.classList.remove("active");
      btn.setAttribute("title", "Add to Wishlist");
      btn.innerHTML = `<i class="far fa-heart"></i>`;
    }
  });

  // Sync modal wishlist button if open
  const modalWishlistBtn = document.querySelector(".modal-btn-wishlist");
  if (modalWishlistBtn) {
    const currentId = modalWishlistBtn.getAttribute("data-watch-id");
    if (currentId) {
      const isSaved = wishlistItems.includes(currentId);
      if (isSaved) {
        modalWishlistBtn.classList.add("active");
        modalWishlistBtn.innerHTML = `<i class="fas fa-heart"></i> In Wishlist`;
      } else {
        modalWishlistBtn.classList.remove("active");
        modalWishlistBtn.innerHTML = `<i class="far fa-heart"></i> Add to Wishlist`;
      }
    }
  }

  // If drawer is currently active, re-render it
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (overlay && overlay.classList.contains("active")) {
    renderWishlistDrawer();
  }
}

function toggleWishlist(watchId, btnElement = null) {
  const index = wishlistItems.indexOf(watchId);
  if (index === -1) {
    wishlistItems.push(watchId);
    showToast("Timepiece added to your VIP Wishlist.");
  } else {
    wishlistItems.splice(index, 1);
    showToast("Timepiece removed from your Wishlist.");
  }

  localStorage.setItem("alberto_wishlist", JSON.stringify(wishlistItems));
  syncWishlistUI();
}

function removeFromWishlist(watchId) {
  const index = wishlistItems.indexOf(watchId);
  if (index !== -1) {
    wishlistItems.splice(index, 1);
    localStorage.setItem("alberto_wishlist", JSON.stringify(wishlistItems));
    showToast("Timepiece removed from your Wishlist.");
    syncWishlistUI();
  }
}

function clearWishlist() {
  if (wishlistItems.length === 0) return;
  wishlistItems = [];
  localStorage.setItem("alberto_wishlist", JSON.stringify(wishlistItems));
  showToast("Your VIP Wishlist has been cleared.");
  syncWishlistUI();
}

function inspectFromWishlist(watchId) {
  closeWishlistScreen();
  openWatchModal(watchId);
}

function inquireAllWishlist() {
  if (wishlistItems.length === 0) return;

  const items = wishlistItems
    .map(id => (typeof WATCH_CATALOG !== 'undefined' ? WATCH_CATALOG.find(w => w.id === id) : null))
    .filter(Boolean);

  const totalValuation = items.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const lines = [
    "VIP Private Portfolio Inquiry:",
    "----------------------------------------",
    ...items.map((w, i) => `${i + 1}. ${w.name} (Ref: ${w.reference}) - ${w.priceFormatted}`),
    "----------------------------------------",
    `Total Estimated Portfolio Value: PKR ${totalValuation.toLocaleString()}`,
    "",
    "Please contact me regarding private viewing and availability in Pakistan."
  ];

  const contactSection = document.getElementById("contact");
  const messageBox = document.getElementById("contact-message");
  const subjectSelect = document.getElementById("contact-subject");

  if (messageBox) {
    messageBox.value = lines.join("\n");
  }

  if (subjectSelect) {
    subjectSelect.value = "purchase";
  }

  closeWishlistScreen();

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
    showToast("Wishlist portfolio inquiry loaded into VIP Concierge form below.");
  }
}

function updateWishlistBadge() {
  const badges = document.querySelectorAll(".wishlist-count");
  badges.forEach(badge => {
    badge.textContent = wishlistItems.length;
  });
}

// Global scope bindings for inline onclick handlers
window.openWishlistScreen = openWishlistScreen;
window.closeWishlistScreen = closeWishlistScreen;
window.toggleWishlist = toggleWishlist;
window.removeFromWishlist = removeFromWishlist;
window.clearWishlist = clearWishlist;
window.inspectFromWishlist = inspectFromWishlist;
window.inquireAllWishlist = inquireAllWishlist;

/* ==========================================================================
   12. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById("alberto-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "alberto-toast";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-certificate"></i> <span>${message}</span>`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}
