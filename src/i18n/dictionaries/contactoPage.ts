/** Textos propios de src/pages/contacto.astro (el resto vive en translations.ts → `contacto`). */
export const es = {
  addressLine1: 'Km 28, Vía Silvania – Granada',
  addressLine2: 'Granada, Cundinamarca',
  mapTitle: 'Ubicación de Varsana Eco Yoga Aldea en Granada, Cundinamarca',
  roadImageAlt: 'Carretera hacia Varsana entre montañas',
  honeypotLabel: 'Sitio web (deja este campo vacío)',
  sending: 'Enviando...',
  success: '✅ ¡Mensaje enviado! Te responderemos pronto.',
  errorPrefix: '❌ ',
  connectionError: '❌ Error de conexión. Intenta de nuevo.',
  genericError: 'No pudimos enviar tu mensaje. Intenta de nuevo.',
};

export const en = {
  addressLine1: 'Km 28, Silvania – Granada Road',
  addressLine2: 'Granada, Cundinamarca',
  mapTitle: 'Location of Varsana Eco Yoga Aldea in Granada, Cundinamarca',
  roadImageAlt: 'Road to Varsana winding through the mountains',
  honeypotLabel: 'Website (leave this field empty)',
  sending: 'Sending...',
  success: '✅ Message sent! We will get back to you soon.',
  errorPrefix: '❌ ',
  connectionError: '❌ Connection error. Please try again.',
  genericError: 'We could not send your message. Please try again.',
} satisfies typeof es;
