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
import { BRAND_INFO, SHIPPING_RATES } from './products.js';

const STORAGE_KEY_PRODUCTS = 'pajaros_products_v1';
const STORAGE_KEY_CATEGORIES = 'pajaros_categories_v1';
const STORAGE_KEY_HERO_IMAGE = 'pajaros_hero_image_v1';

const DEFAULT_HERO_IMAGE = '/assets/hero_banner.png';

const productsCollectionRef = collection(db, 'products');
const categoriesCollectionRef = collection(db, 'categories');
const heroDocRef = doc(db, 'settings', 'hero');

let cachedProducts = [];
let cachedCategories = [];
let cachedHeroImage = DEFAULT_HERO_IMAGE;
const subscribers = [];

// Initialize local cache from localStorage
try {
  const savedProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  const savedHero = localStorage.getItem(STORAGE_KEY_HERO_IMAGE);

  cachedProducts = savedProds ? JSON.parse(savedProds) : [];
  cachedCategories = savedCats ? JSON.parse(savedCats) : [];
  cachedHeroImage = savedHero || DEFAULT_HERO_IMAGE;
} catch (e) {
  cachedProducts = [];
  cachedCategories = [];
  cachedHeroImage = DEFAULT_HERO_IMAGE;
}

let isFirestoreConnected = false;
let firestoreErrorNotice = null;

export function getFirestoreStatus() {
  return {
    connected: isFirestoreConnected,
    error: firestoreErrorNotice
  };
}

// Function to notify subscribed views (landing page, admin panel)
function notifySubscribers() {
  subscribers.forEach(cb => {
    try { cb({ products: cachedProducts, categories: cachedCategories, heroImage: cachedHeroImage, firestoreStatus: getFirestoreStatus() }); } catch(err){}
  });
}

export function subscribeToStore(callback) {
  if (typeof callback === 'function') {
    subscribers.push(callback);
  }
}

// Listen to Firestore real-time updates
try {
  onSnapshot(productsCollectionRef, (snapshot) => {
    isFirestoreConnected = true;
    firestoreErrorNotice = null;
    const prods = [];
    snapshot.forEach(docSnap => prods.push({ id: docSnap.id, ...docSnap.data() }));
    cachedProducts = prods;
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
    notifySubscribers();
  }, (err) => {
    isFirestoreConnected = false;
    firestoreErrorNotice = err.code === 'permission-denied' 
      ? 'Permiso denegado en Firebase Firestore. Revisa las reglas de seguridad en la consola de Firebase.' 
      : (err.message || 'Error de conexión con Firebase');
    console.warn('Firestore products snapshot error:', err);
    notifySubscribers();
  });

  onSnapshot(categoriesCollectionRef, (snapshot) => {
    isFirestoreConnected = true;
    firestoreErrorNotice = null;
    const cats = [];
    snapshot.forEach(docSnap => cats.push({ id: docSnap.id, ...docSnap.data() }));
    cachedCategories = cats;
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
    notifySubscribers();
  }, (err) => {
    isFirestoreConnected = false;
    firestoreErrorNotice = err.code === 'permission-denied' 
      ? 'Permiso denegado en Firebase Firestore. Revisa las reglas de seguridad en la consola de Firebase.' 
      : (err.message || 'Error de conexión con Firebase');
    console.warn('Firestore categories snapshot error:', err);
    notifySubscribers();
  });

  onSnapshot(heroDocRef, (docSnap) => {
    if (docSnap.exists() && docSnap.data().url) {
      cachedHeroImage = docSnap.data().url;
      localStorage.setItem(STORAGE_KEY_HERO_IMAGE, cachedHeroImage);
      notifySubscribers();
    }
  }, (err) => {
    console.warn('Firestore hero image snapshot error:', err);
  });
} catch (e) {
  isFirestoreConnected = false;
  firestoreErrorNotice = 'Falló inicialización de Firestore: ' + (e.message || e);
  console.warn('Firestore initialization fallback to LocalStorage:', e);
}

// Getters
export function getCategories() {
  return cachedCategories;
}

export function getProducts() {
  return cachedProducts;
}

export function getHeroImage() {
  return cachedHeroImage || DEFAULT_HERO_IMAGE;
}

export async function setHeroImage(url) {
  const newUrl = url || DEFAULT_HERO_IMAGE;
  cachedHeroImage = newUrl;
  localStorage.setItem(STORAGE_KEY_HERO_IMAGE, newUrl);
  notifySubscribers();

  try {
    await setDoc(heroDocRef, { url: newUrl, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore setHeroImage error:', err);
  }

  return newUrl;
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
  const imagesList = Array.isArray(productData.images) && productData.images.length > 0 
    ? productData.images 
    : (productData.image ? [productData.image] : []);

  const newProduct = {
    id: prodId,
    name: productData.name || 'Nuevo Producto',
    category: productData.category || 'ropa-personalizada',
    categoryLabel: productData.categoryLabel || 'Ropa Personalizada',
    price: Number(productData.price) || 0,
    priceFormatted: `$${Number(productData.price || 0).toLocaleString('es-AR')}`,
    image: imagesList[0] || null,
    images: imagesList,
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

  const currentProduct = cachedProducts[index];
  const imagesList = Array.isArray(productData.images) 
    ? productData.images 
    : (productData.image ? [productData.image] : currentProduct.images || (currentProduct.image ? [currentProduct.image] : []));

  const updated = {
    ...currentProduct,
    ...productData,
    price: Number(productData.price),
    priceFormatted: `$${Number(productData.price).toLocaleString('es-AR')}`,
    images: imagesList,
    image: imagesList[0] || productData.image || currentProduct.image || null
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
  cachedCategories = [];
  cachedProducts = [];
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
  notifySubscribers();
  return { categories: [], products: [] };
}

export function exportStoreData() {
  return JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    categories: cachedCategories,
    products: cachedProducts,
    heroImage: cachedHeroImage
  }, null, 2);
}

export async function importStoreData(jsonContent) {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed.categories || !parsed.products) {
      throw new Error('Formato de archivo inválido. Se requieren categorías y productos.');
    }
    
    cachedCategories = parsed.categories;
    cachedProducts = parsed.products;
    if (parsed.heroImage) cachedHeroImage = parsed.heroImage;

    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cachedCategories));
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cachedProducts));
    localStorage.setItem(STORAGE_KEY_HERO_IMAGE, cachedHeroImage);
    notifySubscribers();

    // Sync imported data to Firestore if available
    try {
      for (const cat of cachedCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const prod of cachedProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      if (cachedHeroImage) {
        await setDoc(heroDocRef, { url: cachedHeroImage, updatedAt: new Date().toISOString() });
      }
    } catch (fsErr) {
      console.warn('Firestore sync warning during import:', fsErr);
    }

    return { success: true, countCategories: cachedCategories.length, countProducts: cachedProducts.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export { BRAND_INFO, SHIPPING_RATES };
