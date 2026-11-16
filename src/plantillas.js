/* ==========================================================================
   PLANTILLAS & LIVE CUSTOMIZER PAGE - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { getTemplates, subscribeToStore } from './data/store.js';
import { TEMPLATE_CATEGORIES, TEMPLATE_PRODUCTS } from './data/templates.js';
import { renderTemplatePreview, downloadCanvas } from './utils/customizerCanvas.js';

// Page Filter State
let activeCategory = 'all';
let selectedProductFilter = 'all';
let searchQuery = '';

// Customizer Active Studio State
let currentTemplate = null;
let currentProductType = 'remera';
let currentColor = null;
let currentSize = 'M';
let currentFieldValues = {};
let currentUserImage = null;
let currentUserImageFilename = '';
let currentPaymentDiscount = 0.9; // 10% OFF default

/**
 * Render Category Chips Filter
 */
function renderCategoryFilters() {
  const container = document.getElementById('tpl-category-filters');
  if (!container) return;

  container.innerHTML = TEMPLATE_CATEGORIES.map(cat => `
    <button type="button" class="tpl-filter-chip ${activeCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
      <span>${cat.emoji}</span>
      <span>${cat.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.tpl-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.getAttribute('data-cat-id');
      renderCategoryFilters();
      renderTemplatesGrid();
    });
  });
}

/**
 * Render All Templates in the Grid
 */
function renderTemplatesGrid() {
  const container = document.getElementById('templates-cards-container');
  if (!container) return;

  const allTemplates = getTemplates();

  // Filter by category
  let filtered = allTemplates;
  if (activeCategory !== 'all') {
    filtered = filtered.filter(t => t.category === activeCategory);
  }

  // Filter by product support
  if (selectedProductFilter !== 'all') {
    filtered = filtered.filter(t => 
      !t.allowedProducts || t.allowedProducts.includes(selectedProductFilter)
    );
  }

  // Filter by search query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(q) ||
      (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.categoryLabel && t.categoryLabel.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1.5rem; background: var(--color-taupe-light); border: var(--border-heavy); border-radius: 12px;">
        <span style="font-size: 2.8rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <h3 style="margin: 0 0 0.5rem 0; font-family: var(--font-heading); font-weight: 800;">No se encontraron plantillas</h3>
        <p style="color: #666; font-size: 0.95rem; margin: 0;">Prueba seleccionando otra categoría o borrando la búsqueda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(tpl => {
    const defaultProdKey = tpl.defaultProduct || 'remera';
    const prodInfo = TEMPLATE_PRODUCTS[defaultProdKey] || TEMPLATE_PRODUCTS.remera;
    const priceDisplay = `$${(tpl.basePrice || prodInfo.basePrice).toLocaleString('es-AR')}`;

    return `
      <div class="template-card" data-tpl-id="${tpl.id}">
        
        <div class="template-preview-wrap">
          <canvas class="template-preview-canvas" width="400" height="300" id="card-canvas-${tpl.id}"></canvas>
          
          <div class="template-card-overlay">
            <span class="badge badge-${tpl.badgeColor || 'yellow'}">${tpl.badge || 'Regalo Rápido'}</span>
          </div>

          ${tpl.hasPhoto ? `
            <div class="template-photo-badge">
              <span>📷</span>
              <span>Lleva Foto</span>
            </div>
          ` : `
            <div class="template-photo-badge" style="background: var(--color-taupe-dark); border-color: #666;">
              <span>✏️</span>
              <span>Solo Texto</span>
            </div>
          `}
        </div>

        <div class="template-card-body">
          <span class="template-category-tag">${tpl.categoryLabel || tpl.category}</span>
          <h3 class="template-card-title">${tpl.name}</h3>
          <p class="template-card-desc">${tpl.subtitle || tpl.description}</p>

          <div class="template-card-footer">
            <div class="template-price-box">
              <span class="template-price-label">Desde</span>
              <span class="template-price-val">${priceDisplay}</span>
            </div>
            <button type="button" class="btn btn-primary btn-sm btn-open-customizer" data-template-id="${tpl.id}">
              <span>Personalizar ✨</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  // Render live preview on each card's miniature canvas
  filtered.forEach(tpl => {
    const canvas = document.getElementById(`card-canvas-${tpl.id}`);
    if (canvas) {
      const prodKey = tpl.defaultProduct || 'remera';
      const prodInfo = TEMPLATE_PRODUCTS[prodKey] || TEMPLATE_PRODUCTS.remera;
      const color = prodInfo.colors[0];
      const defaultFields = {};
      if (tpl.fields) {
        tpl.fields.forEach(f => {
          defaultFields[f.id] = f.defaultValue || '';
        });
      }

      renderTemplatePreview(canvas, {
        template: tpl,
        productType: prodKey,
        color: color,
        fieldValues: defaultFields,
        userImage: null
      });
    }
  });

  // Attach click events on "Personalizar" buttons
  container.querySelectorAll('.btn-open-customizer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tplId = btn.getAttribute('data-template-id');
      const targetTpl = allTemplates.find(t => t.id === tplId);
      if (targetTpl) {
        openCustomizer(targetTpl);
      }
    });
  });
}

/**
 * Open and Setup the Interactive Customizer Studio Modal
 */
function openCustomizer(tpl) {
  currentTemplate = tpl;
  currentProductType = tpl.defaultProduct || 'remera';
  
  // Set default product info and colors
  const prodInfo = TEMPLATE_PRODUCTS[currentProductType] || TEMPLATE_PRODUCTS.remera;
  currentColor = prodInfo.colors[0];
  currentSize = prodInfo.sizes[0] || 'M';

  // Initialize fields
  currentFieldValues = {};
  if (tpl.fields) {
    tpl.fields.forEach(f => {
      currentFieldValues[f.id] = f.defaultValue || '';
    });
  }

  // Reset photo
  currentUserImage = null;
  currentUserImageFilename = '';

  // Update modal header
  document.getElementById('customizer-tpl-name').textContent = tpl.name;
  document.getElementById('customizer-tpl-subtitle').textContent = `${tpl.categoryLabel} • Regalo Rápido`;

  // Render Product Selector
  renderCustomizerProducts();

  // Render Colors & Sizes
  renderCustomizerColorsAndSizes();

  // Render Photo upload section
  setupCustomizerPhotoSection();

  // Render Text inputs
  renderCustomizerDynamicInputs();

  // Recalculate price
  updateCustomizerSummary();

  // Render Canvas
  updateCustomizerCanvas();

  // Show Modal
  const modal = document.getElementById('customizer-modal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Close Customizer
 */
function closeCustomizer() {
  const modal = document.getElementById('customizer-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Render Product selection buttons in the Customizer
 */
function renderCustomizerProducts() {
  const container = document.getElementById('customizer-product-types');
  if (!container) return;

  const allowed = currentTemplate.allowedProducts || ['remera', 'hoodie', 'taza', 'totebag'];
  const productIcons = {
    remera: '👕',
    hoodie: '🧥',
    taza: '☕',
    totebag: '👜'
  };

  container.innerHTML = allowed.map(pKey => {
    const pInfo = TEMPLATE_PRODUCTS[pKey];
    if (!pInfo) return '';
    const isActive = currentProductType === pKey;

    return `
      <button type="button" class="product-type-chip ${isActive ? 'active' : ''}" data-product="${pKey}">
        <span style="font-size: 1.3rem;">${productIcons[pKey] || '🛍️'}</span>
        <span>${pInfo.name.split(' ')[0]}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.product-type-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.getAttribute('data-product');
      if (pKey === currentProductType) return;
      currentProductType = pKey;

      const pInfo = TEMPLATE_PRODUCTS[currentProductType];
      currentColor = pInfo.colors[0];
      currentSize = pInfo.sizes[0] || 'M';

      renderCustomizerProducts();
      renderCustomizerColorsAndSizes();
      updateCustomizerSummary();
      updateCustomizerCanvas();
    });
  });
}

/**
 * Render Colors & Sizes for the currently active product
 */
function renderCustomizerColorsAndSizes() {
  const pInfo = TEMPLATE_PRODUCTS[currentProductType] || TEMPLATE_PRODUCTS.remera;

  // 1. Colors
  const colorsContainer = document.getElementById('customizer-colors-grid');
  const colorNameLabel = document.getElementById('selected-color-name');
  if (colorsContainer) {
    colorsContainer.innerHTML = pInfo.colors.map(col => `
      <button type="button" 
        class="color-swatch ${currentColor.id === col.id ? 'active' : ''}" 
        data-color-id="${col.id}" 
        style="background-color: ${col.hex};" 
        title="${col.name}"
        aria-label="Color ${col.name}">
      </button>
    `).join('');

    colorNameLabel.textContent = currentColor.name;

    colorsContainer.querySelectorAll('.color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const colId = btn.getAttribute('data-color-id');
        const found = pInfo.colors.find(c => c.id === colId);
        if (found) {
          currentColor = found;
          colorNameLabel.textContent = currentColor.name;
          colorsContainer.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateCustomizerCanvas();
        }
      });
    });
  }

  // 2. Sizes
  const sizeSection = document.getElementById('customizer-size-section');
  const sizesContainer = document.getElementById('customizer-sizes-grid');
  const sizeNameLabel = document.getElementById('selected-size-name');

  if (pInfo.sizes.length <= 1) {
    // Single size item (Taza or Totebag)
    sizeSection.style.display = 'none';
    currentSize = pInfo.sizes[0] || 'Único';
  } else {
    sizeSection.style.display = 'flex';
    sizeNameLabel.textContent = currentSize;

    sizesContainer.innerHTML = pInfo.sizes.map(sz => `
      <button type="button" class="size-chip ${currentSize === sz ? 'active' : ''}" data-size="${sz}">
        ${sz}
      </button>
    `).join('');

    sizesContainer.querySelectorAll('.size-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSize = btn.getAttribute('data-size');
        sizeNameLabel.textContent = currentSize;
        sizesContainer.querySelectorAll('.size-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
}

/**
 * Setup photo section (show/hide and bind file input)
 */
function setupCustomizerPhotoSection() {
  const photoSection = document.getElementById('customizer-photo-section');
  const dropzone = document.getElementById('photo-dropzone');
  const fileInput = document.getElementById('photo-file-input');
  const previewBar = document.getElementById('photo-preview-bar');
  const thumbImg = document.getElementById('photo-thumb-preview');
  const filenameSpan = document.getElementById('photo-filename');
  const removeBtn = document.getElementById('btn-remove-photo');

  if (!currentTemplate.hasPhoto) {
    photoSection.style.display = 'none';
    return;
  }

  photoSection.style.display = 'flex';
  
  // Reset preview UI
  dropzone.style.display = 'flex';
  previewBar.style.display = 'none';
  fileInput.value = '';

  // Trigger file dialog
  dropzone.onclick = () => fileInput.click();

  // Handle file select
  fileInput.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    currentUserImageFilename = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentUserImage = img;
        thumbImg.src = event.target.result;
        filenameSpan.textContent = file.name;
        dropzone.style.display = 'none';
        previewBar.style.display = 'flex';
        updateCustomizerCanvas();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  removeBtn.onclick = () => {
    currentUserImage = null;
    currentUserImageFilename = '';
    fileInput.value = '';
    dropzone.style.display = 'flex';
    previewBar.style.display = 'none';
    updateCustomizerCanvas();
  };
}

/**
 * Render Dynamic Text Input Fields
 */
function renderCustomizerDynamicInputs() {
  const container = document.getElementById('customizer-dynamic-inputs');
  if (!container || !currentTemplate.fields) return;

  container.innerHTML = currentTemplate.fields.map(f => {
    const val = currentFieldValues[f.id] || '';
    const max = f.maxLength || 40;

    return `
      <div class="form-group" style="margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label class="form-label" for="input-field-${f.id}" style="font-size: 0.82rem; margin: 0;">${f.label}</label>
          <span style="font-size: 0.72rem; color: #888;" id="char-counter-${f.id}">${val.length} / ${max}</span>
        </div>
        <input type="text" 
          id="input-field-${f.id}" 
          class="form-input" 
          value="${val}" 
          placeholder="${f.placeholder || ''}" 
          maxlength="${max}"
          data-field-id="${f.id}"
          style="padding: 0.65rem 0.85rem; font-size: 0.9rem;">
      </div>
    `;
  }).join('');

  // Bind input listeners for real-time live typing updates
  container.querySelectorAll('.form-input').forEach(input => {
    const fId = input.getAttribute('data-field-id');
    const fDef = currentTemplate.fields.find(f => f.id === fId);
    const counter = document.getElementById(`char-counter-${fId}`);

    input.addEventListener('input', () => {
      currentFieldValues[fId] = input.value;
      if (counter && fDef) {
        counter.textContent = `${input.value.length} / ${fDef.maxLength || 40}`;
      }
      updateCustomizerCanvas();
    });
  });
}

/**
 * Render Canvas Live Preview
 */
function updateCustomizerCanvas() {
  const canvas = document.getElementById('customizer-canvas');
  if (!canvas || !currentTemplate) return;

  renderTemplatePreview(canvas, {
    template: currentTemplate,
    productType: currentProductType,
    color: currentColor,
    fieldValues: currentFieldValues,
    userImage: currentUserImage
  });
}

/**
 * Calculate and display pricing summary
 */
function updateCustomizerSummary() {
  const pInfo = TEMPLATE_PRODUCTS[currentProductType] || TEMPLATE_PRODUCTS.remera;
  const productNameLabel = document.getElementById('summary-product-name');
  const totalDisplay = document.getElementById('summary-total-display');

  const basePrice = pInfo.basePrice;
  const finalPrice = Math.round(basePrice * currentPaymentDiscount);

  if (productNameLabel) {
    productNameLabel.textContent = `${pInfo.name}`;
  }

  if (totalDisplay) {
    totalDisplay.textContent = `$${finalPrice.toLocaleString('es-AR')}`;
  }

  return { basePrice, finalPrice };
}

/**
 * Format order summary and trigger WhatsApp redirection
 */
function sendOrderToWhatsApp() {
  if (!currentTemplate) return;

  const pInfo = TEMPLATE_PRODUCTS[currentProductType] || TEMPLATE_PRODUCTS.remera;
  const { finalPrice } = updateCustomizerSummary();

  const paymentSelect = document.getElementById('customizer-payment-select');
  const paymentMethodName = paymentSelect ? paymentSelect.options[paymentSelect.selectedIndex].text : 'Transferencia';

  // Format dynamic fields list
  let fieldsText = '';
  if (currentTemplate.fields) {
    fieldsText = currentTemplate.fields.map(f => {
      const val = currentFieldValues[f.id] || '(Sin especificar)';
      return `  • *${f.label}:* ${val}`;
    }).join('\n');
  }

  const hasPhotoText = currentTemplate.hasPhoto 
    ? (currentUserImage 
        ? `📸 *Foto Personalizada:* ¡Te la adjunto en este chat a continuación!` 
        : `📸 *Foto Personalizada:* (Te la envío por aquí ahora)`)
    : `✏️ *Diseño:* Sin foto (Tipográfico / Ilustrado)`;

  const message = `¡Hola Pájaros en la Cabeza! 🎁 Quiero encargar este Regalo Rápido:

✨ *Plantilla:* ${currentTemplate.name}
📂 *Categoría:* ${currentTemplate.categoryLabel}
🛍️ *Producto:* ${pInfo.name}
🎨 *Color:* ${currentColor.name}
📏 *Talle:* ${currentSize}

📝 *Datos Personalizados:*
${fieldsText}

${hasPhotoText}

💰 *Presupuesto Estimado:* $${finalPrice.toLocaleString('es-AR')} (${paymentMethodName})

¿Me confirman la disponibilidad para despachar mi pedido?`;

  const whatsappUrl = `https://wa.me/5493517620847?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Copy Order Summary to Clipboard
 */
function copyOrderSummary() {
  if (!currentTemplate) return;

  const pInfo = TEMPLATE_PRODUCTS[currentProductType] || TEMPLATE_PRODUCTS.remera;
  const { finalPrice } = updateCustomizerSummary();

  let fieldsText = '';
  if (currentTemplate.fields) {
    fieldsText = currentTemplate.fields.map(f => `${f.label}: ${currentFieldValues[f.id] || ''}`).join(' | ');
  }

  const summary = `Plantilla: ${currentTemplate.name} | Producto: ${pInfo.name} (${currentColor.name}, Talle: ${currentSize}) | Personalización: ${fieldsText} | Total: $${finalPrice.toLocaleString('es-AR')}`;

  navigator.clipboard.writeText(summary).then(() => {
    const copyBtn = document.getElementById('btn-copy-summary');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<span>¡Copiado! ✓</span>`;
      setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
    }
  });
}

/**
 * Mobile Navigation Toggle
 */
function setupMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    }
  });
}

/**
 * Initialize Plantillas Page
 */
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryFilters();
  renderTemplatesGrid();
  setupMobileMenu();

  // Search input handler
  const searchInput = document.getElementById('tpl-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTemplatesGrid();
    });
  }

  // Product support filter select
  const productFilter = document.getElementById('tpl-product-filter');
  if (productFilter) {
    productFilter.addEventListener('change', (e) => {
      selectedProductFilter = e.target.value;
      renderTemplatesGrid();
    });
  }

  // Modal Close Handlers
  document.getElementById('customizer-close-btn')?.addEventListener('click', closeCustomizer);
  const modal = document.getElementById('customizer-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeCustomizer();
      }
    });
  }

  // Payment select change
  document.getElementById('customizer-payment-select')?.addEventListener('change', (e) => {
    currentPaymentDiscount = parseFloat(e.target.value) || 1.0;
    updateCustomizerSummary();
  });

  // Download preview button
  document.getElementById('btn-download-preview')?.addEventListener('click', () => {
    const canvas = document.getElementById('customizer-canvas');
    if (canvas && currentTemplate) {
      downloadCanvas(canvas, `regalo-personalizado-${currentTemplate.id}.png`);
    }
  });

  // Copy summary button
  document.getElementById('btn-copy-summary')?.addEventListener('click', copyOrderSummary);

  // WhatsApp order button
  document.getElementById('btn-order-whatsapp')?.addEventListener('click', sendOrderToWhatsApp);

  // Check URL parameters for direct opening (e.g. ?tpl=tpl-polaroid-love)
  const urlParams = new URLSearchParams(window.location.search);
  const targetTplId = urlParams.get('tpl');
  if (targetTplId) {
    const targetTpl = getTemplates().find(t => t.id === targetTplId);
    if (targetTpl) {
      setTimeout(() => openCustomizer(targetTpl), 300);
    }
  }

  // Subscribe to real-time store updates
  subscribeToStore(({ templates }) => {
    if (templates) {
      renderTemplatesGrid();
    }
  });
});
