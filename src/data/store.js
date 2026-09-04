/* ==========================================================================
   STORE PERSISTENCE & DATA MANAGEMENT - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { CATEGORIES as DEFAULT_CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS, BRAND_INFO, SHIPPING_RATES } from './products.js';

const STORAGE_KEY_PRODUCTS = 'pajaros_products_v1';
const STORAGE_KEY_CATEGORIES = 'pajaros_categories_v1';

// Initial state getters with localStorage caching
export function getCategories() {
  const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading categories from localStorage:', e);
    }
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
}

export function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
}

// Product CRUD Operations
export function addProduct(productData) {
  const products = getProducts();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: productData.name || 'Nuevo Producto',
    category: productData.category || 'ropa-personalizada',
    categoryLabel: productData.categoryLabel || 'Ropa Personalizada',
    price: Number(productData.price) || 0,
    priceFormatted: `$${Number(productData.price || 0).toLocaleString('es-AR')}`,
    image: productData.image || null,
    svgType: productData.svgType || 'hoodie_liso',
    advisoryIncluded: Boolean(productData.advisoryIncluded),
    badge: productData.badge || 'Nuevo',
    badgeColor: productData.badgeColor || 'yellow',
    description: productData.description || '',
    specs: productData.specs || ['Calidad Garantizada'],
    colors: productData.colors || ['Negro', 'Blanco']
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id, productData) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated = {
    ...products[index],
    ...productData,
    price: Number(productData.price),
    priceFormatted: `$${Number(productData.price).toLocaleString('es-AR')}`
  };

  products[index] = updated;
  saveProducts(products);
  return updated;
}

export function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
  return filtered;
}

// Category CRUD Operations
export function addCategory(catData) {
  const categories = getCategories();
  const newCat = {
    id: catData.id || `cat-${Date.now()}`,
    name: catData.name || 'Nueva Categoría',
    subtitle: catData.subtitle || 'Subtítulo',
    description: catData.description || '',
    count: Number(catData.count) || 0,
    badge: catData.badge || 'Categoría',
    image: catData.image || null,
    svgType: catData.svgType || 'hoodie_liso'
  };

  categories.push(newCat);
  saveCategories(categories);
  return newCat;
}

export function updateCategory(id, catData) {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updated = { ...categories[index], ...catData };
  categories[index] = updated;
  saveCategories(categories);
  return updated;
}

export function deleteCategory(id) {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  saveCategories(filtered);
  return filtered;
}

// Reset catalog to initial hardcoded state
export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return { categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS };
}

export { BRAND_INFO, SHIPPING_RATES };
