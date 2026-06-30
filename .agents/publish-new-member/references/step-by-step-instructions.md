## Instrucciones paso a paso

### 1. Elegir un nombre de archivo

Crea un nuevo archivo `.mdoc` dentro de `src/content/nosotros/`. El nombre del archivo **es** el entry ID. Usa **kebab‑case**, minúsculas y evita caracteres especiales. No cambies el nombre después de publicar.

Ejemplo: `maria-lopez.mdoc`, `prabhu-vinayaka-das.mdoc`.

### 2. Campos del frontmatter

```yaml
---
nombre: "Nombre Completo"
rol: "Rol en el equipo"
descripcion: "Una descripción breve que aparecerá en la tarjeta del miembro."
imagen: "/team/foto-del-miembro.jpg"
orden: 0
activo: true
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/usuario"
correo: "email@varsana.com"
telefono: "+57 300 123 4567"
---
```

#### Campos obligatorios

- **`nombre`** (string): Nombre completo del miembro.
- **`rol`** (string): Cargo o responsabilidad dentro de Varsana (ej. "Fundadora", "Facilitador de Yoga").
- **`descripcion`** (string): Resumen de una o dos líneas que se muestra en la tarjeta.
- **`imagen`** (string): Ruta o URL de la foto. Puede ser una ruta relativa a `public/` (ej. `/team/ana-garcia.jpg`) o una URL remota. Usá la skill [`upload-image`](../../upload-image/SKILL.md) para subirla. La imagen debe ser cuadrada (1:1) para que el recorte en la tarjeta sea uniforme.
- **`orden`** (number): Posición en la página. Números más bajos aparecen primero. Default `0`.
- **`activo`** (boolean): `true` para que aparezca en la página, `false` para ocultarlo. Default `true`.

#### Campos opcionales

- **`enlaces_sociales`** (array): Lista de objetos con `plataforma` y `url`. Plataformas reconocidas: `Instagram`, `Twitter`, `LinkedIn`, `Facebook`, `YouTube`. La URL debe ser completa (con `https://`).
- **`correo`** (string): Email válido. Se muestra en la tarjeta.
- **`telefono`** (string): Número en formato libre, se recomienda incluir código de país.

### 3. Escribir la biografía (cuerpo Markdown)

Debajo del frontmatter, escribí la biografía del miembro en **Markdown plano**. A diferencia de eventos y pasadías, no se usa HTML+Tailwind acá — el cuerpo no se renderiza en una página de detalle, solo los datos del frontmatter se muestran en las tarjetas de `/nosotros`.

**Estructura recomendada:**

```markdown
# Sobre [Nombre]

[Párrafo de presentación.]

## Formación

- Título o certificación – Institución
- Otro logro formativo

## Enfoque

[Descripción de su filosofía de trabajo.]

## Contacto

[Email o teléfono si aplica.]
```

Mantené el cuerpo conciso — 2 a 4 secciones cortas son suficientes.
