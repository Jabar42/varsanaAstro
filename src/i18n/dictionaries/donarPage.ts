/** Textos propios de src/pages/donar.astro (el resto vive en translations.ts → `donar`). */
export const es = {
  storyHeadingLine1: 'Una aldea que se cultiva',
  storyHeadingLine2: 'con amor colectivo',
  huertaImageAlt: 'Huerta orgánica',
  temploImageAlt: 'Templo Varsana',
  comunidadImageAlt: 'Comunidad Varsana',
  impactAreas: [
    {
      title: 'Huerta Orgánica',
      description:
        'Expandimos nuestra huerta para producir alimentos frescos y saludables que nutren a la comunidad y protegen la tierra.',
    },
    {
      title: 'Templo y Espiritualidad',
      description:
        'Mantenemos el templo como un espacio sagrado para la práctica de yoga, meditación y ceremonias que elevan la conciencia.',
    },
    {
      title: 'Comunidad Consciente',
      description:
        'Fortalecemos los lazos entre voluntarios, visitantes y residentes creando un tejido social basado en el respeto y el servicio.',
    },
  ],
};

export const en = {
  storyHeadingLine1: 'A village cultivated',
  storyHeadingLine2: 'with collective love',
  huertaImageAlt: 'Organic garden',
  temploImageAlt: 'Varsana temple',
  comunidadImageAlt: 'Varsana community',
  impactAreas: [
    {
      title: 'Organic Garden',
      description:
        'We expand our garden to produce fresh, healthy food that nourishes the community and protects the land.',
    },
    {
      title: 'Temple & Spirituality',
      description:
        'We maintain the temple as a sacred space for yoga, meditation, and ceremonies that elevate consciousness.',
    },
    {
      title: 'Conscious Community',
      description:
        'We strengthen the bonds between volunteers, visitors, and residents, creating a social fabric based on respect and service.',
    },
  ],
} satisfies typeof es;
