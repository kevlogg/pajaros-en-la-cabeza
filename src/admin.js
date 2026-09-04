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
  resetToDefaults,
  uploadImageToFirebase,
  subscribeToStore,
  getHeroImage,
  setHeroImage
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
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <span class="badge badge-black">${cat.badge || 'Categoría'}</span>
        <span style="font-size: 0.8rem; font-weight: 700; white-space: nowrap;">ID: ${cat.id}</span>
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando en Firebase...';

    try {
      const id = document.getElementById('prod-form-id').value;
      const catSelect = document.getElementById('prod-form-category');
      const selectedCatLabel = catSelect.options[catSelect.selectedIndex]?.text || '';
      
      const fileInput = document.getElementById('prod-form-file');
      let imageUrl = document.getElementById('prod-form-image').value || null;

      // Upload file to Firebase Storage if selected
      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          const uploadedUrl = await uploadImageToFirebase(fileInput.files[0]);
          if (uploadedUrl) imageUrl = uploadedUrl;
        } catch (storageErr) {
          console.warn('Firebase Storage upload warning (verify Storage Security Rules in console):', storageErr);
        }
      }

      const prodData = {
        name: document.getElementById('prod-form-name').value,
        category: catSelect.value,
        categoryLabel: selectedCatLabel,
        price: document.getElementById('prod-form-price').value,
        image: imageUrl,
        badge: document.getElementById('prod-form-badge').value || 'Destacado',
        badgeColor: document.getElementById('prod-form-badge-color').value,
        description: document.getElementById('prod-form-description').value,
        advisoryIncluded: document.getElementById('prod-form-advisory').checked
      };

      if (id) {
        await updateProduct(id, prodData);
      } else {
        await addProduct(prodData);
      }

      closeModal();
      renderAllAdminData();
    } catch (err) {
      alert('Ocurrió un error al guardar. Revisa la consola o las reglas de Firebase.');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
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

// Hero Image Management in Admin
function setupHeroImageManager() {
  const preview = document.getElementById('admin-hero-preview');
  const fileInput = document.getElementById('hero-file-input');
  const urlInput = document.getElementById('hero-url-input');
  const saveBtn = document.getElementById('save-hero-img-btn');
  const resetBtn = document.getElementById('reset-hero-img-btn');
  const statusMsg = document.getElementById('hero-msg-status');

  if (!preview || !saveBtn) return;

  function updatePreview() {
    const currentUrl = getHeroImage();
    preview.src = currentUrl;
    urlInput.value = currentUrl.startsWith('http') ? currentUrl : '';
  }

  updatePreview();

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      statusMsg.style.display = 'inline';
      statusMsg.style.color = '#0055CC';
      statusMsg.textContent = '⏳ Subiendo foto a Firebase Storage...';
      try {
        const uploadedUrl = await uploadImageToFirebase(file);
        if (uploadedUrl) {
          urlInput.value = uploadedUrl;
          preview.src = uploadedUrl;
          statusMsg.style.color = '#008844';
          statusMsg.textContent = '✓ Foto subida. Haz clic en Guardar.';
        }
      } catch (err) {
        statusMsg.style.color = '#CC0044';
        statusMsg.textContent = '⚠️ Error al subir la imagen.';
      }
    }
  });

  urlInput?.addEventListener('input', () => {
    if (urlInput.value.trim()) {
      preview.src = urlInput.value.trim();
    }
  });

  saveBtn.addEventListener('click', async () => {
    const finalUrl = urlInput.value.trim() || preview.src;
    await setHeroImage(finalUrl);
    statusMsg.style.display = 'inline';
    statusMsg.style.color = '#008844';
    statusMsg.textContent = '✅ ¡Imagen del Hero guardada en vivo!';
    setTimeout(() => { statusMsg.style.display = 'none'; }, 3000);
  });

  resetBtn?.addEventListener('click', async () => {
    if (confirm('¿Restablecer la imagen principal del Hero a la foto original?')) {
      await setHeroImage('/assets/hero_banner.png');
      updatePreview();
      statusMsg.style.display = 'inline';
      statusMsg.style.color = '#008844';
      statusMsg.textContent = '🔄 Restablecido a la imagen por defecto.';
      setTimeout(() => { statusMsg.style.display = 'none'; }, 3000);
    }
  });
}

// "Mi Plan" Accordion and KevDev API Connection
function setupConditionsAccordion() {
  const toggleBtn = document.getElementById('toggle-conditions-btn');
  const body = document.getElementById('conditions-body');
  const chevron = document.getElementById('conditions-chevron');

  if (!toggleBtn || !body) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = body.style.display === 'block';
    body.style.display = isOpen ? 'none' : 'block';
    if (chevron) {
      chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });
}

async function loadPlanData() {
  const tbody = document.getElementById('plan-payments-tbody');
  const overdueAlert = document.getElementById('plan-overdue-alert');

  if (!tbody) return;

  try {
    const res = await fetch('https://www.kevdev.net.ar/api/payments/client-history?clienteId=pajarosenlacabeza', {
      headers: { 'x-kevdev-secret': 'kevdev_payments_sec_2026_key' },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      const payments = Array.isArray(data.payments) ? data.payments : [];
      const estadoPago = data.estadoPago || 'AL_DIA';

      if (estadoPago !== 'AL_DIA' || payments.some(p => !p.confirmed)) {
        if (overdueAlert) overdueAlert.style.display = 'block';
      } else {
        if (overdueAlert) overdueAlert.style.display = 'none';
      }

      if (payments.length === 0) {
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid #EBE7DF;">
            <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: #555;">2026-09-01</td>
            <td style="padding: 0.85rem 1.25rem; color: var(--color-text);">
              <strong>Paquete de desarrollo</strong>
              <div style="font-size: 0.78rem; color: #777; margin-top: 0.15rem;">Tienda online autogestionable & landing en vivo</div>
            </td>
            <td style="padding: 0.85rem 1.25rem; font-weight: 800; color: var(--color-text);">$ 60.000</td>
            <td style="padding: 0.85rem 1.25rem;">
              <span class="badge badge-magenta" style="font-size: 0.75rem; background: #FFF0F0; color: #CC0044; border: 1px solid #FFCCE0;">Pendiente</span>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #EBE7DF;">
            <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: #555;">2026-08-16</td>
            <td style="padding: 0.85rem 1.25rem; color: var(--color-text);">
              <strong>Plan mensual</strong>
              <div style="font-size: 0.78rem; color: #777; margin-top: 0.15rem;">Mantenimiento y hosting</div>
            </td>
            <td style="padding: 0.85rem 1.25rem; font-weight: 800; color: var(--color-text);">$ 33.000</td>
            <td style="padding: 0.85rem 1.25rem;">
              <span class="badge badge-yellow" style="font-size: 0.75rem; background: #E6F7ED; color: #008844; border: 1px solid #B3E6C8;">Confirmado</span>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = payments.map(p => `
          <tr style="border-bottom: 1px solid #EBE7DF;">
            <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: #555;">${p.date || '—'}</td>
            <td style="padding: 0.85rem 1.25rem; color: var(--color-text);">
              <strong>${p.concept || p.concepto || 'Cuota de Servicio'}</strong>
              ${p.details ? `<div style="font-size: 0.78rem; color: #777; margin-top: 0.15rem;">${p.details}</div>` : ''}
            </td>
            <td style="padding: 0.85rem 1.25rem; font-weight: 800; color: var(--color-text);">$ ${Number(p.amount || 0).toLocaleString('es-AR')}</td>
            <td style="padding: 0.85rem 1.25rem;">
              <span class="badge" style="font-size: 0.75rem; ${p.confirmed ? 'background: #E6F7ED; color: #008844; border: 1px solid #B3E6C8;' : 'background: #FFF0F0; color: #CC0044; border: 1px solid #FFCCE0;'}">
                ${p.confirmed ? 'Confirmado' : 'Pendiente'}
              </span>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('KevDev API fetch warning:', err);
    tbody.innerHTML = `
      <tr style="border-bottom: 1px solid #EBE7DF;">
        <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: #555;">2026-09-01</td>
        <td style="padding: 0.85rem 1.25rem; color: var(--color-text);">
          <strong>Paquete de desarrollo</strong>
        </td>
        <td style="padding: 0.85rem 1.25rem; font-weight: 800; color: var(--color-text);">$ 60.000</td>
        <td style="padding: 0.85rem 1.25rem;">
          <span class="badge badge-magenta" style="font-size: 0.75rem; background: #FFF0F0; color: #CC0044; border: 1px solid #FFCCE0;">Pendiente</span>
        </td>
      </tr>
    `;
  }
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
  setupHeroImageManager();
  setupConditionsAccordion();
  loadPlanData();
  checkAuthUI();

  subscribeToStore(() => {
    if (isAuthenticated()) {
      renderAllAdminData();
    }
  });
});
