import merkiLogo from '../../assets/merki-logo.webp'
import merkiIllustration from '../../assets/merki-illustration.webp'
import merkiScan from '../../assets/merki-scan.webp'
import merkiCalculator from '../../assets/merki-calculator.webp'
import merkiCheckout from '../../assets/merki-checkout.webp'

export interface Testimonial {
  name: string
  role: string
  text: string
  avatar: string
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
  image: string
  chips?: { label: string; variant: 'primary' | 'neutral' }[]
}

export interface NavLink {
  label: string
  href: string
}

export const brandAssets = {
  logo: merkiLogo,
}

export const heroContent = {
  badgeIcon: 'bolt',
  title: 'Tus compras, bajo control.',
  titleAccent: 'En cualquier moneda.',
  description:
    'Gestiona los carritos del supermercado, presupuestos y gastos diarios. Todo sincronizado en Bolívares y USD al instante. Totalmente gratis, sin hojas de cálculo aburridas, solo claridad.',
  illustration: merkiIllustration,
}

export const navLinks: NavLink[] = [
  { label: 'Características', href: '#caracteristicas' },
  { label: 'La App', href: '#la-app' },
  { label: 'Testimonios', href: '#testimonios' },
]

export const features: Feature[] = [
  {
    icon: 'document_scanner',
    title: 'Escaneo de Producto',
    description:
      'Toma una foto del precio con el nombre del productio y Merki extraerá automáticamente el precio y producto. Magia pura.',
    image: merkiScan,
  },
  {
    icon: 'currency_exchange',
    title: 'Conversión Automática',
    description:
      'Merki calcula el cambio al instante entre USD y Bolívares usando la tasa actual BCV.',
    image: merkiCalculator,
  },
  {
    icon: 'wifi_off',
    title: 'Modo Offline',
    description:
      '¿Sin señal en el pasillo 4? No hay problema. Registra tus gastos y Merki sincronizará todo cuando recuperes la conexión.',
    image: merkiCheckout,
  },
]

export const stats: Stat[] = [
  { label: 'Descargas', value: 50, suffix: 'k+' },
  { label: 'App Store', value: 4.8, suffix: '/5', isFloat: true },
]

export const showcaseContent = {
  title: 'Mi Billetera',
  balanceLabel: 'Balance Total',
  balanceValue: '$450.25',
  transactionsLabel: 'Transacciones Recientes',
  character: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtjhAM-6ISiZs9K-r0B8kOEh-SFdk4b0EIyZB7sAQ24Kcs1HcaQqAMmPvaIuGnodYf8IXu5oacSK8VKCix5v2eyPcGw0lWkH7DSxfH1iIEKUfqvczpPhhRzk2SirOnKNHp7-m9lZHUD_RSMJyUiasoagYMZI_LeEY0SzglmTmvB6WxwtDQh11wGwVNPD4swOh--ttg5z7y-q3xwHw-zqfN0eS_LW_TmDXaG7wRRq6sDwfblZSbhGdP'
  },
  bubbleText: '¡Llevas un 80% de tu presupuesto este mes!',
}


export const testimonials: Testimonial[] = [
  {
    name: 'Sofía R.',
    role: 'Madre de familia',
    text: 'Escanear las facturas del automercado me ha salvado horas. Y ver los precios en ambas monedas al instante es invaluable.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1svke59E7bTh67JebghULfFpO_VHr1Jj738TkOKCkcWBOLm4R-d1wSrxohlj8t0AAEoVAFjQBkiAruoT3s_9ldZJWIKNX3QP0r0ldTkviQHO5NSEEuWJv9GQUEuNSwbf7mjYd6RUsynk8c2IsYcr_NZaS1DsTdCQ7TdncVgo9seD-rIpQQgEdKxHrq2y7Kv0pUdZBeeXICOv9WTbVRqJYwdOJlwUMaPudyQvXozG2bOuukFT0frQ'
  },
  {
    name: 'Carlos M.',
    role: 'Estudiante',
    text: 'La interfaz es súper limpia. Nada de menús complicados, solo abro la app y anoto mis gastos diarios.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU7W6HkOFFdm6-0jIN82PY-dMrtwnqP_Mj0encax-jX7jH8b6yyPq6FuLK-cDEvXo7_VQYITtqU25vGTXiiRxCp_rjAaqyj8XJkQsteeuXEUndSFgHjq4ONA1DGMH23pZOKmh1HHjVt2bpBtgV73YDpVV5iYQvYl5NaKLeyji7kKsxfc-roxNP30KA0qtPm4MqmCRVCM-JGqEmQgMy82JZTY1-LjulcEbj1vsp9JQ52JK0aQE247t2'
  },
  {
    name: 'Elena P.',
    role: 'Emprendedora',
    text: 'Uso Merki para los gastos de mi pequeño negocio. El modo offline me salva cuando estoy en el mercado mayorista.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3SA9lFe0h0Jh_N7bAolZKF5r1xM53TwBxZaE9Su0SQzYhoLgBsKpugruJXwJMQljjCke9oqlbYkdeSKm_7_HuUcv2piqpvqbi6Qgw3PgJa_i0Ua7RkeFxyOJZUtg-VVgSvHQb2UogiojiPIjO-03Zq-qTH9G28KltAR7uKlWJkUftCIB-mya0K99yp0Ow1Qnpln21_G31GeOq-WAxwjcST5RhkAapsjUBnf_ETFfs9A7eQb5TXfJT'
  },
  {
    name: 'Diego G.',
    role: 'Ingeniero y papá',
    text: 'Comparo precios entre mercados y Merki me dice al instante cuánto gastaré en dólares. Mi esposa y yo llevamos el presupuesto familiar sin pelear.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA3SA9lFe0h0Jh_N7bAolZKF5r1xM53TwBxZaE9Su0SQzYhoLgBsKpugruJXwJMQljjCke9oqlbYkdeSKm_7_HuUcv2piqpvqbi6Qgw3PgJa_i0Ua7RkeFxyOJZUtg-VVgSvHQb2UogiojiPIjO-03Zq-qTH9G28KltAR7uKlWJkUftCIB-mya0K99yp0Ow1Qnpln21_G31GeOq-WAxwjcST5RhkAapsjUBnf_ETFfs9A7eQb5TXfJT'
  },
  {
    name: 'Valentina L.',
    role: 'Diseñadora freelance',
    text: 'Escaneo mis compras del mes y al llegar a casa todo está ordenado por categorías. Ver el gasto en Bs y USD a la vez me cambió la vida.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1svke59E7bTh67JebghULfFpO_VHr1Jj738TkOKCkcWBOLm4R-d1wSrxohlj8t0AAEoVAFjQBkiAruoT3s_9ldZJWIKNX3QP0r0ldTkviQHO5NSEEuWJv9GQUEuNSwbf7mjYd6RUsynk8c2IsYcr_NZaS1DsTdCQ7TdncVgo9seD-rIpQQgEdKxHrq2y7Kv0pUdZBeeXICOv9WTbVRqJYwdOJlwUMaPudyQvXozG2bOuukFT0frQ'
  },
]

export const ctaContent = {
  title: 'Empieza a controlar tus gastos hoy mismo',
  description:
    'Únete a miles de usuarios que ya gestionan su dinero de forma inteligente y sin estrés.',
  iosLabel: 'App Store',
  androidLabel: 'Google Play',
}

export const footerContent = {
  brand: 'Merki',
  tagline: 'Tus compras, bajo control.',
  year: new Date().getFullYear(),
  links: [
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Términos de Servicio', href: '/terms' },
    { label: 'Contáctanos', href: '/contact' },
  ],
}

export const appStoreUrls = {
  ios: '#',
  android: '#',
}
