---
name: publish-new-member
description: Step-by-step instructions for adding a new member to the nosotros collection. Use when the user wants to add a new team member to the Varsana website.
---
# Cómo Publicar un Nuevo Miembro

## Visión general

Los miembros del equipo en este proyecto Astro son gestionados a través de la **colección de contenido "nosotros"**. Cada miembro es un archivo Markdown ubicado en `src/content/nosotros/` con un esquema de frontmatter definido. El sistema automáticamente:

- Lista a los miembros activos en la página de equipo (`/nosotros`) ordenados por el campo `orden`.
- Filtra a los miembros inactivos (`activo: false`).
- Muestra cada miembro mediante el componente `MemberCard.astro`, que incluye imagen, rol, descripción, enlaces sociales y datos de contacto.

El esquema de frontmatter se define en `src/content.config.ts` e incluye `id`, `nombre`, `rol`, `descripcion`, `imagen`, `orden`, `activo`, `enlaces_sociales`, `correo` y `telefono`.

## Instrucciones paso a paso

Para una guía detallada paso a paso, consulta [Instrucciones paso a paso](references/step-by-step-instructions.md).

## Ejemplos

Puedes ver ejemplos de frontmatter mínimo y completo en [Ejemplos](references/examples.md).

## Detalles de integración

### Inclusión automática en la página de equipo
La página `/nosotros` (`src/pages/nosotros.astro`) obtiene todos los miembros mediante `getCollection('nosotros')`, filtra los activos y los ordena por el campo `orden`. Tu nuevo miembro aparecerá en la cuadrícula de la página tan pronto como el sitio sea reconstruido.

### Componente MemberCard
El componente `MemberCard.astro` (`src/components/MemberCard.astro`) recibe un miembro y renderiza:
- La imagen (`imagen`) con efecto hover.
- El nombre (`nombre`) y el rol (`rol`).
- Una descripción truncada (`descripcion`).
- Los enlaces sociales (`enlaces_sociales`) con iconos automáticos según la plataforma.
- Los datos de contacto (`correo` y `telefono`) si están presentes.

**Iconos sociales:** El componente reconoce las plataformas `Instagram`, `Twitter`, `LinkedIn`, `Facebook`, `YouTube` y muestra el icono correspondiente. Cualquier otra plataforma muestra un icono genérico.

### Campos opcionales
- `orden`: Un número entero que determina el orden de aparición (menor → primero). Si no se define, el valor por defecto es `0`. Los miembros con el mismo orden se ordenan alfabéticamente.
- `activo`: Un booleano que indica si el miembro debe mostrarse en la página. Por defecto `true`. Si se establece en `false`, el miembro no aparecerá en la lista.
- `enlaces_sociales`: Un array de objetos con `plataforma` y `url`. Puede omitirse o dejarse vacío.
- `correo` y `telefono`: Campos de contacto opcionales. Si están presentes, se mostrarán en la tarjeta.

## Errores comunes y consejos

### Formato de imagen
- **Ruta relativa a `public/`:** El campo `imagen` debe ser una ruta relativa a la carpeta `public`. Por ejemplo, si la foto está en `public/team/fulano.jpg`, el valor debe ser `/team/fulano.jpg`.
- **Tamaño y aspecto:** Se recomienda usar imágenes cuadradas (relación 1:1) para que el recorte del componente `MemberCard` sea uniforme.

### Ordenación
- Si dos miembros tienen el mismo `orden`, el orden secundario es alfabético por `nombre`.
- Para que un miembro aparezca al principio, asigna un valor bajo (ej. `orden: 1`). Valores altos lo desplazan hacia el final.

### Enlaces sociales
- La plataforma debe escribirse exactamente como se espera (mayúscula inicial, sin espacios). Ejemplos válidos: `Instagram`, `Twitter`, `LinkedIn`, `Facebook`, `YouTube`.
- La URL debe ser completa (incluyendo `https://`).

### Validación de esquema
- El campo `correo` debe ser un email válido (la colección usa `z.string().email()`).
- `orden` debe ser un número entero no negativo (`z.number().int().min(0)`).
- `enlaces_sociales` debe ser un array de objetos con `plataforma: string` y `url: string().url()`.

## Validación

Después de crear el archivo de tu miembro, verifica que todo funcione como se espera:

1. **Revisa la página de equipo** – Ejecuta el servidor de desarrollo (`npm run dev`) y visita `/nosotros`. Tu nuevo miembro debería aparecer en la cuadrícula, respetando el orden definido.

2. **Inspecciona la tarjeta** – Confirma que:
   - La imagen se carga correctamente.
   - El nombre y el rol se muestran con el formato adecuado.
   - Los enlaces sociales tienen los iconos correctos y los enlaces funcionan.
   - El correo y teléfono (si se incluyeron) aparecen y son clicables.

3. **Prueba el estado activo/inactivo** – Si cambias `activo: false` y guardas el archivo, el miembro debería desaparecer de la lista (recarga la página).

4. **Construye el sitio** – Ejecuta `npm run build` para asegurarte de que no haya errores de validación del esquema.

Si algún paso falla, revisa el frontmatter en busca de errores tipográficos, comprueba la indentación YAML y consulta la consola de desarrollo del navegador para ver mensajes de error.

---

**Ver también:** [`design‑guidelines`](../design-guidelines/SKILL.md).

*Esta guía se basa en la implementación del proyecto a abril de 2026. Para actualizaciones, consulta los archivos `src/content.config.ts` y `src/pages/nosotros.astro`.*
