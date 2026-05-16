## Instrucciones paso a paso

### 1. Elige un nombre de archivo
- Crea un nuevo archivo `.md` dentro de `src/content/nosotros/`.
- El nombre del archivo determina el ID de entrada. Usa **kebab‑case**, minúsculas y evita caracteres especiales.

### 2. Campos obligatorios del frontmatter
Cada miembro debe incluir los siguientes campos en el frontmatter:

```yaml
---
id: "nombre-miembro"
nombre: "Nombre Completo"
rol: "Rol en el equipo"
descripcion: "Una descripción breve que aparecerá en la tarjeta del miembro."
imagen: "/team/foto-del-miembro.jpg"
orden: 0
activo: true
---
```

#### Detalles de cada campo
- **`id`** (string): Un identificador único y persistente para el miembro. Este ID se usará para referencias internas y no cambiará aunque se renombre el archivo. Usa kebab‑case (ej. `ana-garcia`).
- **`nombre`** (string): El nombre completo del miembro.
- **`rol`** (string): El cargo o responsabilidad dentro de Varsana (ej. "Fundadora", "Coordinador de Proyectos").
- **`descripcion`** (string): Un resumen de una o dos líneas que se muestra en la tarjeta. Debe ser conciso pero atractivo.
- **`imagen`** (string): URL de la foto del miembro. Puede ser una ruta local dentro de `public/` (ej. `/team/ana-garcia.jpg`) o una URL remota. La forma recomendada es usar la skill [`upload-image`](../../upload-image/SKILL.md) para subir la foto al bucket `VarsanaImages` y obtener una URL pública (ej. `https://avvgfkclrciwimctbgqy.supabase.co/storage/v1/object/public/VarsanaImages/nosotros/ana-garcia/perfil.webp`).
- **`orden`** (number): Un número entero no negativo que determina la posición en la página. Los miembros se ordenan de menor a mayor (0 → primero). Si no se especifica, el valor por defecto es `0`.
- **`activo`** (boolean): Si es `true`, el miembro aparecerá en la página de equipo. Si es `false`, se ocultará. Por defecto es `true`.

### 3. Campos opcionales

#### Enlaces sociales (`enlaces_sociales`)
Un array de objetos con `plataforma` y `url`. Cada plataforma debe escribirse exactamente como se espera (mayúscula inicial). Las plataformas reconocidas son:

- `Instagram`
- `Twitter` (también acepta `X`)
- `LinkedIn`
- `Facebook`
- `YouTube`

Cualquier otra plataforma mostrará un icono genérico.

**Estructura YAML:**
```yaml
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/usuario"
  - plataforma: "LinkedIn"
    url: "https://linkedin.com/in/usuario"
```

#### Contacto (`correo` y `telefono`)
- **`correo`** (string): Dirección de correo electrónico válida. Se validará con el esquema de contenido.
- **`telefono`** (string): Número de teléfono en formato libre (se recomienda incluir código de país, ej. `+57 300 123 4567`).

### 4. Subir la imagen

**Método recomendado:** Usa la skill [`upload-image`](../../upload-image/SKILL.md):

```bash
npx tsx scripts/upload-image.ts ./foto.jpg --folder nosotros/<id-miembro> --name perfil
```

Esto devuelve una URL pública que puedes usar directamente en el campo `imagen`.

**Alternativa local:** Coloca la foto en `public/team/` y usa una ruta relativa a `public` (ej. `/team/maria-lopez.jpg`).

En ambos casos, la imagen debe tener una relación de aspecto **cuadrada (1:1)** para que el recorte en `MemberCard` sea uniforme.

### 5. Escribir el contenido Markdown (biografía)
Debajo del frontmatter, escribe la biografía completa del miembro usando Markdown.

**Estructura recomendada:**
- Comienza con un título de nivel 1 (`#`) o 2 (`##`) con el nombre o un saludo.
- Usa párrafos cortos y listas con viñetas para mejorar la legibilidad.
- Incluye secciones como "Formación", "Experiencia", "Filosofía personal", "Logros", etc.
- Mantén un tono cálido y cercano, acorde a la identidad de Varsana.

**Ejemplo de cuerpo:**
```markdown
# Sobre María

María es facilitadora de yoga y meditación con más de 8 años de experiencia guiando retiros en entornos naturales.

## Formación

- Certificación en Hatha Yoga (500 horas) – Escuela de Yoga Integral
- Taller de Yoga Terapéutico para lesiones
- Formación en Meditación Vipassana – Centro de Retiros Dhamma

## Enfoque de enseñanza

Para María, el yoga es un camino de autodescubrimiento y conexión con la naturaleza. Sus clases combinan:

1. **Alineación consciente** – Priorizando la seguridad y el bienestar del cuerpo.
2. **Respiración profunda** – Utilizando el pranayama como puente entre cuerpo y mente.
3. **Meditación guiada** – Incorporando momentos de silencio y reflexión.

## Frase favorita

> "El yoga no es tocar tus pies, es lo que aprendes en el camino hacia abajo."

## Contacto

Si deseas tomar una clase privada o preguntar sobre los próximos talleres, no dudes en escribirle a [maria@varsana.com](mailto:maria@varsana.com) o llamar al +57 310 555 1234.
```

### 6. Dónde guardar el archivo
Guarda el archivo en `src/content/nosotros/`. El cargador de la colección de contenido de Astro lo detectará automáticamente.

### 7. Verificación rápida
Antes de terminar, revisa que:

- Todos los campos obligatorios están presentes (`id`, `nombre`, `rol`, `descripcion`, `imagen`, `orden`, `activo`).
- La ruta de la imagen es correcta y el archivo existe en `public/team/`.
- Los enlaces sociales tienen `plataforma` y `url` con formato válido.
- El correo es una dirección de email válida.
- El orden (`orden`) refleja la posición deseada en la página.

### 8. Probar la integración
1. Ejecuta el servidor de desarrollo: `npm run dev`.
2. Visita la página de equipo (`/nosotros`) y busca tu nuevo miembro en la cuadrícula.
3. Haz clic en la tarjeta para ver la página de detalle (si existe) o comprueba que los enlaces sociales y datos de contacto funcionen.
4. Si algo no se muestra, revisa la consola del navegador y los logs del servidor en busca de errores de validación.

### 9. Construir el sitio (opcional)
Ejecuta `npm run build` para asegurarte de que el esquema de contenido no arroja errores. Si la construcción falla, corrige los mensajes de error antes de desplegar.

---

*Estas instrucciones se basan en la implementación actual del proyecto (abril 2026). Para consultar el esquema exacto, revisa `src/content.config.ts`.*
