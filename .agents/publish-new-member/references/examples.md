## Ejemplos

### Frontmatter mínimo

```yaml
---
id: "ana-garcia"
nombre: "Ana García"
rol: "Fundadora"
descripcion: "Ana es la fundadora de Varsana, con más de 10 años de experiencia en comunidades sostenibles y espiritualidad."
imagen: "/team/ana-garcia.jpg"
orden: 1
activo: true
---
```

### Frontmatter completo (con enlaces sociales y contacto)

```yaml
---
id: "juan-perez"
nombre: "Juan Pérez"
rol: "Coordinador de Proyectos"
descripcion: "Juan es el responsable de coordinar las actividades y proyectos de Varsana, con amplia experiencia en gestión comunitaria."
imagen: "/team/juan-perez.jpg"
orden: 2
activo: true
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/juanperez"
  - plataforma: "Twitter"
    url: "https://twitter.com/juanperez"
correo: "juan@varsana.com"
telefono: "+57 301 987 6543"
---
```

### Ejemplo completo (frontmatter + cuerpo Markdown)

```markdown
---
id: "maria-lopez"
nombre: "María López"
rol: "Facilitadora de Yoga"
descripcion: "María es instructora certificada de Hatha Yoga y meditación, con más de 8 años guiando retiros."
imagen: "/team/maria-lopez.jpg"
orden: 3
activo: true
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/maria.yoga"
  - plataforma: "YouTube"
    url: "https://youtube.com/@maria-yoga"
correo: "maria@varsana.com"
telefono: "+57 310 555 1234"
---

# Sobre María

María descubrió el yoga como una herramienta de transformación personal y desde entonces ha dedicado su vida a compartir sus beneficios.

## Formación

- Certificación en Hatha Yoga (500 horas) – Escuela de Yoga Integral
- Formación en Meditación Vipassana – Centro de Retiros Dhamma
- Taller de Yoga Terapéutico para lesiones

## Enfoque de enseñanza

María cree que el yoga es para todos, sin importar la edad, condición física o experiencia. Sus clases combinan:

1. **Alineación consciente** – Prestando atención a la postura para prevenir lesiones.
2. **Respiración profunda** – Utilizando el pranayama como puente entre cuerpo y mente.
3. **Meditación guiada** – Incorporando momentos de silencio y reflexión.

## Frase favorita

> "El yoga no es tocar tus pies, es lo que aprendes en el camino hacia abajo."

## Contacto

Si deseas tomar una clase privada o preguntar sobre los próximos talleres, no dudes en escribirle a [maria@varsana.com](mailto:maria@varsana.com) o llamar al +57 310 555 1234.
```

### Referencias a miembros existentes

- [`ana-garcia.md`](../../src/content/nosotros/ana-garcia.md) – Ejemplo de miembro fundador con enlaces sociales.
- [`juan-perez.md`](../../src/content/nosotros/juan-perez.md) – Ejemplo de miembro con rol de coordinador y contacto.

Estos archivos pueden consultarse directamente en el proyecto como referencia de estructura y estilo.
