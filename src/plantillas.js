/* ==========================================================================
   PERCHERO HORIZONTAL & ESTAMPA DESLIZABLE - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { getProducts, getCategories, subscribeToStore } from './data/store.js';

// Application State
let allProducts = [];
let allCategories = [];
let currentProduct = null;
let activeCategoryFilter = 'all';
let searchQuery = '';

// Design Overlay State (persists across product changes)
const currentDesign = {
  imageSrc: null,
  originalImageSrc: null,
  processedImageSrc: null,
  isBgRemoved: false,
  imageElement: null,
  filename: '',
  posX: 50,          // Percentage of stage width (0 - 100)
  posY: 38,          // Percentage of stage height (0 - 100)
  scale: 1.0,        // Scale multiplier (0.3 - 2.2)
  rotation: 0,       // Rotation degrees (-180 to 180)
  blendMode: 'normal'// 'normal' | 'multiply'
};

// Order State (NO color, NO size)
let selectedQuantity = 1;
let selectedPaymentFactor = 1.0; // Transferencia default (sin descuento)

// Pointer Dragging State
let isDragging = false;
let startPointerX = 0;
let startPointerY = 0;
let startPosX = 50;
let startPosY = 38;

// Corner Handle Resize State
let isResizing = false;
let activeResizeHandle = null;
let resizeInitialDist = 0;
let resizeInitialScale = 1.0;
let resizeCenterX = 0;
let resizeCenterY = 0;

/**
 * Format currency in Argentine Pesos
 */
function formatCurrency(amount) {
  const num = Math.round(Number(amount) || 0);
  return '$' + num.toLocaleString('es-AR');
}

/**
 * Fallback illustration if image is missing
 */
function getPlaceholderImg() {
  return '/assets/logopajaros.jpg';
}

/**
 * Helper to check if a category ID, name, or product category is excluded from Plantillas
 * Specifically excludes "Ropa Personalizada" and "Ropa Institucional"
 */
function isExcludedCategory(catId, catName) {
  const norm = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const id = norm(catId);
  const name = norm(catName);

  return (
    id.includes('ropa-personalizada') ||
    id.includes('ropa-institucional') ||
    id.includes('personalizada') ||
    id.includes('personalizado') ||
    id.includes('institucional') ||
    name.includes('ropa personalizada') ||
    name.includes('ropa institucional') ||
    name.includes('personalizada') ||
    name.includes('personalizado') ||
    name.includes('institucional')
  );
}

/**
 * Helper to check if an individual product must be excluded from Plantillas / Perchero.
 * Excludes products with "institucional", "personalizada", etc. in their name, ID, category or badge.
 */
function isExcludedProduct(prod) {
  if (!prod) return true;

  const norm = (str) =>
    String(str || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const name = norm(prod.name);
  const id = norm(prod.id);
  const cat = norm(prod.category);
  const catLabel = norm(prod.categoryLabel);
  const badge = norm(prod.badge);
  const desc = norm(prod.description);

  // Exclude if "institucional" is present anywhere
  if (
    name.includes('institucional') ||
    id.includes('institucional') ||
    cat.includes('institucional') ||
    catLabel.includes('institucional') ||
    badge.includes('institucional') ||
    desc.includes('institucional')
  ) {
    return true;
  }

  // Exclude if "personalizada" or "personalizado" is present in name, id, category, badge or desc
  if (
    name.includes('personalizada') ||
    name.includes('personalizado') ||
    id.includes('personalizada') ||
    id.includes('personalizado') ||
    cat.includes('personalizada') ||
    cat.includes('personalizado') ||
    catLabel.includes('personalizada') ||
    catLabel.includes('personalizado') ||
    badge.includes('personalizada') ||
    badge.includes('personalizado')
  ) {
    return true;
  }

  return false;
}

/**
 * Filter products and categories to exclude "Ropa Personalizada" and "Ropa Institucional"
 */
function setFilteredStoreData(rawProducts, rawCategories) {
  const categoriesList = rawCategories || [];
  const productsList = rawProducts || [];

  // 1. Identify excluded category IDs and names
  const excludedCatIds = new Set();
  categoriesList.forEach(cat => {
    if (isExcludedCategory(cat.id, cat.name)) {
      if (cat.id) excludedCatIds.add(String(cat.id).toLowerCase());
      if (cat.name) excludedCatIds.add(String(cat.name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
    }
  });

  // 2. Filter categories for perchero filter chips
  allCategories = categoriesList.filter(cat => !isExcludedCategory(cat.id, cat.name));

  // If the active category filter is no longer available, reset to 'all'
  if (activeCategoryFilter !== 'all' && !allCategories.some(c => c.id === activeCategoryFilter)) {
    activeCategoryFilter = 'all';
  }

  // 3. Filter products for perchero track: check product itself + category
  allProducts = productsList.filter(prod => {
    if (isExcludedProduct(prod)) return false;

    const prodCat = String(prod.category || '').toLowerCase();
    const prodCatNorm = prodCat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (excludedCatIds.has(prodCat) || excludedCatIds.has(prodCatNorm)) return false;
    if (isExcludedCategory(prod.category, prod.categoryLabel)) return false;

    return true;
  });

  // If the currently selected product was in an excluded category or product, re-select
  if (currentProduct && (!allProducts.some(p => p.id === currentProduct.id) || isExcludedProduct(currentProduct))) {
    currentProduct = null;
  }
}

/**
 * Initialize Perchero Studio
 */
function initStudio() {
  // Mobile Hamburger Menu
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // Subscribe to store updates
  subscribeToStore(({ products, categories }) => {
    setFilteredStoreData(products, categories);
    renderPercheroFilterChips();
    renderHorizontalPerchero();

    if (!currentProduct && allProducts.length > 0) {
      checkInitialProductSelection();
    }
  });

  // Get current cache
  setFilteredStoreData(getProducts(), getCategories());
  renderPercheroFilterChips();
  renderHorizontalPerchero();
  checkInitialProductSelection();

  // Setup Event Handlers
  setupPercheroNavigation();
  setupDraggablePointerEvents();
  setupCornerHandleResize();
  setupStageControls();
  setupFileUploadHandlers();
  setupOrderControls();
  setupRealisticVisualization();
}

/**
 * Check initial product from URL param or default to first
 */
function checkInitialProductSelection() {
  if (allProducts.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('product') || params.get('id');

  let chosen = allProducts.find(p => p.id === targetId);
  if (!chosen) {
    chosen = allProducts[0];
  }

  selectProduct(chosen, false); // Don't auto-scroll on initial page load
}

/**
 * Render Category Filter Chips for Perchero
 */
function renderPercheroFilterChips() {
  const container = document.getElementById('perchero-filter-chips');
  if (!container) return;

  const allChip = `<button type="button" class="perchero-chip ${activeCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">Todos los Productos</button>`;
  const catChips = allCategories.map(cat => `
    <button type="button" class="perchero-chip ${activeCategoryFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.name}
    </button>
  `).join('');

  container.innerHTML = allChip + catChips;

  container.querySelectorAll('.perchero-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-cat');
      renderPercheroFilterChips();
      renderHorizontalPerchero();
    });
  });
}

/**
 * Render Products in Horizontal Scroll Perchero Track
 */
function renderHorizontalPerchero() {
  const track = document.getElementById('perchero-scroll-track');
  const countBadge = document.getElementById('products-count-badge');
  if (!track) return;

  let filtered = [...allProducts];

  // Category filter
  if (activeCategoryFilter !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategoryFilter);
  }

  // Search filter
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} prenda${filtered.length === 1 ? '' : 's'} en perchero`;
  }

  if (filtered.length === 0) {
    track.innerHTML = `
      <div style="padding: 2.5rem 1rem; text-align: center; width: 100%; color: #666;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <strong style="color: var(--color-black); font-size: 1.1rem; display: block;">No se encontraron prendas en el perchero</strong>
        <span style="font-size: 0.85rem;">Probá cambiando la categoría o borrando la búsqueda.</span>
      </div>
    `;
    return;
  }

  track.innerHTML = filtered.map(prod => {
    const isSelected = currentProduct && currentProduct.id === prod.id;
    const prodImg = (Array.isArray(prod.images) && prod.images.length > 0)
      ? prod.images[0]
      : (prod.image || getPlaceholderImg());
    const priceFormatted = formatCurrency(prod.price);
    const categoryName = prod.categoryLabel || prod.category || 'Tienda';

    return `
      <div class="perchero-card ${isSelected ? 'selected' : ''}" data-product-id="${prod.id}" role="option" aria-selected="${isSelected}">
        <div class="perchero-card-hanger" aria-hidden="true">
          <svg viewBox="0 0 84 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
            <!-- Hook Shadow -->
            <path d="M42 27 V12 C42 5 49 2 56 6 C62 9.5 61 19 56 22" stroke="rgba(0,0,0,0.25)" stroke-width="6" stroke-linecap="round" fill="none" />
            <!-- Hook Outer/Base -->
            <path d="M42 27 V12 C42 5 49 2 56 6 C62 9.5 61 19 56 22" stroke="#0D0D0D" stroke-width="4.5" stroke-linecap="round" fill="none" />
            <!-- Hook Inner Highlight (Yellow Pájaros) -->
            <path d="M42 26 V12 C42 6 48.5 3.5 54.5 7 C59.5 10 59 18 55.5 20.5" stroke="#FFE600" stroke-width="2" stroke-linecap="round" fill="none" />
            <!-- Hook Tip Bead -->
            <circle cx="56" cy="22" r="2.2" fill="#0D0D0D" />
            <!-- Wooden Hanger Body -->
            <path d="M42 27 L6 43 C4.5 44 5.5 45.5 7.5 45.5 H76.5 C78.5 45.5 79.5 44 78 43 L42 27 Z" fill="#D4A373" stroke="#0D0D0D" stroke-width="2.5" stroke-linejoin="round" />
            <!-- Wood Grain Line -->
            <path d="M12 43.2 L42 29.5 L72 43.2" stroke="#F5D0A9" stroke-width="1.5" stroke-linecap="round" fill="none" />
            <!-- Swivel Ring Collar -->
            <circle cx="42" cy="27" r="3.2" fill="#FFE600" stroke="#0D0D0D" stroke-width="1.8"/>
          </svg>
        </div>
        <div class="perchero-card-inner">
          <div class="perchero-card-img-wrap">
            <img class="perchero-card-img" src="${prodImg}" alt="${prod.name}" loading="lazy">
          </div>
          <div class="perchero-card-body">
            <span class="perchero-card-badge">${categoryName}</span>
            <h3 class="perchero-card-title">${prod.name}</h3>
            <span class="perchero-card-price">${priceFormatted}</span>
            <div class="perchero-card-btn">
              ${isSelected ? '✓ Prenda Elegida' : 'Diseñar esta Prenda ➔'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to cards
  track.querySelectorAll('.perchero-card').forEach(card => {
    card.addEventListener('click', () => {
      const prodId = card.getAttribute('data-product-id');
      const prod = allProducts.find(p => p.id === prodId);
      if (prod) {
        selectProduct(prod, true); // Auto-scroll down to Step 2
      }
    });
  });
}

/**
 * Select a product from the Perchero
 */
function selectProduct(product, autoScroll = false) {
  if (!product) return;
  currentProduct = product;

  // Update URL param
  try {
    const url = new URL(window.location);
    url.searchParams.set('product', product.id);
    window.history.replaceState({}, '', url);
  } catch (e) {
    // ignore
  }

  // Update Perchero Highlight
  renderHorizontalPerchero();

  // Update Step 2 Badges & Product Displays
  const step2Badge = document.getElementById('step2-product-badge');
  const chosenTitle = document.getElementById('chosen-product-title');
  const chosenPrice = document.getElementById('chosen-product-price');
  const chosenThumb = document.getElementById('chosen-product-thumb');
  const stageImg = document.getElementById('stage-product-img');

  const prodImg = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images[0]
    : (product.image || getPlaceholderImg());

  if (step2Badge) step2Badge.textContent = product.name;
  if (chosenTitle) chosenTitle.textContent = product.name;
  if (chosenPrice) chosenPrice.textContent = formatCurrency(product.price);
  if (chosenThumb) chosenThumb.src = prodImg;

  if (stageImg) {
    stageImg.style.opacity = '0.3';
    stageImg.onload = () => { stageImg.style.opacity = '1'; };
    stageImg.src = prodImg;
    stageImg.alt = product.name;
  }

  // Update Price calculation
  calculateTotalPrice();

  // Smooth scroll to Step 2 if requested
  if (autoScroll) {
    const step2El = document.getElementById('studio-step');
    if (step2El) {
      step2El.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/**
 * Setup Perchero Horizontal Navigation (Arrow Buttons & Search)
 */
function setupPercheroNavigation() {
  const track = document.getElementById('perchero-scroll-track');
  const btnPrev = document.getElementById('btn-perchero-prev');
  const btnNext = document.getElementById('btn-perchero-next');
  const searchInput = document.getElementById('perchero-search-input');
  const btnChange = document.getElementById('btn-change-perchero');

  if (track && btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -280, behavior: 'smooth' });
    });
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderHorizontalPerchero();
    });
  }

  // Change product button (scrolls back to perchero)
  if (btnChange) {
    btnChange.addEventListener('click', () => {
      const percheroEl = document.getElementById('perchero-step');
      if (percheroEl) {
        percheroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

/**
 * Setup Pointer Dragging for the Uploaded Design
 */
function setupDraggablePointerEvents() {
  const draggableLayer = document.getElementById('draggable-design-layer');
  const stageViewport = document.getElementById('mockup-stage-viewport');

  if (!draggableLayer || !stageViewport) return;

  draggableLayer.addEventListener('pointerdown', (e) => {
    // If clicking a corner handle, do NOT start layer dragging
    if (e.target.closest('.corner-handle')) return;
    if (e.button !== undefined && e.button !== 0) return;

    isDragging = true;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startPosX = currentDesign.posX;
    startPosY = currentDesign.posY;

    draggableLayer.setPointerCapture(e.pointerId);
    draggableLayer.classList.add('is-dragging');
    draggableLayer.setAttribute('aria-grabbed', 'true');
    e.preventDefault();
  });

  draggableLayer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const stageRect = stageViewport.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    const deltaPercentX = (deltaX / stageRect.width) * 100;
    const deltaPercentY = (deltaY / stageRect.height) * 100;

    let newX = startPosX + deltaPercentX;
    let newY = startPosY + deltaPercentY;

    // Boundary constraints: allow smooth placement anywhere across the garment
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    currentDesign.posX = newX;
    currentDesign.posY = newY;

    updateDraggableTransform();
  });

  const handlePointerEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    draggableLayer.classList.remove('is-dragging');
    draggableLayer.setAttribute('aria-grabbed', 'false');
    try {
      draggableLayer.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  draggableLayer.addEventListener('pointerup', handlePointerEnd);
  draggableLayer.addEventListener('pointercancel', handlePointerEnd);
}

/**
 * Setup Corner Handles Resizing for the Uploaded Design
 * Scales proportionally from center when dragging any of the 4 corner handles
 */
function setupCornerHandleResize() {
  const handles = document.querySelectorAll('.corner-handle');
  const boxFrame = document.getElementById('design-box-frame');
  const scaleSlider = document.getElementById('slider-scale');
  const scaleLabel = document.getElementById('scale-value-label');

  if (!boxFrame || handles.length === 0) return;

  handles.forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.stopPropagation(); // Stop layer drag
      e.preventDefault();

      isResizing = true;
      activeResizeHandle = handle;
      handle.classList.add('is-active');

      const rect = boxFrame.getBoundingClientRect();
      resizeCenterX = rect.left + rect.width / 2;
      resizeCenterY = rect.top + rect.height / 2;

      resizeInitialDist = Math.hypot(e.clientX - resizeCenterX, e.clientY - resizeCenterY);
      if (resizeInitialDist < 10) resizeInitialDist = 10;
      resizeInitialScale = currentDesign.scale || 1.0;

      try {
        handle.setPointerCapture(e.pointerId);
      } catch (err) { }

      const onPointerMove = (moveEvt) => {
        if (!isResizing) return;
        moveEvt.preventDefault();

        const currentDist = Math.hypot(moveEvt.clientX - resizeCenterX, moveEvt.clientY - resizeCenterY);
        const factor = currentDist / resizeInitialDist;
        let newScale = resizeInitialScale * factor;

        // Clamp scale between 0.30 (30%) and 2.20 (220%)
        newScale = Math.max(0.30, Math.min(2.20, newScale));
        newScale = Math.round(newScale * 100) / 100;

        currentDesign.scale = newScale;

        // Sync slider & label
        const pct = Math.round(newScale * 100);
        if (scaleSlider) scaleSlider.value = pct;
        if (scaleLabel) scaleLabel.textContent = `${pct}%`;

        updateDraggableTransform();
      };

      const onPointerUp = (upEvt) => {
        if (!isResizing) return;
        isResizing = false;
        if (activeResizeHandle) {
          activeResizeHandle.classList.remove('is-active');
          try {
            activeResizeHandle.releasePointerCapture(upEvt.pointerId);
          } catch (err) { }
          activeResizeHandle = null;
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });
  });
}

/**
 * Update Draggable Layer Styles from currentDesign state
 */
function updateDraggableTransform() {
  const layer = document.getElementById('draggable-design-layer');
  const boxFrame = document.getElementById('design-box-frame');
  const imgEl = document.getElementById('design-rendered-img');

  if (!layer || !boxFrame) return;

  layer.style.left = `${currentDesign.posX}%`;
  layer.style.top = `${currentDesign.posY}%`;
  boxFrame.style.transform = `scale(${currentDesign.scale}) rotate(${currentDesign.rotation}deg)`;

  if (imgEl) {
    imgEl.style.mixBlendMode = currentDesign.blendMode;
  }
}

/**
 * Calculate the exact normalized coordinates and visual scale of the design relative to the garment image.
 * This guarantees 100% exact alignment between the interactive DOM stage and any canvas render.
 */
function getNormalizedDesignOnGarment() {
  const stageViewport = document.getElementById('mockup-stage-viewport');
  const stageImg = document.getElementById('stage-product-img');
  const boxFrame = document.getElementById('design-box-frame');
  const imgEl = document.getElementById('design-rendered-img');

  const fallback = {
    relX: (currentDesign.posX !== undefined ? currentDesign.posX : 50) / 100,
    relY: (currentDesign.posY !== undefined ? currentDesign.posY : 38) / 100,
    relWidth: 0.28 * (currentDesign.scale || 1.0)
  };

  if (!stageViewport || !stageImg || !boxFrame || !imgEl) {
    return fallback;
  }

  const vpRect = stageViewport.getBoundingClientRect();
  if (vpRect.width === 0 || vpRect.height === 0) {
    return fallback;
  }

  const natW = stageImg.naturalWidth || 800;
  const natH = stageImg.naturalHeight || 800;
  const imgRatio = natW / natH;
  const vpRatio = vpRect.width / vpRect.height;

  // Exact rendered bounding box of stage-product-img inside stageViewport (object-fit: contain)
  let garmentW, garmentH, garmentLeft, garmentTop;
  if (vpRatio > imgRatio) {
    garmentH = vpRect.height;
    garmentW = garmentH * imgRatio;
    garmentLeft = vpRect.left + (vpRect.width - garmentW) / 2;
    garmentTop = vpRect.top;
  } else {
    garmentW = vpRect.width;
    garmentH = garmentW / imgRatio;
    garmentLeft = vpRect.left;
    garmentTop = vpRect.top + (vpRect.height - garmentH) / 2;
  }

  if (garmentW <= 0 || garmentH <= 0) {
    return fallback;
  }

  // Exact center of design box on screen
  const boxRect = boxFrame.getBoundingClientRect();
  const boxCenterX = boxRect.left + boxRect.width / 2;
  const boxCenterY = boxRect.top + boxRect.height / 2;

  // Normalized position relative to garment (0.0 to 1.0)
  const relX = (boxCenterX - garmentLeft) / garmentW;
  const relY = (boxCenterY - garmentTop) / garmentH;

  // Visual width of design on screen (unrotated) relative to garment width
  const baseWidth = imgEl.offsetWidth || 150;
  const visualDesignWidth = baseWidth * (currentDesign.scale || 1.0);
  const relWidth = visualDesignWidth / garmentW;

  return {
    relX,
    relY,
    relWidth
  };
}

/**
 * Setup Stage Controls (Sliders, Background Remover)
 */
function setupStageControls() {
  // Scale Slider
  const scaleSlider = document.getElementById('slider-scale');
  const scaleLabel = document.getElementById('scale-value-label');
  const btnScaleDown = document.getElementById('btn-scale-down');
  const btnScaleUp = document.getElementById('btn-scale-up');

  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      currentDesign.scale = val / 100;
      if (scaleLabel) scaleLabel.textContent = `${val}%`;
      updateDraggableTransform();
    });
  }

  if (btnScaleDown && scaleSlider) {
    btnScaleDown.addEventListener('click', () => {
      let val = Math.max(30, parseInt(scaleSlider.value, 10) - 10);
      scaleSlider.value = val;
      scaleSlider.dispatchEvent(new Event('input'));
    });
  }

  if (btnScaleUp && scaleSlider) {
    btnScaleUp.addEventListener('click', () => {
      let val = Math.min(220, parseInt(scaleSlider.value, 10) + 10);
      scaleSlider.value = val;
      scaleSlider.dispatchEvent(new Event('input'));
    });
  }

  // Rotation Slider
  const rotateSlider = document.getElementById('slider-rotation');
  const rotateLabel = document.getElementById('rotation-value-label');
  const btnRotateReset = document.getElementById('btn-rotate-reset');
  const btnRotate90 = document.getElementById('btn-rotate-90');

  if (rotateSlider) {
    rotateSlider.addEventListener('input', (e) => {
      const deg = parseInt(e.target.value, 10);
      currentDesign.rotation = deg;
      if (rotateLabel) rotateLabel.textContent = `${deg}°`;
      updateDraggableTransform();
    });
  }

  if (btnRotateReset && rotateSlider) {
    btnRotateReset.addEventListener('click', () => {
      rotateSlider.value = 0;
      rotateSlider.dispatchEvent(new Event('input'));
    });
  }

  if (btnRotate90 && rotateSlider) {
    btnRotate90.addEventListener('click', () => {
      let deg = currentDesign.rotation + 90;
      if (deg > 180) deg = deg - 360;
      rotateSlider.value = deg;
      rotateSlider.dispatchEvent(new Event('input'));
    });
  }

  // Background Remover Button
  const btnToggleBg = document.getElementById('btn-toggle-remove-bg');
  if (btnToggleBg) {
    btnToggleBg.addEventListener('click', () => {
      toggleBackgroundRemoval();
    });
  }
}

/**
 * Toggle Background Removal (Transparentize White / Light Background)
 */
function toggleBackgroundRemoval() {
  if (!currentDesign.imageSrc) {
    alert('Primero subí una imagen o seleccioná un logo de muestra para quitarle el fondo.');
    return;
  }

  const btnToggleBg = document.getElementById('btn-toggle-remove-bg');

  if (currentDesign.isBgRemoved) {
    // Restore original image
    currentDesign.isBgRemoved = false;
    currentDesign.imageSrc = currentDesign.originalImageSrc;
    updateRenderedDesignSource(currentDesign.originalImageSrc);

    if (btnToggleBg) {
      btnToggleBg.classList.remove('is-active');
      btnToggleBg.innerHTML = '<span>🪄 Quitar Fondo Blanco</span>';
    }
  } else {
    // Transparentize background
    if (btnToggleBg) {
      btnToggleBg.innerHTML = '<span>⏳ Quitando fondo...</span>';
    }

    setTimeout(() => {
      try {
        const transparentUrl = processWhiteBackgroundRemoval(currentDesign.imageElement || currentDesign.imageSrc);
        currentDesign.processedImageSrc = transparentUrl;
        currentDesign.imageSrc = transparentUrl;
        currentDesign.isBgRemoved = true;

        updateRenderedDesignSource(transparentUrl);

        if (btnToggleBg) {
          btnToggleBg.classList.add('is-active');
          btnToggleBg.innerHTML = '<span>✓ Fondo Quitado (Hacé clic para restaurar)</span>';
        }
      } catch (err) {
        console.error('Error al quitar fondo:', err);
        alert('No se pudo procesar la transparencia automáticamente en esta imagen. Te recomendamos subir una imagen en formato PNG sin fondo.');
        if (btnToggleBg) {
          btnToggleBg.classList.remove('is-active');
          btnToggleBg.innerHTML = '<span>🪄 Quitar Fondo Blanco</span>';
        }
      }
    }, 40);
  }
}

/**
 * Process client-side pixel manipulation to remove white or near-white background
 */
function processWhiteBackgroundRemoval(source) {
  const canvas = document.createElement('canvas');
  let img = source;
  if (typeof source === 'string') {
    img = new Image();
    img.src = source;
  }

  const w = img.naturalWidth || img.width || 800;
  const h = img.naturalHeight || img.height || 800;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const len = data.length;

  // Sample corner pixels to check background color
  const cornerIdxs = [0, Math.max(0, (w - 1) * 4), Math.max(0, (h - 1) * w * 4), Math.max(0, ((h - 1) * w + (w - 1)) * 4)];
  let avgCornerR = 0, avgCornerG = 0, avgCornerB = 0, validCorners = 0;

  cornerIdxs.forEach(idx => {
    if (idx < len) {
      avgCornerR += data[idx];
      avgCornerG += data[idx + 1];
      avgCornerB += data[idx + 2];
      validCorners++;
    }
  });

  if (validCorners > 0) {
    avgCornerR /= validCorners;
    avgCornerG /= validCorners;
    avgCornerB /= validCorners;
  }

  const isLightBg = (avgCornerR + avgCornerG + avgCornerB) / 3 > 175;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    const saturation = maxC - minC;

    // 1. Pure or near white (r, g, b >= 215 and low saturation)
    if (minC >= 215 && saturation < 30) {
      if (minC >= 240) {
        data[i + 3] = 0;
      } else {
        const factor = (240 - minC) / 25;
        data[i + 3] = Math.round(a * factor);
      }
    }
    // 2. Uniform light background matching sampled corners
    else if (isLightBg) {
      const dist = Math.hypot(r - avgCornerR, g - avgCornerG, b - avgCornerB);
      if (dist < 32 && saturation < 30) {
        data[i + 3] = 0;
      } else if (dist < 48 && saturation < 30) {
        data[i + 3] = Math.round(a * ((dist - 32) / 16));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Update the rendered image element and preview thumbnail
 */
function updateRenderedDesignSource(src) {
  const renderedImg = document.getElementById('design-rendered-img');
  const thumbEl = document.getElementById('uploaded-file-thumb');

  const newImg = new Image();
  newImg.crossOrigin = 'anonymous';
  newImg.onload = () => {
    currentDesign.imageElement = newImg;
    if (renderedImg) renderedImg.src = src;
    if (thumbEl) thumbEl.src = src;
  };
  newImg.src = src;
}



/**
 * Setup File Upload & Drag-and-Drop
 */
function setupFileUploadHandlers() {
  const fileInput = document.getElementById('design-file-input');
  const uploadZone = document.getElementById('upload-zone-compact');
  const stagePrompt = document.getElementById('stage-upload-prompt');
  const stageViewport = document.getElementById('mockup-stage-viewport');
  const btnRemove = document.getElementById('btn-remove-design');
  const btnSample = document.getElementById('btn-load-sample');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
  }
  if (stagePrompt && fileInput) {
    stagePrompt.addEventListener('click', () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleSelectedFile(file);
    });
  }

  // Drag and Drop on Upload Zone
  if (uploadZone) {
    ['dragenter', 'dragover'].forEach(evt => {
      uploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      uploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
      });
    });
    uploadZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleSelectedFile(file);
    });
  }

  // Drag and Drop directly onto the Mockup Stage
  if (stageViewport) {
    stageViewport.addEventListener('dragover', (e) => {
      e.preventDefault();
      stageViewport.style.outline = '3px dashed var(--color-magenta)';
    });
    stageViewport.addEventListener('dragleave', () => {
      stageViewport.style.outline = 'none';
    });
    stageViewport.addEventListener('drop', (e) => {
      e.preventDefault();
      stageViewport.style.outline = 'none';
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleSelectedFile(file);
    });
  }

  // Remove Design
  if (btnRemove) {
    btnRemove.addEventListener('click', () => {
      removeDesign();
    });
  }

  // Sample Logo Button
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      applyDesignImage('/assets/logopajaros.jpg', 'logo_pajaros_muestra.jpg');
    });
  }
}

/**
 * Handle File Selection
 */
function handleSelectedFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG o WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    applyDesignImage(e.target.result, file.name);
  };
  reader.readAsDataURL(file);
}

/**
 * Apply Design Image to State and DOM
 */
function applyDesignImage(src, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    currentDesign.originalImageSrc = src;
    currentDesign.processedImageSrc = null;
    currentDesign.isBgRemoved = false;
    currentDesign.imageSrc = src;
    currentDesign.imageElement = img;
    currentDesign.filename = filename || 'mi_estampa.png';

    const btnToggleBg = document.getElementById('btn-toggle-remove-bg');
    if (btnToggleBg) {
      btnToggleBg.classList.remove('is-active');
      btnToggleBg.innerHTML = '<span>🪄 Quitar Fondo Blanco</span>';
    }

    const draggableLayer = document.getElementById('draggable-design-layer');
    const stagePrompt = document.getElementById('stage-upload-prompt');
    const renderedImg = document.getElementById('design-rendered-img');

    if (renderedImg) {
      renderedImg.src = src;
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      if (naturalAspect > 1.4) {
        renderedImg.style.width = '180px';
        renderedImg.style.height = 'auto';
      } else if (naturalAspect < 0.7) {
        renderedImg.style.height = '180px';
        renderedImg.style.width = 'auto';
      } else {
        renderedImg.style.width = '150px';
        renderedImg.style.height = 'auto';
      }
    }

    if (stagePrompt) stagePrompt.style.display = 'none';
    if (draggableLayer) {
      draggableLayer.style.display = 'inline-flex';
      updateDraggableTransform();
    }

    // Update Right Order Column Card
    const uploadZone = document.getElementById('upload-zone-compact');
    const uploadedCard = document.getElementById('uploaded-file-card');
    const thumbEl = document.getElementById('uploaded-file-thumb');
    const filenameEl = document.getElementById('uploaded-filename');

    if (uploadZone) uploadZone.style.display = 'none';
    if (uploadedCard) uploadedCard.style.display = 'flex';
    if (thumbEl) thumbEl.src = src;
    if (filenameEl) filenameEl.textContent = currentDesign.filename;
  };
  img.src = src;
}

/**
 * Remove Current Design
 */
function removeDesign() {
  currentDesign.imageSrc = null;
  currentDesign.originalImageSrc = null;
  currentDesign.processedImageSrc = null;
  currentDesign.isBgRemoved = false;
  currentDesign.imageElement = null;
  currentDesign.filename = '';

  const btnToggleBg = document.getElementById('btn-toggle-remove-bg');
  if (btnToggleBg) {
    btnToggleBg.classList.remove('is-active');
    btnToggleBg.innerHTML = '<span>🪄 Quitar Fondo Blanco</span>';
  }

  const draggableLayer = document.getElementById('draggable-design-layer');
  const stagePrompt = document.getElementById('stage-upload-prompt');
  const uploadZone = document.getElementById('upload-zone-compact');
  const uploadedCard = document.getElementById('uploaded-file-card');
  const fileInput = document.getElementById('design-file-input');

  if (draggableLayer) draggableLayer.style.display = 'none';
  if (stagePrompt) stagePrompt.style.display = 'block';
  if (uploadZone) uploadZone.style.display = 'flex';
  if (uploadedCard) uploadedCard.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

/**
 * Setup Order Controls (Quantity, Payment, WhatsApp, Download)
 * NOTICE: Color and Size selection removed as requested.
 */
function setupOrderControls() {
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const qtyDisplay = document.getElementById('qty-display');
  const paymentSelect = document.getElementById('payment-method-select');
  const btnOrder = document.getElementById('btn-order-whatsapp');
  const btnDownload = document.getElementById('btn-download-preview');

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (selectedQuantity > 1) {
        selectedQuantity--;
        if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;
        calculateTotalPrice();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      selectedQuantity++;
      if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;
      calculateTotalPrice();
    });
  }

  if (paymentSelect) {
    paymentSelect.addEventListener('change', (e) => {
      selectedPaymentFactor = parseFloat(e.target.value) || 1.0;
      calculateTotalPrice();
    });
  }

  if (btnOrder) {
    btnOrder.addEventListener('click', () => {
      handleWhatsAppOrder();
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      handleDownloadPreview();
    });
  }
}

/**
 * Calculate & Display Total Price
 */
function calculateTotalPrice() {
  const unitPriceEl = document.getElementById('price-unit-display');
  const totalPriceEl = document.getElementById('price-total-num');

  const basePrice = (currentProduct && currentProduct.price) ? Number(currentProduct.price) : 18000;
  const unitFormatted = formatCurrency(basePrice);
  const total = Math.round(basePrice * selectedQuantity * selectedPaymentFactor);
  const totalFormatted = formatCurrency(total);

  if (unitPriceEl) unitPriceEl.textContent = unitFormatted;
  if (totalPriceEl) totalPriceEl.textContent = totalFormatted;
}

/**
 * Helper to safely load image with CORS proxy fallback if needed
 */
function loadImgWithFallback(url) {
  return new Promise((res) => {
    if (!url) return res(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => {
      if (!url.includes('images.weserv.nl') && url.startsWith('http')) {
        const proxyImg = new Image();
        proxyImg.crossOrigin = 'anonymous';
        proxyImg.onload = () => res(proxyImg);
        proxyImg.onerror = () => res(null);
        proxyImg.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(url);
      } else {
        res(null);
      }
    };
    img.src = url;
  });
}

/**
 * Generate Canvas Composite Mockup (Delegates to unified high-res photorealistic generator)
 */
function generateCompositeCanvas() {
  return generateCleanPreviewCanvas();
}

/**
 * Handle Download Preview
 */
function handleDownloadPreview() {
  const btn = document.getElementById('btn-download-preview');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = `<span>⏳ Generando foto en alta resolución...</span>`;
    btn.disabled = true;
  }

  generateCompositeCanvas()
    .then((canvas) => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const slug = (currentProduct ? currentProduct.name : 'producto')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
        link.download = `pajaros-en-la-cabeza-${slug}-estampa.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (btn) {
          btn.innerHTML = `<span>✓ ¡Foto Descargada! 📸</span>`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        }
      } catch (err) {
        console.error('Error exportando canvas:', err);
        alert('Hubo un inconveniente al generar la descarga directa. Podés realizar una captura de pantalla de la vista previa.');
        if (btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }
    })
    .catch((err) => {
      console.error(err);
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
}

/**
 * Handle WhatsApp Order Flow (NO color, NO size)
 */
function handleWhatsAppOrder() {
  if (!currentProduct) return;

  const paymentSelect = document.getElementById('payment-method-select');
  const paymentName = (paymentSelect && paymentSelect.options[paymentSelect.selectedIndex]?.text) || 'Transferencia';

  const basePrice = Number(currentProduct.price) || 18000;
  const total = Math.round(basePrice * selectedQuantity * selectedPaymentFactor);
  const totalFormatted = formatCurrency(total);

  let message = `¡Hola Pájaros en la Cabeza! 🦅\n`;
  message += `Quisiera consultar para encargar una prenda personalizada elegida desde el perchero virtual:\n\n`;
  message += `🛍️ Prenda: ${currentProduct.name}\n`;
  message += `🔢 Cantidad: ${selectedQuantity} unidad(es)\n`;
  message += `💳 Forma de Pago: ${paymentName}\n`;
  message += `💰 Subtotal Prenda Base: ${totalFormatted}\n`;
  message += `📌 (Aclaración: Sé que este valor es solo por la prenda base y que por acá definimos el valor final con el diseño)\n\n`;

  if (currentDesign.imageSrc) {
    message += `📸 ¡Ya diseñé la vista previa y ubiqué mi estampa en la web! Te adjunto la foto por acá para que vean exactamente cómo lo quiero.\n\n`;
  } else {
    message += `💡 Te adjunto mi archivo/logo por acá para cotizar el estampado.\n\n`;
  }

  message += `¿Me podrían pasar el presupuesto final con el diseño? ¡Muchas gracias!`;

  const phone = '5493517620847';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (currentDesign.imageSrc) {
    handleDownloadPreview();
  }

  window.open(whatsappUrl, '_blank');
}

let cachedRealisticDataUrl = null;

/**
 * Setup AI Garment Visualization Modal & Trigger Buttons
 */
function setupRealisticVisualization() {
  const btnTrigger = document.getElementById('btn-trigger-visualize');
  const btnStage = document.getElementById('btn-stage-visualize');
  const modal = document.getElementById('visualize-modal');
  const btnClose = document.getElementById('btn-close-visualize-modal');
  const btnCloseFooter = document.getElementById('btn-modal-close-action');
  const btnDownloadRealistic = document.getElementById('btn-modal-download-realistic');
  const btnOrderWhatsApp = document.getElementById('btn-modal-order-whatsapp');

  if (btnTrigger) {
    btnTrigger.addEventListener('click', openRealisticVisualization);
  }
  if (btnStage) {
    btnStage.addEventListener('click', openRealisticVisualization);
  }

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCloseFooter) btnCloseFooter.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (btnDownloadRealistic) {
    btnDownloadRealistic.addEventListener('click', () => {
      if (cachedRealisticDataUrl) {
        const link = document.createElement('a');
        const slug = (currentProduct ? currentProduct.name : 'prenda-real')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
        link.download = `pajaros-en-la-cabeza-${slug}.png`;
        link.href = cachedRealisticDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  if (btnOrderWhatsApp) {
    btnOrderWhatsApp.addEventListener('click', () => {
      closeModal();
      handleWhatsAppOrder();
    });
  }
}

/**
 * Open Photorealistic Visualization Modal
 * Generates instantly ("al toque") without external API delays or user key requirements.
 */
async function openRealisticVisualization() {
  if (!currentProduct) {
    alert('Por favor selecciona una prenda en el perchero.');
    return;
  }

  const modal = document.getElementById('visualize-modal');
  const modalProdName = document.getElementById('visualize-modal-prod-name');
  const loader = document.getElementById('visualize-loader');
  const previewImg = document.getElementById('visualize-preview-img');
  const footerNote = document.getElementById('visualize-footer-note');

  if (!modal) return;

  if (modalProdName) {
    modalProdName.textContent = `${currentProduct.name} • Generando visualización...`;
  }

  if (loader) loader.style.display = 'block';
  if (previewImg) previewImg.style.display = 'none';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  try {
    // Generate clean, high-resolution mockup with mathematical 1:1 coordinate alignment
    const canvas = await generateCleanPreviewCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    cachedRealisticDataUrl = dataUrl;

    // Brief smooth transition (150ms) for high-end polish
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
    }
    if (loader) loader.style.display = 'none';

    if (modalProdName) {
      modalProdName.textContent = `${currentProduct.name} • Fotografía Fotorrealista`;
    }
    if (footerNote) {
      footerNote.innerHTML = `✨ Fotografía generada a partir de la prenda oficial de <strong>Pájaros en la Cabeza</strong> con tu estampa integrada.<br><span style="color: #666; font-size: 0.76rem; display: block; margin-top: 0.35rem;">* El precio en la web corresponde únicamente a la prenda base. Por WhatsApp terminamos de definir el valor final con el diseño estampado.</span>`;
    }
  } catch (err) {
    console.error('Error generando visualización fotorrealista:', err);
    if (loader) loader.style.display = 'none';
    if (footerNote) {
      footerNote.textContent = 'Hubo un inconveniente al generar la vista previa. Intenta nuevamente.';
    }
  }
}

/**
 * Generate Clean, High-Resolution Photorealistic Canvas Preview
 * Uses exact 1:1 mathematical alignment with the interactive stage and authentic fabric shading.
 */
function generateCleanPreviewCanvas() {
  return new Promise((resolve, reject) => {
    if (!currentProduct) {
      reject(new Error('No hay prenda seleccionada.'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Contexto canvas no disponible.'));
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Clean Studio Backdrop with Soft Radial Vignette
    const bgGrad = ctx.createRadialGradient(600, 560, 100, 600, 600, 850);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(1, '#ECE7DC');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 1200);

    const rawProdImg = (Array.isArray(currentProduct.images) && currentProduct.images.length > 0)
      ? currentProduct.images[0]
      : (currentProduct.image || getPlaceholderImg());

    loadImgWithFallback(rawProdImg).then((bgImg) => {
      let garmentDrawW = 1200;
      let garmentDrawH = 1200;
      let garmentDrawX = 0;
      let garmentDrawY = 0;

      if (bgImg) {
        const natW = bgImg.naturalWidth || 1200;
        const natH = bgImg.naturalHeight || 1200;
        const imgRatio = natW / natH;
        const canvasRatio = 1200 / 1200; // 1.0

        if (canvasRatio > imgRatio) {
          // Height constrained
          garmentDrawH = 1200;
          garmentDrawW = garmentDrawH * imgRatio;
          garmentDrawX = (1200 - garmentDrawW) / 2;
          garmentDrawY = 0;
        } else {
          // Width constrained
          garmentDrawW = 1200;
          garmentDrawH = garmentDrawW / imgRatio;
          garmentDrawX = 0;
          garmentDrawY = (1200 - garmentDrawH) / 2;
        }

        ctx.drawImage(bgImg, garmentDrawX, garmentDrawY, garmentDrawW, garmentDrawH);
      }

      // 2. Draw User's Design with Mathematical 1:1 DOM Alignment & Realistic Blending
      if (currentDesign.imageSrc) {
        loadImgWithFallback(currentDesign.imageSrc).then((designImg) => {
          if (designImg) {
            const coords = getNormalizedDesignOnGarment();
            const targetCenterX = garmentDrawX + (coords.relX * garmentDrawW);
            const targetCenterY = garmentDrawY + (coords.relY * garmentDrawH);

            const targetLogoW = Math.round(coords.relWidth * garmentDrawW);
            const designAspect = (designImg.naturalWidth || 1) / (designImg.naturalHeight || 1);
            const targetLogoH = Math.round(targetLogoW / designAspect);

            // Temporary Canvas for Textile Blending & Shadow
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 1200;
            tempCanvas.height = 1200;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
              tempCtx.imageSmoothingEnabled = true;
              tempCtx.imageSmoothingQuality = 'high';

              // A. Draw Logo with Soft Natural Contact Shadow
              tempCtx.save();
              tempCtx.translate(targetCenterX, targetCenterY);
              tempCtx.rotate((currentDesign.rotation * Math.PI) / 180);

              const shadowBlur = Math.max(2, Math.round(4 * (targetLogoW / 260)));
              const shadowOffset = Math.max(1, Math.round(2 * (targetLogoW / 260)));
              tempCtx.shadowColor = 'rgba(12, 12, 12, 0.20)';
              tempCtx.shadowBlur = shadowBlur;
              tempCtx.shadowOffsetY = shadowOffset;

              tempCtx.drawImage(designImg, -targetLogoW / 2, -targetLogoH / 2, targetLogoW, targetLogoH);
              tempCtx.restore();

              // B. Realistic Textile Weave & Lighting Pass (source-atop)
              if (bgImg) {
                tempCtx.save();
                tempCtx.globalCompositeOperation = 'source-atop';
                tempCtx.globalAlpha = 0.20; // 20% fabric fold and lighting integration
                tempCtx.drawImage(bgImg, garmentDrawX, garmentDrawY, garmentDrawW, garmentDrawH);
                tempCtx.restore();
              }

              // C. Draw blended design onto main canvas
              ctx.save();
              if (currentDesign.blendMode === 'multiply') {
                ctx.globalCompositeOperation = 'multiply';
              }
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.restore();
            }
          }

          // 3. Official Brand Signature Footer Stamp
          drawRealisticFooterStamp(ctx, currentProduct.name);
          resolve(canvas);
        }).catch(() => {
          drawRealisticFooterStamp(ctx, currentProduct.name);
          resolve(canvas);
        });
      } else {
        drawRealisticFooterStamp(ctx, currentProduct.name);
        resolve(canvas);
      }
    }).catch(reject);
  });
}

/**
 * Draw Official High-End Neo-Brutalist Studio Stamp on Export / Preview
 */
function drawRealisticFooterStamp(ctx, productName) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;

  // Background Box
  ctx.fillStyle = '#0D0D0D';
  ctx.beginPath();
  ctx.roundRect(40, 1105, 520, 58, 8);
  ctx.fill();

  // Yellow accent line
  ctx.fillStyle = '#FFE600';
  ctx.fillRect(40, 1105, 8, 58);

  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillText('🦅 PÁJAROS EN LA CABEZA', 64, 1141);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  const nameSafe = productName || 'Prenda Oficial';
  ctx.fillText(`• ${nameSafe} • Vista Previa`, 345, 1140);

  ctx.restore();
}

// Start studio on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudio);
} else {
  initStudio();
}
