/* ==========================================================================
   ADMIN PANEL LOGIC - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { 
  getProducts, 
  getCategories, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  resetToDefaults 
} from './data/store.js';

const ADMIN_PASSWORD = 'adminpajaros';
const AUTH_KEY = 'pajaros_admin_authenticated';

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

// Authentication Check
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function checkAuthUI() {
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (isAuthenticated()) {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    renderAllAdminData();
  } else {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
  }
}

// Setup Login Form
function setupLoginForm() {
  const form = document.getElementById('login-form');
  const passwordInput = document.getElementById('admin-password');
  const errorMsg = document.getElementById('login-error-msg');
  const logoutBtn = document.getElementById('logout-btn');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      errorMsg.style.display = 'none';
      passwordInput.value = '';
      checkAuthUI();
    } else {
      errorMsg.style.display = 'block';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuthUI();
  });
}

// Tab Switching
function setupTabNavigation() {
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`)?.classList.add('active');
    });
  });
}

// Render Products Table / Cards in Admin
function renderAdminProducts() {
  const container = document.getElementById('admin-products-container');
  if (!container) return;

  const products = getProducts();

  if (products.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--color-white); border: var(--border-thick);">No hay productos registrados. Haz clic en <strong>+ Agregar Producto</strong>.</div>`;
    return;
  }

  container.innerHTML = products.map(prod => `
    <div class="admin-prod-card" data-id="${prod.id}">
      <div class="admin-prod-media">
        ${prod.image 
          ? `<img src="${prod.image}" alt="${prod.name}">` 
          : getFlatSvgIllustration(prod.svgType)}
      </div>
      <div class="admin-prod-details">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <span class="badge badge-${prod.badgeColor || 'yellow'}">${prod.badge || 'Producto'}</span>
          <span class="product-price">${prod.priceFormatted || `$${prod.price}`}</span>
        </div>
        <h4 style="margin: 0.4rem 0;">${prod.name}</h4>
        <div style="font-size: 0.8rem; color: var(--color-taupe-dark); margin-bottom: 0.6rem;">
          📁 Categoría: <strong>${prod.categoryLabel || prod.category}</strong>
        </div>
        ${prod.advisoryIncluded 
          ? `<div style="font-size: 0.75rem; font-weight: 700; color: var(--color-black); background: var(--color-yellow); padding: 0.2rem 0.4rem; border: var(--border-thin); display: inline-block;">✓ Asesoría de Imagen Incluida</div>` 
          : ''}
        <div class="admin-card-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn btn-outline btn-sm edit-prod-btn" data-id="${prod.id}" style="flex: 1;">Editar</button>
          <button class="btn btn-dark btn-sm delete-prod-btn" data-id="${prod.id}" style="background-color: var(--color-magenta);">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind edit and delete handlers
  container.querySelectorAll('.edit-prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditProductModal(id);
    });
  });

  container.querySelectorAll('.delete-prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Estás segura de eliminar este producto?')) {
        deleteProduct(id);
        renderAllAdminData();
      }
    });
  });
}

// Render Categories Grid in Admin
function renderAdminCategories() {
  const container = document.getElementById('admin-categories-container');
  if (!container) return;

  const categories = getCategories();

  container.innerHTML = categories.map(cat => `
    <div class="admin-cat-card" data-id="${cat.id}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-black">${cat.badge || 'Categoría'}</span>
        <span style="font-size: 0.8rem; font-weight: 700;">ID: ${cat.id}</span>
      </div>
      <h3 style="margin: 0.6rem 0 0.2rem;">${cat.name}</h3>
      <p style="font-size: 0.85rem; color: var(--color-taupe-dark); margin-bottom: 0.8rem;">${cat.description || cat.subtitle || ''}</p>
      <div class="admin-card-actions" style="display: flex; gap: 0.5rem; margin-top: auto;">
        <button class="btn btn-dark btn-sm delete-cat-btn" data-id="${cat.id}" style="background-color: var(--color-magenta); width: 100%;">Eliminar Categoría</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('¿Estás segura de eliminar esta categoría?')) {
        deleteCategory(id);
        renderAllAdminData();
      }
    });
  });
}

// Update Counts & Category Select options
function updateCountsAndSelects() {
  const products = getProducts();
  const categories = getCategories();

  const prodCountBadge = document.getElementById('sidebar-prod-count');
  const catCountBadge = document.getElementById('sidebar-cat-count');
  const categorySelect = document.getElementById('prod-form-category');

  if (prodCountBadge) prodCountBadge.textContent = products.length;
  if (catCountBadge) catCountBadge.textContent = categories.length;

  if (categorySelect) {
    categorySelect.innerHTML = categories.map(cat => `
      <option value="${cat.id}">${cat.name}</option>
    `).join('');
  }
}

// Render All Admin Views
function renderAllAdminData() {
  updateCountsAndSelects();
  renderAdminProducts();
  renderAdminCategories();
}

// Product Modal Handling
function setupProductModal() {
  const modal = document.getElementById('admin-prod-modal');
  const openBtn = document.getElementById('open-add-product-modal');
  const closeBtn = document.getElementById('close-prod-modal');
  const form = document.getElementById('prod-form');
  const modalTitle = document.getElementById('prod-modal-title');

  if (!modal || !form) return;

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
    document.getElementById('prod-form-id').value = '';
  }

  openBtn?.addEventListener('click', () => {
    modalTitle.textContent = 'Agregar Nuevo Producto';
    form.reset();
    document.getElementById('prod-form-id').value = '';
    modal.classList.add('active');
  });

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('prod-form-id').value;
    const catSelect = document.getElementById('prod-form-category');
    const selectedCatLabel = catSelect.options[catSelect.selectedIndex]?.text || '';

    const prodData = {
      name: document.getElementById('prod-form-name').value,
      category: catSelect.value,
      categoryLabel: selectedCatLabel,
      price: document.getElementById('prod-form-price').value,
      image: document.getElementById('prod-form-image').value || null,
      badge: document.getElementById('prod-form-badge').value || 'Destacado',
      badgeColor: document.getElementById('prod-form-badge-color').value,
      description: document.getElementById('prod-form-description').value,
      advisoryIncluded: document.getElementById('prod-form-advisory').checked
    };

    if (id) {
      updateProduct(id, prodData);
    } else {
      addProduct(prodData);
    }

    closeModal();
    renderAllAdminData();
  });
}

function openEditProductModal(id) {
  const products = getProducts();
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const modal = document.getElementById('admin-prod-modal');
  const modalTitle = document.getElementById('prod-modal-title');

  modalTitle.textContent = 'Editar Producto';
  document.getElementById('prod-form-id').value = prod.id;
  document.getElementById('prod-form-name').value = prod.name || '';
  document.getElementById('prod-form-category').value = prod.category || '';
  document.getElementById('prod-form-price').value = prod.price || '';
  document.getElementById('prod-form-image').value = prod.image || '';
  document.getElementById('prod-form-badge').value = prod.badge || '';
  document.getElementById('prod-form-badge-color').value = prod.badgeColor || 'yellow';
  document.getElementById('prod-form-description').value = prod.description || '';
  document.getElementById('prod-form-advisory').checked = Boolean(prod.advisoryIncluded);

  modal.classList.add('active');
}

// Category Modal Handling
function setupCategoryModal() {
  const modal = document.getElementById('admin-cat-modal');
  const openBtn = document.getElementById('open-add-category-modal');
  const closeBtn = document.getElementById('close-cat-modal');
  const form = document.getElementById('cat-form');

  if (!modal || !form) return;

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
  }

  openBtn?.addEventListener('click', () => {
    form.reset();
    modal.classList.add('active');
  });

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-form-name').value;
    const catId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const catData = {
      id: catId,
      name: name,
      subtitle: document.getElementById('cat-form-subtitle').value || 'Colección',
      description: document.getElementById('cat-form-description').value || '',
      badge: document.getElementById('cat-form-badge').value || 'Categoría'
    };

    addCategory(catData);
    closeModal();
    renderAllAdminData();
  });
}

// Reset Data Button Setup
function setupResetButton() {
  const resetBtn = document.getElementById('reset-data-btn');
  resetBtn?.addEventListener('click', () => {
    if (confirm('¿Estás segura de restablecer el catálogo a la versión inicial por defecto?')) {
      resetToDefaults();
      renderAllAdminData();
    }
  });
}

// Initialize Admin App
document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupTabNavigation();
  setupProductModal();
  setupCategoryModal();
  setupResetButton();
  checkAuthUI();
});
