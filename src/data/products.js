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

export const SHIPPING_RATES = [
  { region: "CABA (Capital Federal)", cost: 3500, time: "24 a 48 hs hábiles" },
  { region: "GBA (Gran Buenos Aires)", cost: 4800, time: "48 a 72 hs hábiles" },
  { region: "Provincia de Buenos Aires", cost: 6200, time: "3 a 5 días hábiles" },
  { region: "Córdoba / Santa Fe / Entre Ríos", cost: 6900, time: "3 a 5 días hábiles" },
  { region: "Mendoza / Cuyo / NOA", cost: 7800, time: "4 a 6 días hábiles" },
  { region: "Patagonia & Resto del País", cost: 8900, time: "5 a 7 días hábiles" }
];
