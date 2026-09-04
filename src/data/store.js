/* ==========================================================================
   STORE PERSISTENCE WITH FIREBASE FIRESTORE & STORAGE - PÁJAROS EN LA CABEZA
   ========================================================================== */

import { db, storage } from './firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { CATEGORIES as DEFAULT_CATEGORIES, PRODUCTS as DEFAULT_PRODUCTS, BRAND_INFO, SHIPPING_RATES } from './products.js';

const STORAGE_KEY_PRODUCTS = 'pajaros_products_v1';
const STORAGE_KEY_CATEGORIES = 'pajaros_categories_v1';

const productsCollectionRef = collection(db, 'products');
const categoriesCollectionRef = collection(db, 'categories');

let cachedProducts = [];
let cachedCategories = [];
const subscribers = [];

// Initialize local cache from localStorage
try {
  const savedProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);

  cachedProducts = savedProds ? JSON.parse(savedProds) : DEFAULT_PRODUCTS;
  cachedCategories = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;
} catch (e) {
  cachedProducts = DEFAULT_PRODUCTS;
  cachedCategories = DEFAULT_CATEGORIES;
}

// Function to notify subscribed views (landing page, admin panel)
function notifySubscribers() {
  subscribers.forEach(cb => {
    try { cb({ products: cachedProducts, categories: cachedCategories }); } catch(err){}
  });
}

export function subscribeToStore(callback) {
  if (typeof callback === 'function') {
    subscribers.push(callback);
  }
}

// Seed initial default data to Firestore if collection is empty
async function seedInitialDataIfEmpty() {
  try {
    const prodSnapshot = await getDocs(productsCollectionRef);
    if (prodSnapshot.empty) {
      console.log('Seeding initial products to Firebase Firestore...');
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    const catSnapshot = await getDocs(categoriesCollectionRef);
    if (catSnapshot.empty) {
      console.log('Seeding initial categories to Firebase Firestore...');
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }
  } catch (err) {
    console.warn('Firestore seed warning (verify Security Rules in console):', err);
  }
}

// Listen to Firestore real-time updates
try {
  onSnapshot(productsCollectionRef, (snapshot) => {
    if (!snapshot.empty) {
      const prods = [];
      snapshot.forEach(docSnap => prods.push({ id: docSnap.id, ...docSnap.data() }));
      cachedProducts = prods;
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
      notifySubscribers();
    } else {
      seedInitialDataIfEmpty();
    }
  }, (err) => {
    console.warn('Firestore products snapshot error:', err);
  });

  onSnapshot(categoriesCollectionRef, (snapshot) => {
    if (!snapshot.empty) {
      const cats = [];
      snapshot.forEach(docSnap => cats.push({ id: docSnap.id, ...docSnap.data() }));
      cachedCategories = cats;
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
      notifySubscribers();
    } else {
      seedInitialDataIfEmpty();
    }
  }, (err) => {
    console.warn('Firestore categories snapshot error:', err);
  });
} catch (e) {
  console.warn('Firestore initialization fallback to LocalStorage:', e);
}

// Getters
export function getCategories() {
  return cachedCategories.length > 0 ? cachedCategories : DEFAULT_CATEGORIES;
}

export function getProducts() {
  return cachedProducts.length > 0 ? cachedProducts : DEFAULT_PRODUCTS;
}

// Image Upload to Firebase Storage
export async function uploadImageToFirebase(file) {
  if (!file) return null;
  const fileName = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// Product CRUD Operations
export async function addProduct(productData) {
  const prodId = `prod-${Date.now()}`;
  const newProduct = {
    id: prodId,
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

  cachedProducts.unshift(newProduct);
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cachedProducts));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'products', prodId), newProduct);
  } catch (err) {
    console.warn('Firestore write error (verify rules allow write):', err);
  }

  return newProduct;
}

export async function updateProduct(id, productData) {
  const index = cachedProducts.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated = {
    ...cachedProducts[index],
    ...productData,
    price: Number(productData.price),
    priceFormatted: `$${Number(productData.price).toLocaleString('es-AR')}`
  };

  cachedProducts[index] = updated;
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cachedProducts));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'products', id), updated);
  } catch (err) {
    console.warn('Firestore update error:', err);
  }

  return updated;
}

export async function deleteProduct(id) {
  cachedProducts = cachedProducts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cachedProducts));
  notifySubscribers();

  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }

  return cachedProducts;
}

// Category CRUD Operations
export async function addCategory(catData) {
  const catId = catData.id || `cat-${Date.now()}`;
  const newCat = {
    id: catId,
    name: catData.name || 'Nueva Categoría',
    subtitle: catData.subtitle || 'Colección',
    description: catData.description || '',
    count: Number(catData.count) || 0,
    badge: catData.badge || 'Categoría',
    image: catData.image || null,
    svgType: catData.svgType || 'hoodie_liso'
  };

  cachedCategories.push(newCat);
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cachedCategories));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'categories', catId), newCat);
  } catch (err) {
    console.warn('Firestore category write error:', err);
  }

  return newCat;
}

export async function updateCategory(id, catData) {
  const index = cachedCategories.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updated = { ...cachedCategories[index], ...catData };
  cachedCategories[index] = updated;
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cachedCategories));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'categories', id), updated);
  } catch (err) {
    console.warn('Firestore category update error:', err);
  }

  return updated;
}

export async function deleteCategory(id) {
  cachedCategories = cachedCategories.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cachedCategories));
  notifySubscribers();

  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    console.warn('Firestore category delete error:', err);
  }

  return cachedCategories;
}

export function resetToDefaults() {
  cachedCategories = DEFAULT_CATEGORIES;
  cachedProducts = DEFAULT_PRODUCTS;
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  notifySubscribers();
  return { categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS };
}

export { BRAND_INFO, SHIPPING_RATES };
