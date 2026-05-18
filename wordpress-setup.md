# Marave Web Studio — Setup WordPress como Backend

## Lo que necesitas instalar en WordPress

### Plugins necesarios (gratuitos)
1. **Custom Post Type UI** — para crear los tipos de contenido
2. **Advanced Custom Fields (ACF)** — para añadir campos personalizados
3. **ACF to REST API** — para exponer los campos ACF en la API

Instálalos desde: WordPress → Plugins → Añadir nuevo

---

## Crear los Custom Post Types

### 1 — SERVICIOS
En CPT UI → Add/Edit Post Types:
- Post Type Slug: `servicios`
- Plural Label: `Servicios`
- Singular Label: `Servicio`
- REST API: ✅ activado
- REST Base: `servicios`

### 2 — PROYECTOS
- Post Type Slug: `proyectos`
- Plural Label: `Proyectos`
- Singular Label: `Proyecto`
- REST API: ✅ activado
- REST Base: `proyectos`

### 3 — PRECIOS
- Post Type Slug: `precios`
- Plural Label: `Precios`
- Singular Label: `Precio`
- REST API: ✅ activado
- REST Base: `precios`

---

## Campos ACF para cada CPT

### Proyectos
- `url_proyecto` (texto) — URL del proyecto
- `sector` (texto) — Sector del cliente
- `año` (número) — Año del proyecto

### Servicios
- `tags_servicio` (texto) — Ej: "Responsive, Custom UI"
- `categoria` (texto) — Ej: "DISEÑO"

### Precios
- `tipo` (select) — Opciones: proyecto, paginas, mantenimiento, extra
- `precio` (número) — Precio base en €

---

## Cómo añadir contenido

### Blog
WordPress → Entradas → Añadir nueva
- Título, contenido, imagen destacada, categoría

### Proyectos
WordPress → Proyectos → Añadir nuevo
- Título (nombre del cliente)
- Descripción corta (excerpt)
- Campos ACF: URL, sector, año

### Servicios
WordPress → Servicios → Añadir nuevo
- Título del servicio
- Descripción (excerpt)
- Campos ACF: tags, categoría

### Precios
WordPress → Precios → Añadir nuevo
- Título (ej: "Web corporativa")
- Campos ACF: tipo = "proyecto", precio = 499

---

## Verificar que funciona

Abre en el navegador:
- https://cms.maravewebstudio.com/wp-json/wp/v2/posts
- https://cms.maravewebstudio.com/wp-json/wp/v2/servicios
- https://cms.maravewebstudio.com/wp-json/wp/v2/proyectos
- https://cms.maravewebstudio.com/wp-json/wp/v2/precios

Cada uno debe devolver un JSON con el contenido.
