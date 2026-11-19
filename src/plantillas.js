/* ==========================================================================
   PLANTILLAS CON PRODUCTOS REALES & ESTAMPA DESLIZABLE - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { getProducts, getCategories, subscribeToStore } from './data/store.js';

// Application State
let allProducts = [];
let allCategories = [];
let currentProduct = null;
let activeCategoryFilter = 'all';
let searchQuery = '';

// Design Overlay State (persists across product switching!)
const currentDesign = {
  imageSrc: null,
  imageElement: null,
  filename: '',
  posX: 50,          // Percentage of stage width (0 - 100)
  posY: 38,          // Percentage of stage height (0 - 100)
  scale: 1.0,        // Scale multiplier (0.3 - 2.2)
  rotation: 0,       // Rotation degrees (-180 to 180)
  blendMode: 'normal'// 'normal' | 'multiply'
};

// Order Configuration State
let selectedColor = 'Negro';
let selectedSize = 'M';
let selectedQuantity = 1;
let selectedPaymentFactor = 0.9; // 10% OFF Transferencia default

// Pointer Dragging State
let isDragging = false;
let startPointerX = 0;
let startPointerY = 0;
let startPosX = 50;
let startPosY = 38;

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
 * Initialize Store & URL Params
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
    allProducts = products || [];
    allCategories = categories || [];
    updateCategorySelect();
    renderVerticalProductsGallery();

    // Select initial product if not set
    if (!currentProduct && allProducts.length > 0) {
      checkInitialProductSelection();
    }
  });

  // Get current cache
  allProducts = getProducts() || [];
  allCategories = getCategories() || [];
  updateCategorySelect();
  renderVerticalProductsGallery();
  checkInitialProductSelection();

  // Setup Event Listeners
  setupGalleryFilters();
  setupDraggablePointerEvents();
  setupStageControls();
  setupFileUploadHandlers();
  setupOrderControls();
}

/**
 * Select product by URL param or default to first
 */
function checkInitialProductSelection() {
  if (allProducts.length === 0) return;

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('product') || params.get('id');

  let chosen = allProducts.find(p => p.id === targetId);
  if (!chosen) {
    chosen = allProducts[0];
  }

  selectProduct(chosen);
}

/**
 * Populate Category Dropdown
 */
function updateCategorySelect() {
  const select = document.getElementById('gallery-cat-filter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="all">Todas las Categorías</option>` +
    allCategories.map(cat => `
      <option value="${cat.id}">${cat.name}</option>
    `).join('');

  if (currentVal) {
    select.value = currentVal;
  }
}

/**
 * Filter & Render Vertical Products Gallery
 */
function renderVerticalProductsGallery() {
  const container = document.getElementById('vertical-products-list');
  const badge = document.getElementById('products-count-badge');
  if (!container) return;

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

  if (badge) {
    badge.textContent = `${filtered.length} producto${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: #777;">
        <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <strong style="color: var(--color-black); display: block;">Sin resultados</strong>
        <span style="font-size: 0.8rem;">Probá buscando con otro término o categoría.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(prod => {
    const isSelected = currentProduct && currentProduct.id === prod.id;
    const prodImg = (Array.isArray(prod.images) && prod.images.length > 0) 
      ? prod.images[0] 
      : (prod.image || getPlaceholderImg());
    const priceFormatted = formatCurrency(prod.price);
    const categoryName = prod.categoryLabel || prod.category || 'Tienda';

    return `
      <button type="button" class="gallery-product-card ${isSelected ? 'selected' : ''}" data-product-id="${prod.id}" role="option" aria-selected="${isSelected}">
        ${isSelected ? `<span class="gallery-selected-tag">✓ Activo</span>` : ''}
        <img class="gallery-product-thumb" src="${prodImg}" alt="${prod.name}" loading="lazy">
        <div class="gallery-product-info">
          <span class="gallery-product-badge">${categoryName}</span>
          <h4 class="gallery-product-title">${prod.name}</h4>
          <span class="gallery-product-price">${priceFormatted}</span>
        </div>
      </button>
    `;
  }).join('');

  // Add click listeners
  container.querySelectorAll('.gallery-product-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-product-id');
      const prod = allProducts.find(p => p.id === prodId);
      if (prod) {
        selectProduct(prod);
      }
    });
  });
}

/**
 * Switch Active Product
 */
function selectProduct(product) {
  if (!product) return;
  currentProduct = product;

  // Update URL param without full reload
  try {
    const url = new URL(window.location);
    url.searchParams.set('product', product.id);
    window.history.replaceState({}, '', url);
  } catch (e) {
    // ignore
  }

  // Update Vertical Gallery Highlight
  renderVerticalProductsGallery();

  // Update Stage Header & Background Image
  const titleEl = document.getElementById('stage-product-title');
  const priceEl = document.getElementById('stage-product-price');
  const imgEl = document.getElementById('stage-product-img');

  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = formatCurrency(product.price);

  const prodImg = (Array.isArray(product.images) && product.images.length > 0) 
    ? product.images[0] 
    : (product.image || getPlaceholderImg());

  if (imgEl) {
    imgEl.style.opacity = '0.4';
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
    imgEl.src = prodImg;
    imgEl.alt = product.name;
  }

  // Update Options & Pricing in Order Column
  renderProductOptions();
  calculateTotalPrice();
}

/**
 * Setup Search & Category Filters
 */
function setupGalleryFilters() {
  const searchInput = document.getElementById('gallery-search-input');
  const catSelect = document.getElementById('gallery-cat-filter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderVerticalProductsGallery();
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      activeCategoryFilter = e.target.value;
      renderVerticalProductsGallery();
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

  // Pointer Down (Mouse click or Touch start)
  draggableLayer.addEventListener('pointerdown', (e) => {
    // Only drag with primary pointer / left button
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

  // Pointer Move (Mouse move or Touch move)
  draggableLayer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const stageRect = stageViewport.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    // Convert pixels to percentage of stage viewport
    const deltaPercentX = (deltaX / stageRect.width) * 100;
    const deltaPercentY = (deltaY / stageRect.height) * 100;

    let newX = startPosX + deltaPercentX;
    let newY = startPosY + deltaPercentY;

    // Boundary constraints: Keep design accessible on stage
    newX = Math.max(8, Math.min(92, newX));
    newY = Math.max(8, Math.min(92, newY));

    currentDesign.posX = newX;
    currentDesign.posY = newY;

    updateDraggableTransform();
  });

  // Pointer Up / Cancel
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

  // Keyboard accessibility for positioning (Arrow keys)
  draggableLayer.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 5 : 1;
    let handled = false;

    if (e.key === 'ArrowLeft') {
      currentDesign.posX = Math.max(8, currentDesign.posX - step);
      handled = true;
    } else if (e.key === 'ArrowRight') {
      currentDesign.posX = Math.min(92, currentDesign.posX + step);
      handled = true;
    } else if (e.key === 'ArrowUp') {
      currentDesign.posY = Math.max(8, currentDesign.posY - step);
      handled = true;
    } else if (e.key === 'ArrowDown') {
      currentDesign.posY = Math.min(92, currentDesign.posY + step);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      updateDraggableTransform();
    }
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

  // Position layer with percentages
  layer.style.left = `${currentDesign.posX}%`;
  layer.style.top = `${currentDesign.posY}%`;

  // Scale and rotate the inner frame
  boxFrame.style.transform = `scale(${currentDesign.scale}) rotate(${currentDesign.rotation}deg)`;

  // Apply blend mode
  if (imgEl) {
    imgEl.style.mixBlendMode = currentDesign.blendMode;
  }
}

/**
 * Setup Stage Toolbar Controls (Presets, Sliders, Blend mode)
 */
function setupStageControls() {
  // Preset Buttons
  const presetButtons = document.querySelectorAll('.preset-chip');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      applyLocationPreset(preset);
    });
  });

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
      let deg = (currentDesign.rotation + 90);
      if (deg > 180) deg = deg - 360;
      rotateSlider.value = deg;
      rotateSlider.dispatchEvent(new Event('input'));
    });
  }

  // Blend Mode Selector
  const blendSelect = document.getElementById('select-blend-mode');
  if (blendSelect) {
    blendSelect.addEventListener('change', (e) => {
      currentDesign.blendMode = e.target.value;
      updateDraggableTransform();
    });
  }
}

/**
 * Apply Location Presets
 */
function applyLocationPreset(preset) {
  switch (preset) {
    case 'pecho-centro':
      currentDesign.posX = 50;
      currentDesign.posY = 38;
      currentDesign.scale = 1.0;
      currentDesign.rotation = 0;
      break;

    case 'bolsillo':
      currentDesign.posX = 65; // Left chest as viewed on screen
      currentDesign.posY = 34;
      currentDesign.scale = 0.65;
      currentDesign.rotation = 0;
      break;

    case 'centro-grande':
      currentDesign.posX = 50;
      currentDesign.posY = 44;
      currentDesign.scale = 1.45;
      currentDesign.rotation = 0;
      break;

    case 'inferior':
      currentDesign.posX = 50;
      currentDesign.posY = 68;
      currentDesign.scale = 0.95;
      currentDesign.rotation = 0;
      break;

    case 'reset-pos':
    default:
      currentDesign.posX = 50;
      currentDesign.posY = 42;
      currentDesign.scale = 1.0;
      currentDesign.rotation = 0;
      break;
  }

  // Sync sliders
  const scaleSlider = document.getElementById('slider-scale');
  const scaleLabel = document.getElementById('scale-value-label');
  const rotateSlider = document.getElementById('slider-rotation');
  const rotateLabel = document.getElementById('rotation-value-label');

  if (scaleSlider) scaleSlider.value = Math.round(currentDesign.scale * 100);
  if (scaleLabel) scaleLabel.textContent = `${Math.round(currentDesign.scale * 100)}%`;
  if (rotateSlider) rotateSlider.value = currentDesign.rotation;
  if (rotateLabel) rotateLabel.textContent = `${currentDesign.rotation}°`;

  updateDraggableTransform();
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

  // Trigger file input
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
  }
  if (stagePrompt && fileInput) {
    stagePrompt.addEventListener('click', () => fileInput.click());
  }

  // File Input Changed
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

  // Drag and Drop directly onto the Mockup Stage!
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

  // Load Sample Logo
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      loadSampleDesign();
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
    const dataUrl = e.target.result;
    applyDesignImage(dataUrl, file.name);
  };
  reader.readAsDataURL(file);
}

/**
 * Load Sample Design
 */
function loadSampleDesign() {
  applyDesignImage('/assets/logopajaros.jpg', 'logo_pajaros_muestra.jpg');
}

/**
 * Apply Design Image to State and DOM
 */
function applyDesignImage(src, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    currentDesign.imageSrc = src;
    currentDesign.imageElement = img;
    currentDesign.filename = filename || 'estampa.png';

    // Update Stage Elements
    const draggableLayer = document.getElementById('draggable-design-layer');
    const stagePrompt = document.getElementById('stage-upload-prompt');
    const renderedImg = document.getElementById('design-rendered-img');

    if (renderedImg) {
      renderedImg.src = src;
      // Adjust default size according to aspect ratio
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

    // Update Right Column Card
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
  currentDesign.imageElement = null;
  currentDesign.filename = '';

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
 * Render Product Options (Color and Size)
 */
function renderProductOptions() {
  const colorContainer = document.getElementById('color-pills-grid');
  const colorLabel = document.getElementById('label-selected-color');
  const sizeContainer = document.getElementById('size-pills-grid');
  const sizeLabel = document.getElementById('label-selected-size');

  if (!currentProduct) return;

  // Colors
  const availableColors = (currentProduct.colors && currentProduct.colors.length > 0)
    ? currentProduct.colors
    : ['Negro', 'Blanco', 'Gris Topo', 'Beige Arena'];

  if (!availableColors.includes(selectedColor)) {
    selectedColor = availableColors[0];
  }
  if (colorLabel) colorLabel.textContent = selectedColor;

  if (colorContainer) {
    const colorHexMap = {
      'Negro': '#111111',
      'Blanco': '#FFFFFF',
      'Gris Topo': '#555555',
      'Gris': '#888888',
      'Beige Arena': '#E6D7BD',
      'Beige': '#E6D7BD',
      'Rosa': '#F5B8C8',
      'Azul': '#1E3A8A',
      'Verde': '#15803D'
    };

    colorContainer.innerHTML = availableColors.map(color => {
      const hex = colorHexMap[color] || '#111111';
      const isActive = color === selectedColor;
      return `
        <button type="button" class="color-pill ${isActive ? 'active' : ''}" data-color="${color}" style="background-color: ${hex};" title="${color}" aria-label="Color ${color}"></button>
      `;
    }).join('');

    colorContainer.querySelectorAll('.color-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedColor = btn.getAttribute('data-color');
        if (colorLabel) colorLabel.textContent = selectedColor;
        colorContainer.querySelectorAll('.color-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Sizes
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  if (sizeLabel) sizeLabel.textContent = selectedSize;

  if (sizeContainer) {
    sizeContainer.innerHTML = availableSizes.map(size => {
      const isActive = size === selectedSize;
      return `
        <button type="button" class="size-pill ${isActive ? 'active' : ''}" data-size="${size}">
          ${size}
        </button>
      `;
    }).join('');

    sizeContainer.querySelectorAll('.size-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSize = btn.getAttribute('data-size');
        if (sizeLabel) sizeLabel.textContent = selectedSize;
        sizeContainer.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}

/**
 * Setup Order Controls (Quantity, Payment, Order & Download Buttons)
 */
function setupOrderControls() {
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const qtyDisplay = document.getElementById('qty-display');
  const paymentSelect = document.getElementById('payment-method-select');
  const btnOrder = document.getElementById('btn-order-whatsapp');
  const btnDownload = document.getElementById('btn-download-preview');

  // Quantity Minus
  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (selectedQuantity > 1) {
        selectedQuantity--;
        if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;
        calculateTotalPrice();
      }
    });
  }

  // Quantity Plus
  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      selectedQuantity++;
      if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;
      calculateTotalPrice();
    });
  }

  // Payment Method Changed
  if (paymentSelect) {
    paymentSelect.addEventListener('change', (e) => {
      selectedPaymentFactor = parseFloat(e.target.value) || 0.9;
      calculateTotalPrice();
    });
  }

  // Order via WhatsApp
  if (btnOrder) {
    btnOrder.addEventListener('click', () => {
      handleWhatsAppOrder();
    });
  }

  // Download Mockup Preview
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
 * Generate Canvas Composite Mockup
 */
function generateCompositeCanvas() {
  return new Promise((resolve, reject) => {
    if (!currentProduct) {
      reject(new Error('No hay producto seleccionado.'));
      return;
    }

    const canvas = document.getElementById('export-canvas');
    if (!canvas) {
      reject(new Error('Canvas no encontrado.'));
      return;
    }

    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Error inicializando contexto canvas.'));
      return;
    }

    // 1. Draw clean studio background
    ctx.fillStyle = '#F8F6F0';
    ctx.fillRect(0, 0, 1200, 1200);

    // 2. Load and draw product background image
    const rawProdImg = (Array.isArray(currentProduct.images) && currentProduct.images.length > 0)
      ? currentProduct.images[0]
      : (currentProduct.image || getPlaceholderImg());

    // Use CORS proxy if needed for remote storage
    const loadImgWithFallback = (url) => {
      return new Promise((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => {
          // Fallback via weserv proxy for clean CORS
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
    };

    loadImgWithFallback(rawProdImg).then((bgImg) => {
      if (bgImg) {
        // Draw product centered fitting inside 1200x1200
        const scale = Math.min(1100 / bgImg.naturalWidth, 1100 / bgImg.naturalHeight);
        const drawW = bgImg.naturalWidth * scale;
        const drawH = bgImg.naturalHeight * scale;
        const drawX = (1200 - drawW) / 2;
        const drawY = (1200 - drawH) / 2;
        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
      }

      // 3. Draw User's Design if present
      if (currentDesign.imageSrc) {
        loadImgWithFallback(currentDesign.imageSrc).then((designImg) => {
          if (designImg) {
            ctx.save();

            // Calculate pixel position on 1200x1200 canvas
            const targetX = (currentDesign.posX / 100) * 1200;
            const targetY = (currentDesign.posY / 100) * 1200;

            ctx.translate(targetX, targetY);
            ctx.rotate((currentDesign.rotation * Math.PI) / 180);

            // Apply blend mode
            if (currentDesign.blendMode === 'multiply') {
              ctx.globalCompositeOperation = 'multiply';
            }

            // Calculate size matching stage proportions (default base ~300px on 1200 canvas)
            const baseRefSize = 340 * currentDesign.scale;
            const designAspect = designImg.naturalWidth / designImg.naturalHeight;
            let dW = baseRefSize;
            let dH = baseRefSize / designAspect;

            if (designAspect < 1) {
              dH = baseRefSize;
              dW = baseRefSize * designAspect;
            }

            ctx.drawImage(designImg, -dW / 2, -dH / 2, dW, dH);
            ctx.restore();
          }

          // 4. Draw Official Brand Footer Stamp
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          
          // Badge background
          ctx.fillStyle = '#0D0D0D';
          ctx.beginPath();
          ctx.roundRect(40, 1110, 480, 50, 8);
          ctx.fill();

          ctx.fillStyle = '#FFE600';
          ctx.font = 'bold 22px "Space Grotesk", sans-serif';
          ctx.fillText('🦅 PÁJAROS EN LA CABEZA', 60, 1144);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('• Mockup Personalizado', 330, 1143);
          ctx.restore();

          resolve(canvas);
        });
      } else {
        // Without user design, just finish canvas
        resolve(canvas);
      }
    });
  });
}

/**
 * Handle Download Preview
 */
function handleDownloadPreview() {
  const btn = document.getElementById('btn-download-preview');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = `<span>⏳ Generando imagen en alta resolución...</span>`;
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
          btn.innerHTML = `<span>✓ ¡Imagen Descargada! 📸</span>`;
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
 * Handle WhatsApp Order Flow
 */
function handleWhatsAppOrder() {
  if (!currentProduct) return;

  const paymentNames = {
    '0.85': 'Efectivo en Local (15% OFF)',
    '0.9': 'Transferencia Bancaria (10% OFF)',
    '1.0': 'Mercado Pago (1 pago)'
  };
  const paymentName = paymentNames[String(selectedPaymentFactor)] || 'Transferencia Bancaria (10% OFF)';

  const basePrice = Number(currentProduct.price) || 18000;
  const total = Math.round(basePrice * selectedQuantity * selectedPaymentFactor);
  const totalFormatted = formatCurrency(total);

  let message = `¡Hola Pájaros en la Cabeza! 🦅\n`;
  message += `Quisiera encargar un producto personalizado usando la tienda como plantilla:\n\n`;
  message += `🛍️ Producto: ${currentProduct.name}\n`;
  message += `🎨 Color: ${selectedColor}\n`;
  message += `📏 Talle: ${selectedSize}\n`;
  message += `🔢 Cantidad: ${selectedQuantity} unidad(es)\n`;
  message += `💳 Forma de Pago: ${paymentName}\n`;
  message += `💰 Total Estimado: ${totalFormatted}\n\n`;

  if (currentDesign.imageSrc) {
    message += `📸 ¡Ya diseñé la vista previa y ubiqué mi estampa en la web! Te adjunto la imagen por este chat para que vean exactamente cómo lo quiero.\n\n`;
  } else {
    message += `💡 Quiero estampar un logo o imagen que te envío por acá.\n\n`;
  }

  message += `¿Tienen disponibilidad para coordinar el pedido y envío? ¡Muchas gracias!`;

  const phone = '5493517620847';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Automatically trigger download of preview so customer has it ready to attach on WhatsApp
  if (currentDesign.imageSrc) {
    handleDownloadPreview();
  }

  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
}

// Start studio on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudio);
} else {
  initStudio();
}
