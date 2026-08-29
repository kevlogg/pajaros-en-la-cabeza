/* ==========================================================================
   PRODUCT & BUSINESS DATA - PÁJAROS EN LA CABEZA
   ========================================================================== */

export const BRAND_INFO = {
  name: "Pájaros en la Cabeza",
  tagline: "Ropa Personalizada con Asesoría de Imagen de Local",
  phone: "+54 9 11 5544-3322",
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

export const CATEGORIES = [
  {
    id: "ropa-personalizada",
    name: "Ropa Personalizada",
    subtitle: "Staff, Marcas & Locales",
    description: "Remeras, buzos y chaquetas con estampado o bordado de tu marca + Asesoría de imagen.",
    count: 12,
    badge: "Producto Estrella",
    image: "/assets/ropa_custom.png"
  },
  {
    id: "ropa-lisa",
    name: "Ropa Lisa",
    subtitle: "Básicos Premium",
    description: "Indumentaria lisa confeccionada en algodón peinado de alta densidad sin estampado.",
    count: 8,
    badge: "Calidad Premium",
    image: null,
    svgType: "hoodie_liso"
  },
  {
    id: "mochilas",
    name: "Mochilas",
    subtitle: "Urbanas & Notebook",
    description: "Mochilas reforzadas con compartimento acolchado para notebook y diseño urbano.",
    count: 5,
    badge: "Alta Durabilidad",
    image: null,
    svgType: "mochila"
  },
  {
    id: "rinoneras",
    name: "Riñoneras",
    subtitle: "Streetwear & Funcional",
    description: "Riñoneras urbanas ajustables con múltiples cierres y materiales impermeables.",
    count: 6,
    badge: "Tendencia",
    image: null,
    svgType: "rinonera"
  }
];

export const PRODUCTS = [
  {
    id: "prod-1",
    name: "Remera Personalizada Staff (Asesoría Incluida)",
    category: "ropa-personalizada",
    categoryLabel: "Ropa Personalizada",
    price: 18500,
    priceFormatted: "$18.500",
    image: "/assets/ropa_custom.png",
    advisoryIncluded: true,
    badge: "Más Vendido",
    badgeColor: "yellow",
    description: "Remera 100% Algodón Peinado 24/1 con estampado serigráfico o DTF de tu logo. Incluye revisión gráfica y paleta de colores para tu local.",
    specs: ["Algodón Peinado 24/1", "Estampado Frente o Espalda", "Talles XS al XXXL", "Asesoría Visual de Local Incluida"],
    colors: ["Negro", "Blanco", "Gris Topo"]
  },
  {
    id: "prod-2",
    name: "Buzo Hoodie Ropa Lisa Premium",
    category: "ropa-lisa",
    categoryLabel: "Ropa Lisa",
    price: 32000,
    priceFormatted: "$32.000",
    image: null,
    svgType: "hoodie_liso",
    advisoryIncluded: false,
    badge: "Frisado Fino",
    badgeColor: "magenta",
    description: "Buzo canguro con capucha y bolsillo, confeccionado en friza invisible de alta densidad. Sin marcas visibles, ideal para revender o usar liso.",
    specs: ["Friza de Algodón Premium", "Capucha Forrada con Cordon Ajustable", "Costuras Reforzadas", "Corte Unisex Oversize"],
    colors: ["Negro", "Gris Topo", "Blanco"]
  },
  {
    id: "prod-3",
    name: "Riñonera Urbana High-Durability",
    category: "rinoneras",
    categoryLabel: "Riñoneras",
    price: 14500,
    priceFormatted: "$14.500",
    image: null,
    svgType: "rinonera",
    advisoryIncluded: false,
    badge: "Impermeable",
    badgeColor: "yellow",
    description: "Riñonera streetwear de cordura reforzada con tira regulable de nylon de 40mm y broche acetal. Dos bolsillos independientes con cierre reforzado.",
    specs: ["Cordura 600D Impermeable", "Cierres YKK de Alta Calidad", "Capacidad 2.5 Litros", "Correa Ajustable hasta 130cm"],
    colors: ["Negro / Amarillo", "Negro / Magenta", "Total Black"]
  },
  {
    id: "prod-4",
    name: "Mochila Notebook Minimalist",
    category: "mochilas",
    categoryLabel: "Mochilas",
    price: 28900,
    priceFormatted: "$28.900",
    image: null,
    svgType: "mochila",
    advisoryIncluded: false,
    badge: "Porta Notebook 15.6\"",
    badgeColor: "black",
    description: "Mochila de diseño estructurado para uso diario o corporativo. Espalda acolchada antitranspirante y compartimento interno separado.",
    specs: ["Compartimento Notebook acolchado", "Bolsillo Antirrobo Posterior", "Repelente al agua", "Bolsillo lateral para botella"],
    colors: ["Gris Topo", "Negro"]
  },
  {
    id: "prod-5",
    name: "Campera Staff Personalizada con Brand Tag",
    category: "ropa-personalizada",
    categoryLabel: "Ropa Personalizada",
    price: 42000,
    priceFormatted: "$42.000",
    image: "/assets/hero_banner.png",
    advisoryIncluded: true,
    badge: "Asesoría de Marca",
    badgeColor: "magenta",
    description: "Campera universitaria / staff bordada o estampada en alta definición. Incluye diseño y confección de tarjetas y marquillas de tela para tu tienda.",
    specs: ["Confección Premium Heavyweight", "Bordado o Estampado de Alta Definición", "Diseño de Marquilla de Tela incluido", "Asesoría Integral de Local"],
    colors: ["Negro con Acentos Amarillos", "Negro con Acentos Magentas", "Gris Topo / Negro"]
  },
  {
    id: "prod-6",
    name: "Kit Indumentaria + Tarjetas para Local",
    category: "ropa-personalizada",
    categoryLabel: "Ropa Personalizada",
    price: 55000,
    priceFormatted: "$55.000",
    image: null,
    svgType: "kit_local",
    advisoryIncluded: true,
    badge: "Combo Completo",
    badgeColor: "yellow",
    description: "Pack integral para renovar la imagen de tu negocio: 3 Remeras Staff + 100 Tarjetas de Marca de 350g + Asesoría de paleta cromática de local.",
    specs: ["3 Remeras Personalizadas", "100 Tarjetas de Regalo / Presentación", "Asesoría en Imagen de Local", "Entrega lista para usar en tienda"],
    colors: ["Personalizado según tu marca"]
  }
];

export const SHIPPING_RATES = [
  { region: "CABA (Capital Federal)", cost: 3500, time: "24 a 48 hs hábiles" },
  { region: "GBA (Gran Buenos Aires)", cost: 4800, time: "48 a 72 hs hábiles" },
  { region: "Provincia de Buenos Aires", cost: 6200, time: "3 a 5 días hábiles" },
  { region: "Córdoba / Santa Fe / Entre Ríos", cost: 6900, time: "3 a 5 días hábiles" },
  { region: "Mendoza / Cuyo / NOA", cost: 7800, time: "4 a 6 días hábiles" },
  { region: "Patagonia & Resto del País", cost: 8900, time: "5 a 7 días hábiles" }
];
