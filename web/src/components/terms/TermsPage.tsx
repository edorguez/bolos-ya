import { LegalPage } from '../legal/LegalPage'

const sections = [
  {
    title: '1. Aceptación de los Términos',
    content:
      'Al descargar, acceder o utilizar la aplicación Merki, aceptas estos Términos de Servicio y nuestra Política de Privacidad. Si no estás de acuerdo con alguno de estos términos, por favor no utilices la aplicación.',
  },
  {
    title: '2. El Servicio',
    content:
      'Merki es una aplicación que te permite crear carritos de compras, gestionar presupuestos y llevar el control de tus gastos en el supermercado, con precios en doble moneda (bolívares y USD) basados en la tasa oficial del BCV. La aplicación incluye funciones como escaneo de recibos mediante reconocimiento de texto (OCR), registro manual de productos y funcionamiento sin conexión a internet.',
  },
  {
    title: '3. Requisitos de Edad',
    content:
      'Merki está dirigida a personas mayores de 13 años. Al utilizar la aplicación, declaras que cumples con este requisito de edad.',
  },
  {
    title: '4. Cuentas y Registro',
    content:
      'Puedes utilizar Merki con una cuenta de correo electrónico, con tu cuenta de Google o como invitado anónimo. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda la actividad realizada en tu cuenta.',
  },
  {
    title: '5. Plan Gratuito y Plan Premium',
    content:
      'El plan gratuito muestra publicidad dentro de la aplicación. El plan Premium elimina la publicidad y brinda acceso a funciones futuras. El estado Premium se otorga tras la aprobación de un pago y tiene una fecha de vencimiento según los meses adquiridos. Puedes ver tu estado Premium y su fecha de vencimiento en tu perfil.',
  },
  {
    title: '6. Pagos (Pago Móvil)',
    content:
      'La suscripción Premium se paga mediante pago móvil en Venezuela. Al enviar tu solicitud, debes proporcionar el número de referencia, el banco, el monto y tus datos de identificación. Cada solicitud es revisada y aprobada o rechazada manualmente por nuestro equipo. La aprobación puede tomar tiempo y no garantizamos un plazo específico. Si tu pago es rechazado, recibirás una notificación con el motivo. Los pagos aprobados activan Premium hasta la fecha indicada en la aplicación.',
  },
  {
    title: '7. Precios e Información de Mercado',
    content:
      'Las tasas de cambio del BCV y los precios de productos que se muestran en la aplicación tienen fines informativos y pueden variar. No constituyen una oferta de venta ni asesoría financiera. Merki no vende productos ni realiza transacciones de compra; solo te ayuda a organizar tu lista y tu presupuesto.',
  },
  {
    title: '8. Escaneo de Recibos (OCR)',
    content:
      'La función de escaneo procesa las imágenes de recibos y etiquetas directamente en tu dispositivo mediante Google ML Kit. Las imágenes no se suben a nuestros servidores. Eres responsable de verificar la exactitud de los precios y productos ingresados después del escaneo.',
  },
  {
    title: '9. Sincronización y Datos Locales',
    content:
      'La aplicación guarda tus datos localmente en tu dispositivo para funcionar sin conexión y los sincroniza con nuestros servidores cuando tienes internet. Es tu responsabilidad mantener una conexión a internet para sincronizar tus datos entre dispositivos.',
  },
  {
    title: '10. Uso Aceptable',
    content: 'Te comprometes a no utilizar la aplicación para:',
    items: [
      'Realizar actividades ilícitas o fraudulentas.',
      'Intentar acceder sin autorización a cuentas o sistemas ajenos.',
      'Automatizar el uso de la aplicación de forma abusiva.',
      'Reproducir, copiar o distribuir el contenido de la aplicación sin autorización.',
    ],
  },
  {
    title: '11. Propiedad Intelectual',
    content:
      'La aplicación Merki, su diseño, logotipos, textos y funcionalidades son propiedad del equipo de desarrollo de Merki. Al utilizar la aplicación no adquieres ningún derecho de propiedad sobre estos elementos.',
  },
  {
    title: '12. Disponibilidad del Servicio',
    content:
      'Ofrecemos la aplicación "tal cual" y podemos interrumpir el servicio temporalmente por mantenimiento, actualizaciones o causas fuera de nuestro control. No garantizamos una disponibilidad ininterrumpida ni libre de errores.',
  },
  {
    title: '13. Limitación de Responsabilidad',
    content:
      'En la medida máxima permitida por la ley, Merki no será responsable por daños directos, indirectos o consecuentes derivados del uso o la imposibilidad de usar la aplicación. Los precios, tasas y datos mostrados son informativos y su uso es bajo tu propia responsabilidad.',
  },
  {
    title: '14. Terminación',
    content:
      'Puedes dejar de usar la aplicación y eliminar tu cuenta en cualquier momento. El equipo de Merki puede suspender o cerrar cuentas que incumplan estos términos o que realicen actividades fraudulentas.',
  },
  {
    title: '15. Cambios en los Términos',
    content:
      'Podemos actualizar estos Términos de Servicio periódicamente. Te notificaremos los cambios significativos a través de la aplicación o por correo electrónico. El uso continuado de la aplicación después de los cambios implica tu aceptación de los términos actualizados.',
  },
  {
    title: '16. Ley Aplicable',
    content:
      'Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier controversia derivada del uso de la aplicación se someterá a las autoridades competentes venezolanas.',
  },
  {
    title: '17. Contacto',
    content:
      'Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos a través del correo electrónico soporte@somosmerki.app o mediante nuestra página de contacto en somosmerki.app/contact.',
  },
]

const lastUpdated = '30 de agosto de 2026'

export function TermsPage() {
  return (
    <LegalPage
      title="Términos de Servicio"
      subtitle="Estos términos regulan el uso de la aplicación Merki y el acceso a sus funciones."
      lastUpdated={lastUpdated}
      sections={sections}
      note="Si tienes preguntas sobre estos términos, escríbenos a soporte@somosmerki.app."
    />
  )
}
