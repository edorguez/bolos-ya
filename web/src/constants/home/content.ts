export interface Testimonial {
  name: string
  text: string
  rating: number
}

export interface Stat {
  label: string
  value: number
  suffix: string
  isFloat?: boolean
}

export interface Feature {
  icon: string
  title: string
  description: string
  color: 'primary' | 'secondary' | 'tertiary'
}

export interface NavLink {
  label: string
  href: string
}

export const heroContent = {
  badge: 'Bolos Ya - Descarga Gratis',
  badgeIcon: 'bolt',
  title: 'Calcula tu carrito en segundos,',
  titleAccent: 'en cualquier moneda.',
  description:
    'La forma más rápida de gestionar tus compras con doble moneda en Venezuela. Descarga gratis ahora y experimenta conversiones precisas en tiempo real.',
  mockupImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBMKYwTblmAVC4ofLKx1W6-o-in8WqgefzVLTRuu94uvN-UN_5LVyxJPbmTMCU2U5c06RhxrWa7xxdcZRlX2TF9WIS6bc-vyvHm3tq3D5acMGI_KVYCP7oH0ESN8E5VLob0fTrUIKzxfknmegjz2m99l_LVpviP6paHNCF8P2R9NxaMXnz09iWy9TmKmz9hsEaQs2zlsU-M3q216L-xmuJ308IRwQR7b7vWoYR4s4kxv8vKQRDJJdV0W05_0S3AJC4AXAwjjkV1wXog',
  floatingWidget: {
    label: 'Tasa en Vivo',
    value: '36.25 Bs/USD',
    icon: 'currency_exchange',
  },
}

export const storyContent = {
  problem: {
    title: '¿Confusión en la caja?',
    description:
      'Calcular entre tasas, bolívares y dólares en pleno supermercado es estresante. Las calculadoras normales no están hechas para esto.',
  },
  solution: {
    title: 'Tenemos la solución.',
    description:
      'Bolos Ya simplifica todo. Agrega productos, escanea etiquetas y ve el total en ambas monedas al instante.',
    points: [
      {
        icon: 'bolt',
        title: 'Rápido',
        description: 'Diseñado para la velocidad en la tienda.',
      },
      {
        icon: 'sync',
        title: 'Preciso',
        description: 'Tasas actualizadas constantemente.',
      },
    ],
  },
}

export const features: Feature[] = [
  {
    icon: 'document_scanner',
    title: 'Escaneo de Precios OCR',
    description:
      'Apunta tu cámara a las etiquetas. Nuestra IA lee y convierte instantáneamente los precios a tu moneda preferida. Sin teclear nada.',
    color: 'primary',
  },
  {
    icon: 'group',
    title: 'Datos de la Comunidad',
    description:
      'Accede a las tasas de cambio de las tiendas actualizadas por otros usuarios. Siempre sabrás el mejor lugar para comprar antes de ir.',
    color: 'secondary',
  },
  {
    icon: 'wifi_off',
    title: 'Funciona sin Conexión',
    description:
      '¿Sin señal en el supermercado? No hay problema. La aplicación guarda las últimas tasas y funciona perfectamente sin internet.',
    color: 'tertiary',
  },
]

export const stats: Stat[] = [
  { label: 'Descargas', value: 50, suffix: 'k+' },
  { label: 'App Store', value: 4.8, suffix: '/5', isFloat: true },
]

export const testimonials: Testimonial[] = [
  { name: 'María P.', text: 'Me salvó la vida en el súper. Súper rápida.', rating: 5 },
  { name: 'Carlos G.', text: 'El escáner de precios es mágico.', rating: 5 },
  { name: 'Andrea V.', text: 'Ya no me confundo con el vuelto.', rating: 5 },
  { name: 'Luis R.', text: 'Indispensable para las compras.', rating: 5 },
  { name: 'Sofía M.', text: 'La mejor app del año.', rating: 5 },
]

export const ctaContent = {
  title: 'Simplifica tus compras hoy.',
  description:
    'Únete a la comunidad de Bolos Ya y nunca más te confundas calculando el cambio.',
  iosLabel: 'Descargar iOS',
  androidLabel: 'Descargar Android',
}

export const footerContent = {
  brand: 'Bolos Ya',
  tagline: 'Impulsando el comercio venezolano.',
  year: 2024,
  links: [
    { label: 'Privacidad', href: '#' },
    { label: 'Seguridad', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
}

export const appStoreUrls = {
  ios: '#',
  android: '#',
}
