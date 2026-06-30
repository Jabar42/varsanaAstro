## Ejemplos

### Frontmatter mínimo

```yaml
---
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
nombre: "Juan Pérez"
rol: "Coordinador de Proyectos"
descripcion: "Juan coordina las actividades y proyectos de Varsana, con amplia experiencia en gestión comunitaria."
imagen: "/team/juan-perez.jpg"
orden: 2
activo: true
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/juanperez"
  - plataforma: "LinkedIn"
    url: "https://linkedin.com/in/juanperez"
correo: "juan@varsana.com"
telefono: "+57 301 987 6543"
---
```

### Ejemplo completo (frontmatter + cuerpo)

```markdown
---
nombre: "María López"
rol: "Facilitadora de Yoga"
descripcion: "María es instructora certificada de Hatha Yoga y meditación, con más de 8 años guiando retiros."
imagen: "/team/maria-lopez.jpg"
orden: 3
activo: true
enlaces_sociales:
  - plataforma: "Instagram"
    url: "https://instagram.com/maria.yoga"
correo: "maria@varsana.com"
---

# Sobre María

María descubrió el yoga como una herramienta de transformación personal y desde entonces ha dedicado su vida a compartir sus beneficios.

## Formación

- Certificación en Hatha Yoga (500 horas) – Escuela de Yoga Integral
- Formación en Meditación Vipassana – Centro de Retiros Dhamma

## Enfoque de enseñanza

María cree que el yoga es para todos. Sus clases combinan alineación consciente, respiración profunda y meditación guiada.
```
