/* ==========================================================================
   TIENDA COMPLETE PAGE LOGIC - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { getCategories, getProducts, subscribeToStore } from './data/store.js';

let activeCategoryFilter = 'all';
let searchQuery = '';
let currentSort = 'default';

// SVG Visual Generator Fallback
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

// Render Category Filter Pills
function renderCategoryFilterPills() {
  const container = document.getElementById('tienda-categories-filter');
  if (!container) return;

  const categories = getCategories();

  const allPill = `<button class="filter-btn ${activeCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">Todos los Productos</button>`;
  const catPills = categories.map(cat => `
    <button class="filter-btn ${activeCategoryFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.name}
    </button>
  `).join('');

  container.innerHTML = allPill + catPills;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-cat');
      renderCategoryFilterPills();
      renderTiendaProducts();
    });
  });
}

// Render Products Grid in Tienda
function renderTiendaProducts() {
  const container = document.getElementById('tienda-products-container');
  if (!container) return;

  let products = [...getProducts()];

  // 1. Category Filter
  if (activeCategoryFilter !== 'all') {
    products = products.filter(p => p.category === activeCategoryFilter);
  }

  // 2. Search Filter
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    products = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q))
    );
  }

  // 3. Sorting
  if (currentSort === 'price-asc') {
    products.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (currentSort === 'price-desc') {
    products.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (currentSort === 'name-asc') {
    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1.5rem; background: var(--color-white); border: var(--border-thick); border-radius: 16px;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🛍️</span>
        <h3 style="margin: 0 0 0.5rem 0; font-family: var(--font-display); font-weight: 800;">No se encontraron productos</h3>
        <p style="color: #666; font-size: 0.9rem; margin: 0;">Prueba modificando la búsqueda o seleccionando otra categoría.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => {
    const primaryImg = (Array.isArray(product.images) && product.images.length > 0) 
      ? product.images[0] 
      : (product.image || null);

    return `
      <div class="product-card">
        <div class="product-badge-overlay">
          <span class="badge badge-${product.badgeColor || 'yellow'}">${product.badge || 'Producto'}</span>
        </div>

        <a href="./producto.html?id=${product.id}" class="product-img-wrap" style="display: block;">
          ${primaryImg
            ? `<img src="${primaryImg}" alt="${product.name}" width="350" height="240" loading="lazy">`
            : getFlatSvgIllustration(product.svgType)
          }
        </a>

        <div class="product-body">
          <span class="product-category-tag">${product.categoryLabel || product.category}</span>
          <h3 class="product-name"><a href="./producto.html?id=${product.id}">${product.name}</a></h3>
          
          ${product.advisoryIncluded 
            ? `<div class="product-advisory-note">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                 Asesoría de Imagen de Local Incluida
               </div>` 
            : `<p style="font-size: 0.85rem; color: var(--color-taupe-dark);">${(product.description || '').substring(0, 75)}...</p>`
          }

          <div class="product-footer">
            <div class="product-price">${product.priceFormatted || `$${product.price}`}</div>
            <div style="display: flex; gap: 0.4rem;">
              <a href="./producto.html?id=${product.id}" class="btn btn-outline btn-sm">Ver Ficha</a>
              <button class="btn btn-primary btn-sm open-quote-modal" data-product-id="${product.id}" data-product-price="${product.price}">
                Cotizar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Quote Modal Calculator Logic
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

  function updateProductSelectOptions() {
    const products = getProducts();
    if (products.length === 0) {
      productSelect.innerHTML = `<option value="18500">Producto Personalizado - $18.500 c/u</option>`;
      return;
    }
    productSelect.innerHTML = products.map(p => `
      <option value="${p.price}">${p.name} - $${Number(p.price || 0).toLocaleString('es-AR')} c/u</option>
    `).join('');
  }

  updateProductSelectOptions();

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.open-quote-modal')) {
      const btn = e.target.closest('.open-quote-modal');
      const prodPrice = btn.getAttribute('data-product-price');
      updateProductSelectOptions();
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
    if (totalDisplay) totalDisplay.textContent = `$${total.toLocaleString('es-AR')}`;
    return { total, qty, unitPrice };
  }

  [productSelect, quantityInput, printFront, printBack, printAdvisory, paymentSelect].forEach(element => {
    element?.addEventListener('input', calculateTotal);
    element?.addEventListener('change', calculateTotal);
  });

  whatsappBtn?.addEventListener('click', () => {
    const { total, qty } = calculateTotal();
    const productName = productSelect.options[productSelect.selectedIndex]?.text || 'Producto Personalizado';
    const paymentName = paymentSelect.options[paymentSelect.selectedIndex]?.text || 'Transferencia';

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

// Setup Event Listeners for Search & Sort
function setupFilterControls() {
  const searchInput = document.getElementById('tienda-search-input');
  const sortSelect = document.getElementById('tienda-sort-select');

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTiendaProducts();
  });

  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTiendaProducts();
  });
}

// Initialize Tienda Page
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryFilterPills();
  renderTiendaProducts();
  setupFilterControls();
  setupQuoteCalculator();
  setupContactForm();
  setupMobileMenu();

  subscribeToStore(() => {
    renderCategoryFilterPills();
    renderTiendaProducts();
  });
});
