/* ==========================================================================
   MAIN APPLICATION LOGIC - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { BRAND_INFO, SHIPPING_RATES, getCategories, getProducts, subscribeToStore } from './data/store.js';

// SVG Visual Generator for Flat Design Cards
function getFlatSvgIllustration(type) {
  switch (type) {
    case 'hoodie_liso':
      return `
        <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#EBE7DF; width:100%; height:100%;">
          <rect width="400" height="240" fill="#EBE7DF"/>
          <path d="M130 60 L170 35 L230 35 L270 60 L330 90 L300 130 L270 115 L270 210 L130 210 L130 115 L100 130 L70 90 Z" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/>
          <path d="M170 35 Q200 65 230 35" stroke="#FFE600" stroke-width="5" fill="none"/>
          <rect x="160" y="140" width="80" height="50" fill="#2B2B2B" stroke="#0D0D0D" stroke-width="3"/>
          <circle cx="200" cy="45" r="4" fill="#FF0066"/>
        </svg>
      `;
    case 'mochila':
      return `
        <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#F4F2EC; width:100%; height:100%;">
          <rect width="400" height="240" fill="#F4F2EC"/>
          <rect x="130" y="40" width="140" height="170" rx="20" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/>
          <rect x="150" y="80" width="100" height="70" fill="#FFE600" stroke="#0D0D0D" stroke-width="3"/>
          <line x1="150" y1="115" x2="250" y2="115" stroke="#0D0D0D" stroke-width="4"/>
          <rect x="160" y="165" width="80" height="30" fill="#FF0066" stroke="#0D0D0D" stroke-width="3"/>
          <path d="M170 40 Q200 20 230 40" stroke="#0D0D0D" stroke-width="6" fill="none"/>
        </svg>
      `;
    case 'rinonera':
      return `
        <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#EBE7DF; width:100%; height:100%;">
          <rect width="400" height="240" fill="#EBE7DF"/>
          <path d="M50 110 L350 110" stroke="#0D0D0D" stroke-width="14"/>
          <path d="M100 100 C100 100 120 170 200 170 C280 170 300 100 300 100 Z" fill="#FF0066" stroke="#0D0D0D" stroke-width="4"/>
          <path d="M120 100 L280 100 L260 135 L140 135 Z" fill="#FFE600" stroke="#0D0D0D" stroke-width="3"/>
          <circle cx="200" cy="118" r="6" fill="#0D0D0D"/>
        </svg>
      `;
    case 'kit_local':
    default:
      return `
        <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="background:#FFE600; width:100%; height:100%;">
          <rect width="400" height="240" fill="#FFE600"/>
          <rect x="60" y="50" width="150" height="140" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="4"/>
          <circle cx="135" cy="110" r="30" fill="#FF0066"/>
          <rect x="230" y="60" width="120" height="70" fill="#FFFFFF" stroke="#0D0D0D" stroke-width="4"/>
          <line x1="250" y1="85" x2="330" y2="85" stroke="#0D0D0D" stroke-width="4"/>
          <line x1="250" y1="105" x2="310" y2="105" stroke="#FF0066" stroke-width="3"/>
          <rect x="240" y="150" width="100" height="40" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="3"/>
        </svg>
      `;
  }
}

// Render Categories
function renderCategories() {
  const container = document.getElementById('category-cards-container');
  if (!container) return;

  const categories = getCategories();
  container.innerHTML = categories.map(cat => `
    <a href="#ropa-personalizada" class="category-card" data-category-filter="${cat.id}">
      <div class="category-image-wrap">
        ${cat.image 
          ? `<img src="${cat.image}" alt="${cat.name}" width="300" height="200" loading="lazy">`
          : getFlatSvgIllustration(cat.svgType)
        }
      </div>
      <div class="category-info">
        <span class="badge badge-black" style="align-self: flex-start; font-size: 0.7rem;">${cat.badge}</span>
        <h3 class="category-title">${cat.name}</h3>
        <p class="category-desc">${cat.description}</p>
        <div class="category-footer">
          <span>${cat.count || 0} Variedades</span>
          <span style="color: var(--color-magenta);">Ver Colección →</span>
        </div>
      </div>
    </a>
  `).join('');

  // Add click handlers on category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const catId = card.getAttribute('data-category-filter');
      filterProducts(catId);
    });
  });
}

// Render Products Grid
function renderProducts(items) {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  const productsToRender = items || getProducts();

  if (productsToRender.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; font-weight: 700;">No hay productos en esta categoría.</p>`;
    return;
  }

  container.innerHTML = productsToRender.map(product => `
    <div class="product-card">
      <div class="product-badge-overlay">
        <span class="badge badge-${product.badgeColor || 'yellow'}">${product.badge || 'Producto'}</span>
      </div>

      <a href="./producto.html?id=${product.id}" class="product-img-wrap" style="display: block;">
        ${product.image
          ? `<img src="${product.image}" alt="${product.name}" width="350" height="240" loading="lazy">`
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
  `).join('');

  // Re-bind modal triggers
  bindQuoteButtons();
}

// Filter Products
function filterProducts(categoryId) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-filter') === categoryId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const allProducts = getProducts();
  if (categoryId === 'all') {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === categoryId);
    renderProducts(filtered);
  }
}

// Shipping Rates Estimator setup
function setupShippingCalculator() {
  const select = document.getElementById('shipping-region-select');
  const resultDisplay = document.getElementById('shipping-result-display');
  if (!select || !resultDisplay) return;

  select.innerHTML = `<option value="">-- Selecciona tu provincia / ubicación --</option>` +
    SHIPPING_RATES.map((rate, idx) => `
      <option value="${idx}">${rate.region} ($${rate.cost.toLocaleString('es-AR')})</option>
    `).join('');

  select.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === "") {
      resultDisplay.innerHTML = "Selecciona tu provincia para ver el costo estimado y plazo.";
      resultDisplay.style.backgroundColor = "var(--color-magenta)";
      return;
    }
    const selectedRate = SHIPPING_RATES[idx];
    resultDisplay.style.backgroundColor = "var(--color-black)";
    resultDisplay.innerHTML = `
      <strong>Costo estimado: $${selectedRate.cost.toLocaleString('es-AR')}</strong><br>
      Plazo de entrega: ${selectedRate.time}<br>
      <small style="color: var(--color-yellow);">✅ Cargo a abonar al recibir/despachar por el comprador.</small>
    `;
  });
}

// Quote Modal Calculator Logic ("Cotiza tu Diseño")
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

  // Open modal handlers
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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  function calculateTotal() {
    const unitPrice = parseFloat(productSelect.value) || 18500;
    const qty = parseInt(quantityInput.value) || 1;
    let extraMultiplier = 1.0;

    if (printBack && printBack.checked) extraMultiplier += 0.15; // 15% extra for back print
    if (printAdvisory && printAdvisory.checked) extraMultiplier += 0.05; // 5% extra for advisory

    const paymentDiscount = parseFloat(paymentSelect.value) || 1.0;

    const total = Math.round(unitPrice * qty * extraMultiplier * paymentDiscount);
    totalDisplay.textContent = `$${total.toLocaleString('es-AR')}`;
    return { total, qty, unitPrice };
  }

  // Event listeners for form changes
  [productSelect, quantityInput, printFront, printBack, printAdvisory, paymentSelect].forEach(element => {
    element?.addEventListener('input', calculateTotal);
    element?.addEventListener('change', calculateTotal);
  });

  // WhatsApp click handler
  whatsappBtn?.addEventListener('click', () => {
    const { total, qty } = calculateTotal();
    const productName = productSelect.options[productSelect.selectedIndex].text;
    const paymentName = paymentSelect.options[paymentSelect.selectedIndex].text;

    const message = `Hola Pájaros en la Cabeza! Quisiera consultar por la cotización de:\n- Producto: ${productName}\n- Cantidad: ${qty} unidades\n- Forma de pago: ${paymentName}\n- Presupuesto aproximado: $${total.toLocaleString('es-AR')}\n\n¿Me pueden enviar más información sobre la Asesoría de Imagen para mi local?`;
    
    const whatsappUrl = `https://wa.me/5491155443322?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  });
}

function bindQuoteButtons() {
  // Handled by delegated listener in setupQuoteCalculator
}

// Contact Form Handler
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Gracias por tu mensaje! El equipo de Pájaros en la Cabeza se pondrá en contacto contigo a la brevedad para asesorarte.');
    form.reset();
  });
}

// Mobile Menu Toggle
function setupMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  // Close menu when clicking any nav link
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    });
  });

  // Close menu when clicking outside header
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    }
  });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts(getProducts());
  setupShippingCalculator();
  setupQuoteCalculator();
  setupContactForm();
  setupMobileMenu();

  // Re-render when Firebase updates store
  subscribeToStore(({ products }) => {
    renderCategories();
    renderProducts(products);
  });

  // Filter Buttons Event Delegation
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = btn.getAttribute('data-filter');
      filterProducts(filter);
    });
  });
});
