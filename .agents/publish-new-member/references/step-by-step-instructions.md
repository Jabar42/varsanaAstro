## Instrucciones paso a paso

### 1. Elige un nombre de archivo y slug
- Crea un nuevo archivo `.md` dentro de `src/content/nosotros/`.
- El nombre del archivo se convertirá en el slug de la URL (por ejemplo, `maria-lopez.md` → `/nosotros/maria-lopez`).
- Usa **kebab‑case**, minúsculas y evita caracteres especiales.

### 2. Campos obligatorios del frontmatter
Cada miembro debe incluir los siguientes campos en el frontmatter:

```yaml
---
nombre: "Nombre Completo"
rol: "Rol en el equipo"
descripcion: "Una descripción breve que aparecerá en la tarjeta del miembro."
imagen: "/team/foto-del-miembro.jpg"
orden: 0
activo: true
---
```

#### Detalles de cada campo
- **`nombre`** (string): El nombre completo del miembro.
- **`rol`** (string): El cargo o responsabilidad dentro de Varsana (ej. “Fundadora”, “Coordinador de Proyectos”).
- **`descripcion`** (string): Un resumen de una o dos líneas que se muestra en la tarjeta. Debe ser conciso pero atractivo.
- **`imagen`** (string): Ruta relativa a la imagen dentro de la carpeta `public`. Las imágenes de los miembros se almacenan en `public/team/`. El valor debe comenzar con `/team/` (ej. `/team/ana-garcia.jpg`).
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

### 4. Ubicación de la imagen
- Sube o coloca la foto del miembro en la carpeta `public/team/`.
- El nombre del archivo de imagen debe ser descriptivo y coincidir con el slug del miembro (ej. `maria-lopez.jpg`).
- La imagen debe tener una relación de aspecto **cuadrada (1:1)** para que el recorte en `MemberCard` sea uniforme.
- En el frontmatter, la ruta debe ser **relativa a `public`**, es decir, `/team/nombre‑de‑la‑foto.jpg`.

### 5. Escribir el contenido Markdown (biografía)
Debajo del frontmatter, escribe la biografía completa del miembro usando Markdown.

**Estructura recomendada:**
- Comienza con un título de nivel 1 (`#`) o 2 (`##`) con el nombre o un saludo.
- Usa párrafos cortos y listas con viñetas para mejorar la legibilidad.
- Incluye secciones como “Formación”, “Experiencia”, “Filosofía personal”, “Logros”, etc.
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

> “El yoga no es tocar tus pies, es lo que aprendes en el camino hacia abajo.”

## Contacto

Si deseas tomar una clase privada o preguntar sobre los próximos talleres, no dudes en escribirle a [maria@varsana.com](mailto:maria@varsana.com) o llamar al +57 310 555 1234.
```

### 6. Dónde guardar el archivo
Guarda el archivo en `src/content/nosotros/`. El cargador de la colección de contenido de Astro lo detectará automáticamente.

### 7. Verificación rápida
Antes de terminar, revisa que:

- Todos los campos obligatorios están presentes.
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