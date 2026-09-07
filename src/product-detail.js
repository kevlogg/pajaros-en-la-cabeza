/* ==========================================================================
   PRODUCT DETAIL PAGE LOGIC - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { getProducts, getCategories, subscribeToStore, SHIPPING_RATES } from './data/store.js';

// SVG Visual Generator for Flat Design Cards
function getFlatSvgIllustration(type) {
  switch (type) {
    case 'hoodie_liso':
      return `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#EBE7DF; width:100%; height:100%;"><rect width="400" height="240" fill="#EBE7DF"/><path d="M130 60 L170 35 L230 35 L270 60 L330 90 L300 130 L270 115 L270 210 L130 210 L130 115 L100 130 L70 90 Z" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/><path d="M170 35 Q200 65 230 35" stroke="#FFE600" stroke-width="5" fill="none"/><rect x="160" y="140" width="80" height="50" fill="#2B2B2B" stroke="#0D0D0D" stroke-width="3"/><circle cx="200" cy="45" r="4" fill="#FF0066"/></svg>`;
    case 'mochila':
      return `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#F4F2EC; width:100%; height:100%;"><rect width="400" height="240" fill="#F4F2EC"/><rect x="130" y="40" width="140" height="170" rx="20" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/><rect x="150" y="80" width="100" height="70" fill="#FFE600" stroke="#0D0D0D" stroke-width="3"/><line x1="150" y1="115" x2="250" y2="115" stroke="#0D0D0D" stroke-width="4"/><rect x="160" y="165" width="80" height="30" fill="#FF0066" stroke="#0D0D0D" stroke-width="3"/><path d="M170 40 Q200 20 230 40" stroke="#0D0D0D" stroke-width="6" fill="none"/></svg>`;
    case 'rinonera':
      return `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#EBE7DF; width:100%; height:100%;"><rect width="400" height="240" fill="#EBE7DF"/><path d="M50 110 L350 110" stroke="#0D0D0D" stroke-width="14"/><path d="M100 100 C100 100 120 170 200 170 C280 170 300 100 300 100 Z" fill="#FF0066" stroke="#0D0D0D" stroke-width="4"/><path d="M120 100 L280 100 L260 135 L140 135 Z" fill="#FFE600" stroke="#0D0D0D" stroke-width="3"/><circle cx="200" cy="118" r="6" fill="#0D0D0D"/></svg>`;
    default:
      return `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#FFE600; width:100%; height:100%;"><rect width="400" height="240" fill="#FFE600"/><rect x="60" y="50" width="150" height="140" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/><circle cx="135" cy="110" r="30" fill="#FF0066"/><rect x="230" y="60" width="120" height="70" fill="#FFFFFF" stroke="#0D0D0D" stroke-width="4"/><line x1="250" y1="85" x2="330" y2="85" stroke="#0D0D0D" stroke-width="4"/><line x1="250" y1="105" x2="310" y2="105" stroke="#FF0066" stroke-width="3"/><rect x="240" y="150" width="100" height="40" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="3"/></svg>`;
  }
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'prod-1';
}

function renderBreadcrumbs(product) {
  const container = document.getElementById('breadcrumb-container');
  if (!container) return;

  container.innerHTML = `
    <a href="/#inicio">Inicio</a>
    <span>/</span>
    <a href="/#ropa-personalizada">${product?.categoryLabel || 'Catálogo'}</a>
    <span>/</span>
    <span class="active">${product?.name || 'Ficha de Producto'}</span>
  `;
}

function renderProductDetailView() {
  const container = document.getElementById('product-detail-card');
  if (!container) return;

  const targetId = getProductIdFromUrl();
  const products = getProducts();
  const product = products.find(p => p.id === targetId) || products[0];

  if (!product) {
    container.innerHTML = `<div style="padding: 3rem; text-align: center; font-weight: 700;">Producto no encontrado. <a href="/">Volver al inicio</a></div>`;
    return;
  }

  // Update Page Title
  document.title = `${product.name} | Pájaros en la Cabeza`;
  renderBreadcrumbs(product);

  const defaultSpecs = ["Confección Premium Heavyweight", "Talles XS al XXXL disponibles", "Personalización en Serif o Bordado", "Garantía de Calidad Pájaros en la Cabeza"];
  const specs = (product.specs && product.specs.length > 0) ? product.specs : defaultSpecs;
  const colors = (product.colors && product.colors.length > 0) ? product.colors : ["Negro", "Blanco", "Gris Topo"];

  const whatsappMessage = encodeURIComponent(`Hola Pájaros en la Cabeza! Quisiera consultar por la ficha de:\n- Producto: ${product.name}\n- Precio: ${product.priceFormatted || '$' + product.price}\n\n¿Tienen disponibilidad y asesoría para mi local?`);
  const whatsappUrl = `https://wa.me/5493517620847?text=${whatsappMessage}`;

  const productImages = (Array.isArray(product.images) && product.images.length > 0) 
    ? product.images 
    : (product.image ? [product.image] : []);

  container.innerHTML = `
    <div class="product-detail-grid">
      
      <!-- Left Column: Gallery & Media -->
      <div class="product-detail-media">
        <div class="detail-image-card">
          <div class="detail-badge-wrap">
            <span class="badge badge-${product.badgeColor || 'yellow'}">${product.badge || 'Producto'}</span>
          </div>

          <div class="detail-img-box" style="position: relative; border-radius: 12px; overflow: hidden; background: #fff; border: var(--border-thick); min-height: 300px; display: flex; align-items: center; justify-content: center;">
            ${productImages.length > 0 
              ? `<img id="main-product-gallery-img" src="${productImages[0]}" alt="${product.name}" class="detail-main-img" style="width: 100%; height: 100%; object-fit: cover;">` 
              : getFlatSvgIllustration(product.svgType)}
          </div>

          ${productImages.length > 1 ? `
            <div class="product-gallery-thumbnails" style="display: flex; gap: 0.6rem; margin-top: 0.85rem; overflow-x: auto; padding: 0.2rem 0.1rem;">
              ${productImages.map((img, idx) => `
                <button type="button" class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${img}" style="width: 70px; height: 70px; border: 3px solid ${idx === 0 ? 'var(--color-magenta)' : 'var(--color-border)'}; border-radius: 8px; overflow: hidden; padding: 0; background: #fff; cursor: pointer; flex-shrink: 0; transition: border-color 0.2s, transform 0.2s;">
                  <img src="${img}" alt="Foto ${idx+1}" style="width: 100%; height: 100%; object-fit: cover;">
                </button>
              `).join('')}
            </div>
          ` : ''}

          ${product.advisoryIncluded 
            ? `<div class="detail-advisory-banner" style="margin-top: 0.85rem;">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                 <span>Asesoría de Imagen de Local Incluida</span>
               </div>` 
            : ''}
        </div>
      </div>

      <!-- Right Column: Info & CTA -->
      <div class="product-detail-info">
        <span class="product-category-tag">${product.categoryLabel || product.category}</span>
        <h1 class="detail-title">${product.name}</h1>

        <div class="detail-price-box">
          <div class="detail-price">${product.priceFormatted || `$${product.price}`}</div>
          <span class="badge badge-black">Personalización desde 1 Unidad</span>
        </div>

        <div class="detail-payments-strip">
          <div class="payment-mini-badge">🏦 Transferencia 10% OFF</div>
          <div class="payment-mini-badge">💵 Efectivo 15% OFF</div>
          <div class="payment-mini-badge" style="background-color: var(--color-yellow);">💳 Mercado Pago</div>
        </div>

        <div class="detail-description">
          <p>${product.description || 'Prenda indumentaria de alta gama confeccionada para potenciar la marca de tu local o equipo con acabados profesionales.'}</p>
        </div>

        <!-- Specifications list -->
        <div class="detail-specs-box">
          <h4 class="detail-subtitle">Especificaciones de Confección</h4>
          <ul class="specs-list">
            ${specs.map(spec => `
              <li><span class="badge badge-black" style="font-size: 0.65rem;">✓</span> ${spec}</li>
            `).join('')}
          </ul>
        </div>

        <!-- Available Colors -->
        <div class="detail-colors-box">
          <h4 class="detail-subtitle">Colores Disponibles</h4>
          <div class="color-swatches-grid">
            ${colors.map(col => `
              <span class="color-swatch-chip">${col}</span>
            `).join('')}
          </div>
        </div>

        <!-- Action CTA Buttons -->
        <div class="detail-cta-group">
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex: 1;">
            <span>Consultar por WhatsApp</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          </a>

          <button class="btn btn-primary open-quote-modal" data-product-price="${product.price}">
            <span>Cotizar en la Web</span>
          </button>
        </div>

      </div>

    </div>
  `;

  // Thumbnail click handlers
  container.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-src');
      const mainImg = document.getElementById('main-product-gallery-img');
      if (mainImg && src) {
        mainImg.src = src;
      }
      container.querySelectorAll('.gallery-thumb-btn').forEach(b => {
        b.style.borderColor = 'var(--color-border)';
      });
      btn.style.borderColor = 'var(--color-magenta)';
    });
  });

  renderRelatedProducts(product);
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('related-products-container');
  if (!container) return;

  const products = getProducts();
  const related = products.filter(p => p.id !== currentProduct.id && (p.category === currentProduct.category || true)).slice(0, 3);

  container.innerHTML = related.map(prod => `
    <div class="product-card">
      <div class="product-badge-overlay">
        <span class="badge badge-${prod.badgeColor || 'yellow'}">${prod.badge || 'Producto'}</span>
      </div>

      <a href="/producto?id=${prod.id}" class="product-img-wrap" style="display: block;">
        ${prod.image
          ? `<img src="${prod.image}" alt="${prod.name}" width="350" height="240" loading="lazy">`
          : getFlatSvgIllustration(prod.svgType)
        }
      </a>

      <div class="product-body">
        <span class="product-category-tag">${prod.categoryLabel || prod.category}</span>
        <h3 class="product-name"><a href="/producto?id=${prod.id}">${prod.name}</a></h3>
        
        <div class="product-footer">
          <div class="product-price">${prod.priceFormatted || `$${prod.price}`}</div>
          <a href="/producto?id=${prod.id}" class="btn btn-primary btn-sm">
            Ver Ficha →
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Quote Modal Setup
function setupQuoteCalculator() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.getElementById('close-quote-modal');
  const productSelect = document.getElementById('quote-product-type');
  const quantityInput = document.getElementById('quote-quantity');
  const printFront = document.getElementById('print-front');
  const printBack = document.getElementById('print-back');
  const printAdvisory = document.getElementById('print-advisory');
  const paymentSelect = document.getElementById('quote-payment-method');
  const totalDisplay = document.getElementById('quote-total-display');
  const whatsappBtn = document.getElementById('send-whatsapp-quote');

  if (!modal || !productSelect) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.open-quote-modal')) {
      const btn = e.target.closest('.open-quote-modal');
      const prodPrice = btn.getAttribute('data-product-price');
      if (prodPrice) {
        productSelect.value = prodPrice;
      }
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      calculateTotal();
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function calculateTotal() {
    const unitPrice = parseFloat(productSelect.value) || 18500;
    const qty = parseInt(quantityInput.value) || 1;
    let extraMultiplier = 1.0;

    if (printBack && printBack.checked) extraMultiplier += 0.15;
    if (printAdvisory && printAdvisory.checked) extraMultiplier += 0.05;

    const paymentDiscount = parseFloat(paymentSelect.value) || 1.0;
    const total = Math.round(unitPrice * qty * extraMultiplier * paymentDiscount);
    totalDisplay.textContent = `$${total.toLocaleString('es-AR')}`;
    return { total, qty, unitPrice };
  }

  [productSelect, quantityInput, printFront, printBack, printAdvisory, paymentSelect].forEach(element => {
    element?.addEventListener('input', calculateTotal);
    element?.addEventListener('change', calculateTotal);
  });

  whatsappBtn?.addEventListener('click', () => {
    const { total, qty } = calculateTotal();
    const productName = productSelect.options[productSelect.selectedIndex].text;
    const paymentName = paymentSelect.options[paymentSelect.selectedIndex].text;

    const message = `Hola Pájaros en la Cabeza! Quisiera consultar por la cotización de:\n- Producto: ${productName}\n- Cantidad: ${qty} unidades\n- Forma de pago: ${paymentName}\n- Presupuesto aproximado: $${total.toLocaleString('es-AR')}\n\n¿Me pueden enviar más información sobre la Asesoría de Imagen para mi local?`;
    
    const whatsappUrl = `https://wa.me/5493517620847?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Gracias por tu mensaje! El equipo de Pájaros en la Cabeza se pondrá en contacto contigo a la brevedad para asesorarte.');
    form.reset();
  });
}

function setupMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });
}

// Initialize Product Detail Page
document.addEventListener('DOMContentLoaded', () => {
  renderProductDetailView();
  setupQuoteCalculator();
  setupContactForm();
  setupMobileMenu();

  subscribeToStore(() => {
    renderProductDetailView();
  });
});
