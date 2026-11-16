/* ==========================================================================
   TEMPLATES & QUICK GIFTS DATA - PÁJAROS EN LA CABEZA
   ========================================================================== */

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Todas las Ocasiones', emoji: '✨' },
  { id: 'parejas', name: 'Parejas & Amor', emoji: '❤️' },
  { id: 'cumpleanos', name: 'Cumpleaños', emoji: '🎂' },
  { id: 'mascotas', name: 'Mascotas', emoji: '🐾' },
  { id: 'amistad', name: 'Amistad & Squad', emoji: '🤝' },
  { id: 'urbano', name: 'Música & Urbano', emoji: '🎧' },
  { id: 'familia', name: 'Familia & Fechas', emoji: '🏆' }
];

export const TEMPLATE_PRODUCTS = {
  remera: {
    id: 'remera',
    name: 'Remera Algodón 24/1 Premium',
    basePrice: 19500,
    colors: [
      { id: 'negro', name: 'Negro Profundo', hex: '#121212', textInvert: true },
      { id: 'blanco', name: 'Blanco Puro', hex: '#F9F9F9', textInvert: false },
      { id: 'gris', name: 'Gris Melange', hex: '#B8B8B8', textInvert: false },
      { id: 'rosa', name: 'Rosa Pastel', hex: '#F5C6D0', textInvert: false }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  hoodie: {
    id: 'hoodie',
    name: 'Buzo Hoodie Frisa Pesada',
    basePrice: 34000,
    colors: [
      { id: 'negro', name: 'Negro Profundo', hex: '#121212', textInvert: true },
      { id: 'blanco', name: 'Blanco Crudo', hex: '#F6F5F0', textInvert: false },
      { id: 'beige', name: 'Arena / Beige', hex: '#D6C8B2', textInvert: false }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  taza: {
    id: 'taza',
    name: 'Taza Cerámica Premium',
    basePrice: 9500,
    colors: [
      { id: 'blanco', name: 'Blanco Brillo', hex: '#FFFFFF', textInvert: false }
    ],
    sizes: ['Único (330ml)']
  },
  totebag: {
    id: 'totebag',
    name: 'Totebag Lienzo Algodón',
    basePrice: 13500,
    colors: [
      { id: 'crudo', name: 'Lienzo Natural', hex: '#EBE3D5', textInvert: false },
      { id: 'negro', name: 'Negro Profundo', hex: '#121212', textInvert: true }
    ],
    sizes: ['Único (40x40 cm)']
  }
};

export const INITIAL_TEMPLATES = [
  {
    id: 'tpl-polaroid-love',
    name: 'Marco Polaroid "Nuestra Historia"',
    subtitle: 'El regalo más romántico para aniversarios y parejas',
    category: 'parejas',
    categoryLabel: 'Parejas & Amor',
    badge: 'Más Vendido 🔥',
    badgeColor: 'magenta',
    description: 'Diseño estilo foto instantánea Polaroid con prendedor de corazón, nombres en caligrafía y fecha o dedicatoria personalizada.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'square',
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'names',
        label: 'Nombres de la pareja',
        placeholder: 'Ej: Sofía & Lucas',
        defaultValue: 'Sofía & Lucas',
        maxLength: 35
      },
      {
        id: 'date',
        label: 'Fecha o dedicatoria corta',
        placeholder: 'Ej: 14 . 02 . 2023 // Por siempre',
        defaultValue: '14 . 02 . 2023 // Nuestro Día',
        maxLength: 40
      }
    ],
    designStyle: 'polaroid'
  },
  {
    id: 'tpl-music-player',
    name: 'Reproductor "Nuestra Canción"',
    subtitle: 'La estética de streaming de Spotify con tu foto favorita',
    category: 'urbano',
    categoryLabel: 'Música & Urbano',
    badge: 'Tendencia 🎵',
    badgeColor: 'yellow',
    description: 'Convierte esa canción que define su historia en una prenda o taza única. Con portada personalizada, barra de progreso y minutos especiales.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'square',
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'songTitle',
        label: 'Título de la canción',
        placeholder: 'Ej: Golden Hour / Mi Lugar Seguro',
        defaultValue: 'Golden Hour',
        maxLength: 30
      },
      {
        id: 'artistName',
        label: 'Artista o Dedicatoria',
        placeholder: 'Ej: JVKE // Para vos',
        defaultValue: 'Para la persona más especial',
        maxLength: 35
      },
      {
        id: 'playbackTime',
        label: 'Tiempo o Fecha (mm:ss)',
        placeholder: 'Ej: 02:45 / 03:30',
        defaultValue: '02:45 ━━━━●───── 03:30',
        maxLength: 25
      }
    ],
    designStyle: 'music_player'
  },
  {
    id: 'tpl-birthday-vintage',
    name: 'Vintage Year "Edición Limitada"',
    subtitle: 'El clásico atemporal para celebrar un nuevo año de vida',
    category: 'cumpleanos',
    categoryLabel: 'Cumpleaños',
    badge: 'Cumpleaños 🎉',
    badgeColor: 'yellow',
    description: 'Estilo universitario varsity con año gigante, nombre del agasajado y la frase "Aged to Perfection / Original Quality". ¡No requiere foto!',
    basePrice: 18500,
    hasPhoto: false,
    photoAspect: null,
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'birthYear',
        label: 'Año de nacimiento',
        placeholder: 'Ej: 1998',
        defaultValue: '1998',
        maxLength: 4
      },
      {
        id: 'honoreeName',
        label: 'Nombre o Apodo',
        placeholder: 'Ej: JULIETA',
        defaultValue: 'JULIETA',
        maxLength: 22
      },
      {
        id: 'legend',
        label: 'Frase o Leyenda inferior',
        placeholder: 'Ej: AGED TO PERFECTION • EDICIÓN LIMITADA',
        defaultValue: 'AGED TO PERFECTION • EDICIÓN LIMITADA',
        maxLength: 45
      }
    ],
    designStyle: 'vintage_year'
  },
  {
    id: 'tpl-pet-portrait',
    name: 'Pet Badge "The Good Boy"',
    subtitle: 'Ríndele homenaje a tu mejor amigo de cuatro patas',
    category: 'mascotas',
    categoryLabel: 'Mascotas',
    badge: 'Favorito Mascotas 🐾',
    badgeColor: 'magenta',
    description: 'Emblema ilustrado con recuadro circular para la foto de tu perro, gato o mascota, acompañado de huellitas y cinta con su nombre.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'circle',
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'petName',
        label: 'Nombre de la Mascota',
        placeholder: 'Ej: SIMÓN / LOLA',
        defaultValue: 'SIMÓN',
        maxLength: 20
      },
      {
        id: 'petTitle',
        label: 'Frase o Título honorífico',
        placeholder: 'Ej: EL REY DE LA CASA • 100% AMOR',
        defaultValue: 'EL REY DE LA CASA • 100% AMOR',
        maxLength: 40
      }
    ],
    designStyle: 'pet_badge'
  },
  {
    id: 'tpl-bff-squad',
    name: 'Partners in Crime "Best Friends"',
    subtitle: 'Para celebrar esa amistad incondicional a prueba de todo',
    category: 'amistad',
    categoryLabel: 'Amistad & Squad',
    badge: 'Amistad 🤝',
    badgeColor: 'black',
    description: 'Estilo editorial neo-brutalista con doble marco, foto de las dos personas y tipografía de alto contraste.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'portrait',
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'squadNames',
        label: 'Nombres o Apodos',
        placeholder: 'Ej: VALE & MARTU',
        defaultValue: 'VALE & MARTU',
        maxLength: 30
      },
      {
        id: 'squadPhrase',
        label: 'Frase o año de amistad',
        placeholder: 'Ej: PARTNERS IN CRIME • SINCE 2017',
        defaultValue: 'PARTNERS IN CRIME • SINCE 2018',
        maxLength: 40
      }
    ],
    designStyle: 'editorial_bff'
  },
  {
    id: 'tpl-super-dad-mom',
    name: 'Trofeo "Número 1 del Mundo"',
    subtitle: 'El regalo definitivo para mamá, papá, abuelos o mentores',
    category: 'familia',
    categoryLabel: 'Familia & Fechas',
    badge: 'Día Especial 🏆',
    badgeColor: 'yellow',
    description: 'Diseño con corona / trofeo de campeón, foto familiar o individual y dedicatoria cariñosa con los nombres de quienes regalan.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'square',
    defaultProduct: 'taza',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'honoree',
        label: '¿Para quién es?',
        placeholder: 'Ej: EL MEJOR PAPÁ DEL MUNDO',
        defaultValue: 'EL MEJOR PAPÁ DEL MUNDO',
        maxLength: 35
      },
      {
        id: 'fromWho',
        label: 'Dedicatoria / De parte de quién',
        placeholder: 'Ej: Gracias por todo • Mateo y Camila',
        defaultValue: 'Gracias por enseñarnos tanto • Con amor',
        maxLength: 45
      }
    ],
    designStyle: 'award_badge'
  },
  {
    id: 'tpl-minimalist-initials',
    name: 'Iniciales Minimalistas + Coordenadas',
    subtitle: 'Elegancia sutil y estética limpia para parejas y amigos',
    category: 'parejas',
    categoryLabel: 'Parejas & Amor',
    badge: 'Minimalista ✨',
    badgeColor: 'black',
    description: 'Tipografía serif moderna con monograma de iniciales, corazón bordado visual y fecha en números o romanos. Perfecto en el centro o pecho.',
    basePrice: 18500,
    hasPhoto: false,
    photoAspect: null,
    defaultProduct: 'hoodie',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'monogram',
        label: 'Iniciales (con corazón o símbolo)',
        placeholder: 'Ej: M ♥ J',
        defaultValue: 'M ♥ J',
        maxLength: 12
      },
      {
        id: 'subDate',
        label: 'Fecha o Números',
        placeholder: 'Ej: 20 . 11 . 2021',
        defaultValue: '20 . 11 . 2021',
        maxLength: 25
      },
      {
        id: 'location',
        label: 'Lugar o Frase corta',
        placeholder: 'Ej: Córdoba, Argentina',
        defaultValue: 'Donde todo empezó ✨',
        maxLength: 35
      }
    ],
    designStyle: 'minimalist_monogram'
  },
  {
    id: 'tpl-birthday-star',
    name: 'Birthday Star "Party Edition"',
    subtitle: 'El centro de atención absoluto para la fiesta de cumpleaños',
    category: 'cumpleanos',
    categoryLabel: 'Cumpleaños',
    badge: 'Cumpleañero/a 👑',
    badgeColor: 'magenta',
    description: 'Colores vibrantes, corona festiva, recuadro de foto y letrero pop art para el agasajado.',
    basePrice: 19500,
    hasPhoto: true,
    photoAspect: 'portrait',
    defaultProduct: 'remera',
    allowedProducts: ['remera', 'hoodie', 'taza', 'totebag'],
    fields: [
      {
        id: 'starTitle',
        label: 'Título de la estrella',
        placeholder: 'Ej: IT’S MY BIRTHDAY',
        defaultValue: 'IT’S MY BIRTHDAY',
        maxLength: 25
      },
      {
        id: 'starNameAge',
        label: 'Nombre y Edad',
        placeholder: 'Ej: CAMILA • 25 AÑOS',
        defaultValue: 'CAMILA • 25 AÑOS',
        maxLength: 30
      },
      {
        id: 'starPhrase',
        label: 'Frase divertida',
        placeholder: 'Ej: Hoy no acepto opiniones',
        defaultValue: 'Celebrando con la mejor vibra ⚡',
        maxLength: 40
      }
    ],
    designStyle: 'pop_birthday'
  }
];
