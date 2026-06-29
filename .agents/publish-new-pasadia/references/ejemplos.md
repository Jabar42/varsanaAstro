## Ejemplos

### Frontmatter mínimo
```yaml
---
title: "Pasadía de Bienestar"
description: "Una jornada de reconexión interior a través del yoga y la meditación."
image: "https://picsum.photos/seed/bienestar/1600/1000"
prices:
  - label: "General"
    amount: 45000
stock_max: 30
duration: "4 horas"
meeting_point: "Salón principal de Varsana, Granada, Cundinamarca"
category: "bienestar"
---
```

### Ejemplo completo (frontmatter + cuerpo)
```markdown
---
title: "Caminata Ecológica por la Montaña"
description: "Una jornada de conexión con la naturaleza a través de senderos ancestrales."
image: "https://picsum.photos/seed/caminata/1600/1000"
prices:
  - label: "Preventa"
    amount: 65000
    deadline: 2026-05-10
  - label: "General"
    amount: 75000
stock_max: 20
duration: "8 horas"
meeting_point: "Entrada principal de Varsana, Granada, Cundinamarca"
category: "naturaleza"
included_services:
  - "Guía especializado"
  - "Almuerzo vegetariano"
  - "Materiales para la caminata"
---
<h2 class="text-3xl font-display font-bold tracking-tightest text-near-black mt-14 mb-5">Una experiencia que te conecta con la tierra</h2>

<p class="text-secondary-gray text-lg leading-relaxed mb-5">Sumérgete en los senderos ancestrales de la montaña sagrada de Varsana. Esta caminata ecológica está diseñada para quienes buscan un contacto profundo con la naturaleza, lejos del ruido urbano.</p>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">Itinerario aproximado</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:00 a. m.</strong> – Encuentro en la entrada principal.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>8:30 a. m.</strong> – Inicio de la caminata con una ceremonia de gratitud a la tierra.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>10:00 a. m.</strong> – Parada en el mirador "El Colibrí" para meditación guiada.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>12:00 p. m.</strong> – Almuerzo vegetariano preparado con ingredientes locales.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>2:00 p. m.</strong> – Continuación del recorrido hasta la cascada "Agua Clara".</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> <strong>4:00 p. m.</strong> – Regreso al punto de encuentro y cierre con círculo de compartir.</li>
</ul>

<h3 class="text-2xl font-display font-bold tracking-tightest text-near-black mt-10 mb-4">¿Qué incluye?</h3>

<ul class="space-y-2 my-5 list-none">
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Guía especializado en ecoturismo y sabiduría ancestral.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Almuerzo vegetariano completo (plato principal, bebida y postre).</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Bastones de trekking y botella de agua reutilizable.</li>
  <li class="flex items-start gap-3 text-secondary-gray text-lg"><span class="text-forest mt-1.5 shrink-0">•</span> Seguro de asistencia médica durante la actividad.</li>
</ul>
```
