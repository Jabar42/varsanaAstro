## 5. Create Listing and Detail Pages (Optional)

If you want the new collection to have its own pages, replicate the pattern used for events or pasadías.

### 5.1 Listing Page
Create `src/pages/workshops/index.astro`:

```astro
---
import Layout from '@/src/layouts/Layout.astro';
import { getCollection } from 'astro:content';

const allWorkshops = await getCollection('workshops');
---

<Layout title="Talleres | Varsana Eco Yoga Aldea">
  <h1>Talleres</h1>
  <!-- render workshop cards -->
</Layout>
```

### 5.2 Detail Page
Create `src/pages/workshops/[slug].astro`:

```astro
---
import Layout from '@/src/layouts/Layout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const workshops = await getCollection('workshops');
  return workshops.map(workshop => ({
    params: { slug: workshop.id },
    props: { workshop },
  }));
}

const { workshop } = Astro.props;
const { Content } = await render(workshop);
---

<Layout title={workshop.data.title}>
  <article>
    <h1>{workshop.data.title}</h1>
    <Content />
  </article>
</Layout>
```

Refer to the existing [`src/pages/events/`](../src/pages/events/) files for complete examples.