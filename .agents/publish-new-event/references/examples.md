## Examples

### Minimal frontmatter
```yaml
---
title: "Taller de Mindfulness"
description: "Aprende técnicas de atención plena en un entorno natural."
event_start: 2026-05-10
image: "https://picsum.photos/seed/mindfulness/1600/1000"
stock_max: 20
prices:
  - label: "General"
    amount: 60000
---
```

### Complete example (frontmatter + body)
```markdown
---
title: "Retiro de Silencio"
description: "Un fin de semana de introspección y reconexión en completo silencio."
event_start: 2026-06-15
event_end: 2026-06-17
image: "https://picsum.photos/seed/silence/1600/1000"
stock_max: 30
prices:
  - label: "Preventa"
    amount: 180000
    deadline: 2026-05-31
  - label: "Regular"
    amount: 220000
---
<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">Un espacio para escucharte</h2>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Este retiro está diseñado para que puedas desconectar del ruido exterior y conectar con tu voz interior.</p>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Lo que vivirás</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Meditaciones guiadas por la mañana y la tarde.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Caminatas contemplativas por el bosque.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Alimentación ayurvédica preparada con amor.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Espacios de escritura reflexiva.</li>
</ul>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Recomendaciones</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Traer ropa cómoda y una manta para sentarse.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Se recomienda dejar dispositivos electrónicos en casa.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> El silencio comienza el viernes a las 6 p. m. y finaliza el domingo al mediodía.</li>
</ul>
```
