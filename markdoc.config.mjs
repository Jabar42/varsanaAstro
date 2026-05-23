import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    callout: {
      render: component('./src/components/markdoc/Callout.astro'),
      attributes: {
        type: { type: String, default: 'info' },
        title: { type: String },
      },
    },
    locationcard: {
      render: component('./src/components/markdoc/LocationCard.astro'),
      attributes: {
        lugar: { type: String },
        hora: { type: String },
        duracion: { type: String },
      },
    },
  },
});
