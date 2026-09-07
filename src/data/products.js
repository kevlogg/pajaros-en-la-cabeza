/* ==========================================================================
   PRODUCT & BUSINESS DATA - PÁJAROS EN LA CABEZA
   ========================================================================== */

export const BRAND_INFO = {
  name: "Pájaros en la Cabeza",
  tagline: "Ropa Personalizada con Asesoría de Imagen de Local",
  phone: "+54 9 3517 62-0847",
  email: "contacto@pajarosenlacabeza.com.ar",
  address: "Showroom & Atelier - Buenos Aires, Argentina",
  payments: [
    { name: "Transferencia Bancaria", badge: "Directo", discount: "10% OFF", icon: "bank" },
    { name: "Efectivo (Eft)", badge: "En Local / Entrega", discount: "15% OFF", icon: "cash" },
    { name: "Mercado Pago", badge: "Crédito 1 pago", discount: "Cuotas disponible", icon: "card" }
  ],
  shipping: {
    note: "Envíos a todo el país (con cargo al comprador)",
    carriers: ["Correo Argentino", "Andreani", "Vía Cargo", "Mensajería Express CABA/GBA"]
  }
};

export const CATEGORIES = [];

export const PRODUCTS = [];

export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires (CABA)",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
];

export const SHIPPING_RATES = ARGENTINA_PROVINCES.map(prov => ({ region: prov }));
