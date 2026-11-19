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
import { BRAND_INFO, SHIPPING_RATES, ARGENTINA_PROVINCES } from './products.js';
import { INITIAL_TEMPLATES } from './templates.js';

const STORAGE_KEY_PRODUCTS = 'pajaros_products_v1';
const STORAGE_KEY_CATEGORIES = 'pajaros_categories_v1';
const STORAGE_KEY_HERO_IMAGE = 'pajaros_hero_image_v1';
const STORAGE_KEY_PROMO = 'pajaros_promo_bar_v1';
const STORAGE_KEY_GALLERY = 'pajaros_gallery_v1';
const STORAGE_KEY_TEMPLATES = 'pajaros_templates_v1';

const DEFAULT_HERO_IMAGE = '/assets/hero_banner.png';
export const DEFAULT_PROMO_BAR = {
  enabled: true,
  badge: '🔥 PROMO DEL MES',
  text: '15% OFF en prendas personalizadas llevando 3 o más unidades + Asesoría de imagen bonificada',
  linkText: 'Aprovechar Promo 🛍️',
  linkUrl: '/tienda',
  bgColor: 'yellow', // 'yellow', 'magenta', 'black', 'white'
  speed: 'normal'     // 'normal', 'fast', 'slow', 'static'
};

const productsCollectionRef = collection(db, 'products');
const categoriesCollectionRef = collection(db, 'categories');
const heroDocRef = doc(db, 'settings', 'hero');
const promoDocRef = doc(db, 'settings', 'promo');
const galleryCollectionRef = collection(db, 'gallery');
const templatesCollectionRef = collection(db, 'templates');

let cachedProducts = [];
let cachedCategories = [];
let cachedHeroImage = DEFAULT_HERO_IMAGE;
let cachedPromoBar = { ...DEFAULT_PROMO_BAR };
let cachedGallery = [];
let cachedTemplates = [...INITIAL_TEMPLATES];
const subscribers = [];

// Initialize local cache from localStorage
try {
  const savedProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  const savedHero = localStorage.getItem(STORAGE_KEY_HERO_IMAGE);
  const savedPromo = localStorage.getItem(STORAGE_KEY_PROMO);
  const savedGallery = localStorage.getItem(STORAGE_KEY_GALLERY);
  const savedTemplates = localStorage.getItem(STORAGE_KEY_TEMPLATES);

  cachedProducts = savedProds ? JSON.parse(savedProds) : [];
  cachedCategories = savedCats ? JSON.parse(savedCats) : [];
  cachedHeroImage = savedHero || DEFAULT_HERO_IMAGE;
  cachedPromoBar = savedPromo ? { ...DEFAULT_PROMO_BAR, ...JSON.parse(savedPromo) } : { ...DEFAULT_PROMO_BAR };
  cachedGallery = savedGallery ? JSON.parse(savedGallery) : [];
  cachedTemplates = savedTemplates ? JSON.parse(savedTemplates) : [...INITIAL_TEMPLATES];
} catch (e) {
  cachedProducts = [];
  cachedCategories = [];
  cachedHeroImage = DEFAULT_HERO_IMAGE;
  cachedPromoBar = { ...DEFAULT_PROMO_BAR };
  cachedGallery = [];
  cachedTemplates = [...INITIAL_TEMPLATES];
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
    try { 
      cb({ 
        products: cachedProducts, 
        categories: cachedCategories, 
        heroImage: cachedHeroImage, 
        promoBar: cachedPromoBar,
        gallery: cachedGallery,
        templates: cachedTemplates,
        firestoreStatus: getFirestoreStatus() 
      }); 
    } catch(err){}
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

  onSnapshot(promoDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      cachedPromoBar = { ...DEFAULT_PROMO_BAR, ...data };
      localStorage.setItem(STORAGE_KEY_PROMO, JSON.stringify(cachedPromoBar));
      notifySubscribers();
    }
  }, (err) => {
    console.warn('Firestore promo bar snapshot error:', err);
  });

  onSnapshot(galleryCollectionRef, (snapshot) => {
    const items = [];
    snapshot.forEach(docSnap => items.push({ id: docSnap.id, ...docSnap.data() }));
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    cachedGallery = items;
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(items));
    notifySubscribers();
  }, (err) => {
    console.warn('Firestore gallery snapshot error:', err);
  });

  onSnapshot(templatesCollectionRef, (snapshot) => {
    const tpls = [];
    snapshot.forEach(docSnap => tpls.push({ id: docSnap.id, ...docSnap.data() }));
    if (tpls.length > 0) {
      cachedTemplates = tpls;
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(tpls));
      notifySubscribers();
    }
  }, (err) => {
    console.warn('Firestore templates snapshot error:', err);
  });
} catch (e) {
  isFirestoreConnected = false;
  firestoreErrorNotice = 'Falló inicialización de Firestore: ' + (e.message || e);
  console.warn('Firestore initialization fallback to LocalStorage:', e);
}

// Format File Size Helper
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

export function getPromoBar() {
  return cachedPromoBar || { ...DEFAULT_PROMO_BAR };
}

export function getGalleryImages() {
  return cachedGallery;
}

export function getTemplates() {
  return cachedTemplates;
}

export function getTemplateById(id) {
  return cachedTemplates.find(t => t.id === id) || cachedTemplates[0];
}

export async function addTemplate(tplData) {
  const tplId = tplData.id || `tpl-${Date.now()}`;
  const newTemplate = {
    id: tplId,
    name: tplData.name || 'Nueva Plantilla',
    subtitle: tplData.subtitle || 'Regalo rápido personalizable',
    category: tplData.category || 'parejas',
    categoryLabel: tplData.categoryLabel || 'Parejas & Amor',
    badge: tplData.badge || 'Nuevo',
    badgeColor: tplData.badgeColor || 'yellow',
    description: tplData.description || '',
    basePrice: Number(tplData.basePrice) || 19500,
    hasPhoto: Boolean(tplData.hasPhoto),
    photoAspect: tplData.photoAspect || 'square',
    defaultProduct: tplData.defaultProduct || 'remera',
    allowedProducts: tplData.allowedProducts || ['remera', 'hoodie', 'taza', 'totebag'],
    fields: tplData.fields || [
      { id: 'names', label: 'Texto Principal', placeholder: 'Escribe aquí...', defaultValue: 'Texto Personalizado', maxLength: 35 }
    ],
    designStyle: tplData.designStyle || 'polaroid'
  };

  cachedTemplates.unshift(newTemplate);
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(cachedTemplates));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'templates', tplId), newTemplate);
  } catch (err) {
    console.warn('Firestore template write error:', err);
  }

  return newTemplate;
}

export async function updateTemplate(id, tplData) {
  const index = cachedTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;

  const updated = {
    ...cachedTemplates[index],
    ...tplData,
    basePrice: Number(tplData.basePrice) || cachedTemplates[index].basePrice
  };

  cachedTemplates[index] = updated;
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(cachedTemplates));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'templates', id), updated);
  } catch (err) {
    console.warn('Firestore template update error:', err);
  }

  return updated;
}

export async function deleteTemplate(id) {
  cachedTemplates = cachedTemplates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(cachedTemplates));
  notifySubscribers();

  try {
    await deleteDoc(doc(db, 'templates', id));
  } catch (err) {
    console.warn('Firestore template delete error:', err);
  }

  return cachedTemplates;
}

export function resetTemplatesToDefault() {
  cachedTemplates = [...INITIAL_TEMPLATES];
  localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(cachedTemplates));
  notifySubscribers();
  return cachedTemplates;
}

export async function addGalleryImage(imageData) {
  const imgId = `gal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const newImage = {
    id: imgId,
    name: imageData.name || 'Foto de Galería',
    url: imageData.url,
    size: imageData.size || 0,
    sizeFormatted: imageData.sizeFormatted || (imageData.size ? formatFileSize(imageData.size) : 'Web'),
    createdAt: new Date().toISOString()
  };

  cachedGallery.unshift(newImage);
  localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(cachedGallery));
  notifySubscribers();

  try {
    await setDoc(doc(db, 'gallery', imgId), newImage);
  } catch (err) {
    console.warn('Firestore addGalleryImage error:', err);
  }

  return newImage;
}

export async function deleteGalleryImage(id) {
  cachedGallery = cachedGallery.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(cachedGallery));
  notifySubscribers();

  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (err) {
    console.warn('Firestore deleteGalleryImage error:', err);
  }

  return cachedGallery;
}

export async function setPromoBar(promoData) {
  const updated = {
    ...DEFAULT_PROMO_BAR,
    ...promoData,
    updatedAt: new Date().toISOString()
  };
  cachedPromoBar = updated;
  localStorage.setItem(STORAGE_KEY_PROMO, JSON.stringify(updated));
  notifySubscribers();

  try {
    await setDoc(promoDocRef, updated);
  } catch (err) {
    console.warn('Firestore setPromoBar error:', err);
  }

  return updated;
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
    templates: cachedTemplates,
    heroImage: cachedHeroImage,
    promoBar: cachedPromoBar,
    gallery: cachedGallery
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
    if (parsed.templates && Array.isArray(parsed.templates)) cachedTemplates = parsed.templates;
    if (parsed.heroImage) cachedHeroImage = parsed.heroImage;
    if (parsed.promoBar) cachedPromoBar = { ...DEFAULT_PROMO_BAR, ...parsed.promoBar };
    if (parsed.gallery) cachedGallery = parsed.gallery;

    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cachedCategories));
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(cachedProducts));
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(cachedTemplates));
    localStorage.setItem(STORAGE_KEY_HERO_IMAGE, cachedHeroImage);
    localStorage.setItem(STORAGE_KEY_PROMO, JSON.stringify(cachedPromoBar));
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(cachedGallery));
    notifySubscribers();

    // Sync imported data to Firestore if available
    try {
      for (const cat of cachedCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const prod of cachedProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      if (cachedTemplates && cachedTemplates.length > 0) {
        for (const tpl of cachedTemplates) {
          await setDoc(doc(db, 'templates', tpl.id), tpl);
        }
      }
      if (cachedHeroImage) {
        await setDoc(heroDocRef, { url: cachedHeroImage, updatedAt: new Date().toISOString() });
      }
      if (cachedPromoBar) {
        await setDoc(promoDocRef, cachedPromoBar);
      }
      if (cachedGallery && cachedGallery.length > 0) {
        for (const img of cachedGallery) {
          await setDoc(doc(db, 'gallery', img.id), img);
        }
      }
    } catch (fsErr) {
      console.warn('Firestore sync warning during import:', fsErr);
    }

    return { success: true, countCategories: cachedCategories.length, countProducts: cachedProducts.length, countTemplates: cachedTemplates.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * AI Settings Management (Gemini / OpenAI API Key)
 */
export async function getAISettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'ai'));
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.apiKey) {
        localStorage.setItem('pajaros_ai_key', data.apiKey);
        return data;
      }
    }
  } catch (e) {
    // ignore
  }
  const localKey = localStorage.getItem('pajaros_ai_key');
  return localKey ? { apiKey: localKey } : null;
}

export async function saveAISettings(apiKey, provider = 'gemini') {
  if (apiKey) {
    localStorage.setItem('pajaros_ai_key', apiKey.trim());
  } else {
    localStorage.removeItem('pajaros_ai_key');
  }

  try {
    await setDoc(doc(db, 'settings', 'ai'), {
      apiKey: apiKey ? apiKey.trim() : '',
      provider,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Could not save AI settings to Firestore:', e);
  }
}

export { BRAND_INFO, SHIPPING_RATES, ARGENTINA_PROVINCES };
