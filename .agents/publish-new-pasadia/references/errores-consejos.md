## Errores comunes y consejos

### Formatos de fecha
- **Siempre** usa `YYYY‑MM‑DD`. Otros formatos (como `DD/MM/YYYY`) provocarán errores de análisis.
- Los campos `deadline` (en los precios) se analizan como objetos `Date` en el esquema.

### Placeholders de imagen
- El proyecto actualmente usa `https://picsum.photos/seed/…/1600/1000` como placeholder. Reemplázalo con una URL de imagen real cuando el activo visual del pasadía esté listo.
- Asegúrate de que la imagen sea de alta calidad y en orientación horizontal (la proporción 16:10 funciona bien).

### Problema de zona horaria en los deadlines
- Como se mencionó arriba, los deadlines se evalúan a medianoche UTC. Si quieres que un deadline sea efectivo hasta el final de un día determinado en Colombia, establece el deadline **un día después** (ej. si el corte es el 15 de abril hora Colombia, escribe `deadline: 2026‑04‑16`).

### Orden de los precios
- Coloca los niveles de precio en el orden en que quieres que sean evaluados. El último precio es el fallback, así que pon tu precio “regular” o “por defecto” al final.
- Ejemplo:
  ```yaml
  prices:
    - label: "Super Preventa"   # primero que se verifica
      amount: 50000
      deadline: 2026-03-01
    - label: "Preventa"         # se verifica después
      amount: 60000
      deadline: 2026-04-01
    - label: "General"          # fallback si ambos deadlines pasaron
      amount: 80000
  ```

### Sintaxis YAML
- Usa espacios (no tabuladores) para la indentación.
- Cada entrada de precio debe comenzar con un guion y un espacio.
- El `amount` debe ser un número simple (sin símbolos de moneda, sin comas).

### Consistencia de categorías
- Utiliza una de las categorías ya existentes en otros pasadías (`"naturaleza"`, `"ecologico"`, `"bienestar"`, etc.) para mantener la coherencia en los filtros de la interfaz.
- Si necesitas una nueva categoría, actualiza el componente `CategoryBar.astro` para que la reconozca.

### Duración y punto de encuentro
- Escribe la dución en un formato claro y legible para el usuario, ej. `"8 horas"` en lugar de `"8h"`.
- Incluye toda la información necesaria en `meeting_point`: dirección, referencias, si hay parqueadero, etc.