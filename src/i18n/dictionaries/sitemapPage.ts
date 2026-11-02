/**
 * Grupos de enlaces de src/pages/mapa-del-sitio.astro (el chrome vive en translations.ts → `sitemap`).
 * El orden de `groups`/`links` debe coincidir en ambos idiomas: la página asocia href e icono por posición.
 */
export const es = {
  groups: [
    {
      heading: 'Principal',
      links: [
        { label: 'Inicio', description: 'Página de bienvenida, eventos destacados y galería' },
        { label: 'Nosotros', description: 'Conoce a nuestro equipo y nuestra misión' },
        { label: 'Contáctanos', description: 'Escríbenos, llámanos o visítanos' },
      ],
    },
    {
      heading: 'Experiencias',
      links: [
        { label: 'Eventos', description: 'Retiros, talleres y encuentros con fecha programada' },
        { label: 'Pasadías', description: 'Servicios y experiencias disponibles todo el año' },
        { label: 'Voluntariado', description: 'Vive la eco-aldea como voluntario y aprende habilidades sostenibles' },
      ],
    },
    {
      heading: 'Bienestar',
      links: [
        { label: 'Hospedaje', description: 'Habitaciones ecológicas con vista a las montañas de Cundinamarca' },
        { label: 'Alimentación', description: 'Cocina vegetariana consciente con ingredientes frescos de nuestra huerta orgánica' },
        { label: 'Tienda', description: 'Productos artesanales y sostenibles — próximamente' },
      ],
    },
    {
      heading: 'Más',
      links: [
        { label: 'Donar', description: 'Apoya la misión de Varsana con tu contribución' },
        { label: 'Blog', description: 'Historias, sabiduría y noticias de la comunidad' },
        { label: 'Design System', description: 'Guía de diseño para desarrolladores y colaboradores' },
      ],
    },
  ],
};

export const en = {
  groups: [
    {
      heading: 'Main',
      links: [
        { label: 'Home', description: 'Welcome page, featured events and gallery' },
        { label: 'About Us', description: 'Meet our team and our mission' },
        { label: 'Contact Us', description: 'Write to us, call us or visit us' },
      ],
    },
    {
      heading: 'Experiences',
      links: [
        { label: 'Events', description: 'Retreats, workshops and gatherings with scheduled dates' },
        { label: 'Day Passes', description: 'Services and experiences available year-round' },
        { label: 'Volunteering', description: 'Live the eco-village as a volunteer and learn sustainable skills' },
      ],
    },
    {
      heading: 'Wellness',
      links: [
        { label: 'Lodging', description: 'Eco-friendly rooms overlooking the Cundinamarca mountains' },
        { label: 'Food', description: 'Conscious vegetarian cuisine with fresh ingredients from our organic garden' },
        { label: 'Shop', description: 'Artisanal and sustainable products — coming soon' },
      ],
    },
    {
      heading: 'More',
      links: [
        { label: 'Donate', description: "Support Varsana's mission with your contribution" },
        { label: 'Blog', description: 'Stories, wisdom and news from the community' },
        { label: 'Design System', description: 'Design guide for developers and collaborators' },
      ],
    },
  ],
} satisfies typeof es;
