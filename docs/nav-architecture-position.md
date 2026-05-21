# Posición técnica sobre la arquitectura de navegación

**Autor:** Jaime (Lead Developer)  
**Fecha:** 2026-05-20  
**Estado:** Registro de oposición técnica

---

## Contexto

Una voluntaria con llegada a los tomadores de decisiones propuso un nuevo esquema de navegación. Me opuse técnicamente y modifiqué la implementación para mitigar varios de sus problemas, pero la estructura final aún contiene concesiones que no comparto. Este documento deja constancia de:

1. Qué pidió la propuesta original
2. Qué implementé realmente (mi versión resistida)
3. Qué propongo como esquema correcto
4. Por qué cada punto de la propuesta original es incorrecto

---

## Comparación de los tres esquemas

### A. Propuesta original de la voluntaria

```
[Ícono solo, sin etiqueta] → Varsana → Experiencias[Eventos, Pasadías] → Hospedaje → Alimentación → Tienda → Agenda → Blog
```

Problemas (detallados abajo): ícono sin texto ni iconografía reconocible, "Varsana" como etiqueta de navegación, eliminación de Contacto, y Agenda compitiendo con Experiencias.

### B. Lo que implementé (versión de resistencia)

```
Inicio → Nosotros → Experiencias[Eventos, Pasadías] → Hospedaje → Alimentación → Tienda → Agenda → Blog → Contacto
```

Mitigué tres de los cuatro problemas: restauré la etiqueta "Inicio" con el ícono House estándar, mantuve "Nosotros", y conservé Contacto. No pude evitar la inclusión de "Agenda" como item de primer nivel porque la decisión ya estaba tomada.

### C. Lo que propongo (esquema correcto)

```
Inicio → Nosotros → Experiencias[Eventos, Pasadías, Agenda] → Hospedaje → Alimentación → Tienda → Blog → Contacto
```

Agenda como hija de Experiencias, donde pertenece conceptualmente. Si Agenda es solo una vista de calendario de los mismos datos, ni siquiera debería ser un item de navegación: se resuelve con un componente dentro de la página de Experiencias.

---

## Análisis detallado de cada problema

### 1. Ícono sin etiqueta para Inicio

La propuesta original pide un ícono sin texto y sin pertenecer a una iconografía reconocible (no es un House estándar, no es nada que el usuario pueda interpretar inequívocamente).

**Qué está mal:**

- **Falta de affordance:** Un ícono sin etiqueta no comunica su función. El usuario debe adivinar qué hace. En tests de usabilidad, los íconos sin texto son consistentemente los elementos peor interpretados.
- **Accesibilidad (WCAG 2.1 SC 2.4.4):** Todo enlace debe tener un nombre accesible. Un ícono sin texto visible requiere `aria-label`, pero incluso con eso, usuarios con baja alfabetización digital o adultos mayores no lo identifican.
- **Sin iconografía reconocible:** Si el ícono ni siquiera es un House (estándar universal para "Inicio"), el problema se agrava. Es pedirle al usuario que aprenda un símbolo arbitrario específico de este sitio.

**Lo que implementé:** Restauré la etiqueta "Inicio" con el ícono `House` de Lucide, que es el estándar reconocible.

**Lo que propongo:** Mantener ícono + etiqueta. La combinación de ícono reconocible y texto es la práctica recomendada por NNGroup y las WCAG.

---

### 2. "Varsana" como etiqueta de navegación en vez de "Nosotros"

La propuesta original reemplaza "Nosotros" por "Varsana".

**Qué está mal:**

- **Redundancia con el logo:** El logo de Varsana ya está presente y fijo en el header. El usuario ya sabe dónde está. Repetir el nombre de la marca en la navegación desperdicia un slot de primer nivel y no aporta información nueva.
- **No describe el contenido:** "Nosotros" (o "Quiénes somos") es una convención web de 30 años. El usuario escanea esa palabra y sabe exactamente qué va a encontrar: filosofía, equipo, historia. "Varsana" no comunica eso — podría ser cualquier cosa.
- **Confunde marca con navegación:** La navegación existe para orientar al usuario sobre la estructura del contenido, no para reforzar la marca. La marca ya tiene su espacio (logo, favicon, título de página, URL).

**Lo que implementé:** Mantuve "Nosotros".

**Lo que propongo:** "Nosotros" (o "Quiénes somos"). Si quieren reforzar la marca, que lo hagan en el contenido de esa página, no en la etiqueta de navegación.

---

### 3. Eliminación de "Contacto"

La propuesta original termina el menú en "Blog", eliminando "Contacto" completamente.

**Qué está mal:**

- **Antipatrón de conversión:** "Contacto" es uno de los items más escaneados en cualquier navegación web. Estudios de eyetracking (NNGroup, 2023) lo ubican consistentemente en el top 3 de items buscados por usuarios con intención de compra o reserva.
- **Fricción innecesaria:** Si un usuario quiere contactar al establecimiento (para una reserva, una duda, una queja), y no encuentra el link en la navegación, tiene que scrollear al footer o usar el buscador. Cada paso extra reduce la probabilidad de conversión.
- **Impacto directo en negocio:** Varsana es un centro de retiros que vive de reservas. El contacto es el paso final del embudo. Esconderlo es literalmente perder dinero.
- **Convención web universal:** Prácticamente todos los sitios comerciales y de servicios tienen "Contacto" en la navegación principal. Romper esta convención hace que el sitio parezca incompleto o poco profesional.

**Lo que implementé:** Mantuve "Contacto" como último item.

**Lo que propongo:** Mantenerlo. Es el cierre natural del recorrido de navegación y un punto crítico de conversión.

---

### 4. "Agenda" como item de primer nivel compitiendo con "Experiencias"

Este problema sobrevivió a mi resistencia y está en la versión implementada actualmente.

**Qué está mal:**

- **Sinonimia ambigua (Rosenfeld & Morville, _Information Architecture_, 4ª ed., cap. 6):** Dos etiquetas que apuntan a conceptos solapados fragmentan el modelo mental del usuario. "Experiencias" ya contiene Eventos y Pasadías — actividades con fecha. Si "Agenda" también es una vista de actividades con fecha, el usuario se pregunta cuál es la diferencia y en cuál buscar.
- **Agrupación por sistema, no por tarea:** El visitante no piensa en "colecciones de contenido del CMS", piensa en verbos: _reservar una actividad_. Eventos, Pasadías y Agenda comparten el mismo verbo mental. Separarlos obedece a cómo se organiza el contenido internamente, no a cómo lo consume el usuario.
- **Posición incorrecta en el flujo:** Peor aún, Agenda aparece después de Tienda. La secuencia natural es: Quiénes somos → Qué ofrecemos → Cuándo → Dónde duermo → Qué compro → Qué leo → Cómo contacto. Agenda (un "cuándo") después de Tienda (un "qué compro") rompe el flujo lógico.

**Lo que implementé:** Cedí e incluí Agenda como item de primer nivel porque la decisión ya estaba tomada.

**Lo que propongo:** Agenda como hija de Experiencias, o directamente eliminada como item de navegación si es solo una vista de calendario de los mismos datos.

---

## Principios de arquitectura de información vulnerados (resumen)

| Principio | Problema |
|---|---|
| **Information scent** (Nielsen) | Ícono sin etiqueta no da pistas; "Varsana" no describe contenido; "Agenda" vs "Experiencias" compiten |
| **Affordance** (Norman) | Ícono sin texto no comunica que es cliqueable ni qué hace |
| **Disclosure progresivo** | Demasiados items de primer nivel; Agenda no merece ese slot |
| **WCAG 2.1 SC 2.4.4** | Enlace sin nombre accesible (ícono solo) |
| **Convención web** | Eliminar Contacto viola expectativas del usuario |
| **Agrupación por tarea** | Separar Experiencias y Agenda obedece al CMS, no al modelo mental del usuario |
| **Ley de Fitts / escaneo en F** | Items relacionados separados por no relacionados (Tienda entre Experiencias y Agenda) |

---

## Recomendación

1. **Ideal:** Experiencias[Eventos, Pasadías, Agenda] — o eliminar Agenda como item y resolverlo como componente interno.
2. **Mínimo negociable:** Mantener etiquetas con texto + ícono reconocible, mantener "Nosotros" (no "Varsana"), mantener "Contacto", y si Agenda se queda, al menos moverla inmediatamente después de Experiencias.
3. **Validación:** Implementar tracking de clics por posición. Si los datos muestran que los usuarios entienden la estructura actual y convierten igual, retiro mi objeción. Si no, los datos hablan por sí solos.

---

_Este documento queda como registro de la posición técnica. La versión actualmente desplegada ya contiene modificaciones mías para mitigar los peores problemas de la propuesta original, pero no refleja mi recomendación completa._
