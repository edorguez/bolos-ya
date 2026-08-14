import { Link } from 'react-router-dom'
import { Footer } from '../home/Footer'
import styles from './PrivacyPage.module.scss'

const sections = [
  {
    title: '1. Responsable del Tratamiento',
    content:
      'El responsable del tratamiento de tus datos personales es el equipo de desarrollo de Merki. Si tienes alguna pregunta sobre esta política de privacidad, puedes contactarnos a través del correo electrónico: soporte@somosmerki.app.',
  },
  {
    title: '2. Datos que Recopilamos',
    content:
      'Para ofrecerte una experiencia completa, recopilamos los siguientes datos personales:',
    items: [
      'Correo electrónico y nombre (al registrarte con email o Google).',
      'Identificador de usuario anónimo (si usas la aplicación como invitado).',
      'Información de pago: número de referencia, banco, monto en bolívares y USD, identificación fiscal (cédula o RIF), al solicitar la suscripción Premium.',
      'Fotos de recibos o etiquetas de precios capturadas mediante la cámara para la función de escaneo OCR. Estas imágenes se procesan localmente en tu dispositivo y no se almacenan en nuestros servidores.',
      'Tasas de cambio del BCV consultadas para mostrar precios actualizados.',
      'Datos de uso básicos para mejorar la aplicación (rendimiento, errores).',
    ],
  },
  {
    title: '3. Finalidad del Tratamiento',
    content: 'Utilizamos tus datos personales para las siguientes finalidades:',
    items: [
      'Crear y gestionar tu cuenta en la aplicación.',
      'Permitir la creación de carritos de compras con precios en doble moneda (bolívares y USD).',
      'Procesar solicitudes de suscripción Premium y gestionar los pagos.',
      'Enviar notificaciones transaccionales (confirmación de registro, aprobación o rechazo de pago Premium).',
      'Sincronizar tus datos entre dispositivos cuando estés conectado a internet.',
      'Mejorar la aplicación basándonos en patrones de uso y reportes de errores.',
      'Cumplir con obligaciones legales y regulatorias.',
    ],
  },
  {
    title: '4. Base Legal para el Tratamiento',
    content:
      'El tratamiento de tus datos personales se basa en las siguientes bases legales:',
    items: [
      'Ejecución de un contrato: el uso de la aplicación y la gestión de tu cuenta.',
      'Consentimiento: al aceptar esta política de privacidad y al otorgar permisos de cámara.',
      'Interés legítimo: para mejorar la aplicación y garantizar su correcto funcionamiento.',
      'Cumplimiento de obligaciones legales: en materia fiscal y comercial.',
    ],
  },
  {
    title: '5. Almacenamiento Local en tu Dispositivo',
    content:
      'Merki almacena datos localmente en tu dispositivo móvil para garantizar su funcionamiento incluso sin conexión a internet:',
    items: [
      'Base de datos SQLite local: almacena tus carritos, productos y supermercados para uso offline.',
      'SecureStore (expo-secure-store): guarda tu sesión de autenticación y tokens de forma segura.',
      'AsyncStorage: almacena la tasa de cambio del BCV en caché y la persistencia del estado del carrito.',
      'Todas las imágenes capturadas para OCR se procesan localmente en tu dispositivo y no se suben a nuestros servidores.',
    ],
  },
  {
    title: '6. Servicios de Terceros',
    content:
      'Para el funcionamiento de la aplicación, utilizamos los siguientes servicios de terceros:',
    items: [
      'better-auth: plataforma de autenticación que gestiona el registro, inicio de sesión y sesiones de usuario. Almacena tu correo, nombre e identificador en una base de datos segura.',
      'Google OAuth: si inicias sesión con Google, recibimos tu nombre y correo electrónico de tu perfil de Google.',
      'Resend: servicio de envío de correos electrónicos transaccionales (bienvenida, notificaciones de pago).',
      'AWS S3: almacenamiento de imágenes de productos solo si decides subir una foto (funcionalidad futura).',
      'Google ML Kit: el reconocimiento de texto OCR se realiza completamente en tu dispositivo. No se envían imágenes a servidores externos.',
    ],
  },
  {
    title: '7. Permisos de la Cámara',
    content:
      'Merki solicita acceso a la cámara de tu dispositivo exclusivamente para la función de escaneo OCR de etiquetas de precios y recibos. Las imágenes capturadas se procesan localmente en tu dispositivo mediante Google ML Kit y no son almacenadas ni transmitidas a nuestros servidores. Puedes denegar este permiso en cualquier momento desde la configuración de tu dispositivo; la aplicación seguirá funcionando, pero la función de escaneo OCR no estará disponible.',
  },
  {
    title: '8. Conservación de los Datos',
    content:
      'Conservamos tus datos personales mientras mantengas una cuenta activa en Merki. Si eliminas tu cuenta, tus datos personales se eliminarán de nuestros servidores en un plazo máximo de 30 días. Los datos de pago se conservarán durante el tiempo exigido por las obligaciones fiscales y legales aplicables en Venezuela.',
  },
  {
    title: '9. Tus Derechos (ARCO)',
    content:
      'De acuerdo con la legislación venezolana y las leyes de protección de datos aplicables, tienes los siguientes derechos sobre tus datos personales:',
    items: [
      'Acceso: solicitar una copia de los datos personales que tenemos sobre ti.',
      'Rectificación: corregir datos inexactos o incompletos.',
      'Cancelación: solicitar la eliminación de tus datos personales.',
      'Oposición: oponerte al tratamiento de tus datos para fines específicos.',
      'Portabilidad: recibir tus datos en un formato estructurado y de uso común.',
    ],
    extra:
      'Para ejercer cualquiera de estos derechos, escríbenos a soporte@somosmerki.app. Responderemos a tu solicitud en un plazo máximo de 15 días hábiles.',
  },
  {
    title: '10. Seguridad de los Datos',
    content:
      'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Estas medidas incluyen:',
    items: [
      'Cifrado de extremo a extremo en la transmisión de datos mediante TLS/SSL.',
      'Almacenamiento seguro de contraseñas mediante hash y salting.',
      'Tokens de sesión almacenados de forma segura en SecureStore.',
      'Acceso restringido a los servidores solo al personal autorizado.',
      'Auditorías periódicas de seguridad.',
    ],
  },
  {
    title: '11. Menores de Edad',
    content:
      'Merki está dirigida a mayores de 13 años. No recopilamos intencionadamente datos personales de menores de 13 años. Si descubrimos que hemos recopilado datos de un menor sin consentimiento parental, eliminaremos dicha información lo antes posible.',
  },
  {
    title: '12. Cambios en esta Política de Privacidad',
    content:
      'Podemos actualizar esta política de privacidad periódicamente. Te notificaremos cualquier cambio significativo a través de la aplicación o por correo electrónico. La fecha de la última actualización se indicará al inicio de esta política. Te recomendamos revisar esta página periódicamente para mantenerte informado.',
  },
  {
    title: '13. Contacto',
    content:
      'Si tienes preguntas, inquietudes o solicitudes relacionadas con esta política de privacidad o el tratamiento de tus datos personales, puedes contactarnos:',
    items: [
      'Correo electrónico: soporte@somosmerki.app',
      'A través de la aplicación: sección de Perfil → Ayuda y Soporte',
    ],
  },
]

const lastUpdated = '14 de julio de 2026'

export function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver a Merki
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>Política de Privacidad</h1>
          <p className={styles.subtitle}>
            Esta política explica cómo recopilamos, usamos y protegemos tus datos personales al
            utilizar la aplicación Merki.
          </p>
          <p className={styles.lastUpdated}>Última actualización: {lastUpdated}</p>
        </header>

        <div className={styles.content}>
          {sections.map((section, i) => (
            <section key={i} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.paragraph}>{section.content}</p>
              {section.items && (
                <ul className={styles.list}>
                  {section.items.map((item, j) => (
                    <li key={j} className={styles.listItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.extra && <p className={styles.extra}>{section.extra}</p>}
            </section>
          ))}
        </div>

        <div className={styles.footerNote}>
          <p>
            Al utilizar Merki, aceptas los términos de esta política de privacidad. Si no estás
            de acuerdo con esta política, por favor no utilices la aplicación.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
