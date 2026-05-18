/**
 * Marave Web Studio — WordPress API Connector
 * Conecta la web estática con el CMS en cms.maravewebstudio.com
 */

const WP_API = 'https://cms.maravewebstudio.com/wp-json/wp/v2';

/* ═══════════════════════════════════════════
   BLOG — Carga artículos desde WordPress
   En WordPress: Entradas → Nueva entrada
═══════════════════════════════════════════ */
async function loadBlogPosts() {
  try {
    const res = await fetch(`${WP_API}/posts?_embed&per_page=3&status=publish`);
    if (!res.ok) throw new Error('API error');
    const posts = await res.json();

    const grid = document.querySelector('.blog-grid');
    if (!grid || posts.length === 0) return;

    grid.innerHTML = posts.map(post => {
      // Imagen destacada
      const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      // Categoría
      const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
      // Tiempo de lectura estimado (palabras / 200)
      const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
      const readTime = Math.max(1, Math.round(words / 200));
      // Excerpt limpio
      const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 120) + '…';

      return `
        <article class="blog-card">
          <div class="blog-thumb" ${img ? `style="background-image:url('${img}');background-size:cover;background-position:center"` : ''}>
            <span class="blog-thumb-label">${cat}</span>
          </div>
          <div class="blog-meta">
            <span class="blog-cat">${cat}</span>
            <span>${readTime} min</span>
          </div>
          <h4>${post.title.rendered}</h4>
          <p>${excerpt}</p>
          <a class="blog-read" href="${post.link}" target="_blank" rel="noopener">
            <span>Leer artículo</span><span>→</span>
          </a>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.warn('Blog: usando contenido estático por defecto', err);
    // Si falla la API, el contenido estático original se queda tal cual
  }
}

/* ═══════════════════════════════════════════
   SERVICIOS — Carga servicios desde WordPress
   En WordPress: instalar plugin "Custom Post Type UI"
   y crear CPT con slug "servicios"
   Campos: título, descripción, tags (etiquetas)
═══════════════════════════════════════════ */
async function loadServicios() {
  try {
    const res = await fetch(`${WP_API}/servicios?per_page=6&status=publish`);
    if (!res.ok) throw new Error('API error');
    const servicios = await res.json();
    if (servicios.length === 0) return;

    // Actualiza las tarjetas del home
    const cards = document.querySelectorAll('.hs-card');
    servicios.forEach((svc, i) => {
      if (!cards[i]) return;
      const h3 = cards[i].querySelector('h3');
      const p = cards[i].querySelector('p');
      if (h3) h3.textContent = svc.title.rendered;
      if (p) p.textContent = svc.excerpt?.rendered?.replace(/<[^>]+>/g, '') || '';
    });

    // Actualiza las tarjetas de la página de servicios
    const svcCards = document.querySelectorAll('.svc-card');
    servicios.forEach((svc, i) => {
      if (!svcCards[i]) return;
      const h3 = svcCards[i].querySelector('h3');
      const p = svcCards[i].querySelector('p');
      if (h3) h3.textContent = svc.title.rendered;
      if (p) p.textContent = svc.excerpt?.rendered?.replace(/<[^>]+>/g, '') || '';
    });

  } catch (err) {
    console.warn('Servicios: usando contenido estático por defecto', err);
  }
}

/* ═══════════════════════════════════════════
   PROYECTOS — Carga trabajos desde WordPress
   En WordPress: crear CPT con slug "proyectos"
   Campos: título, descripción, sector, año, URL
═══════════════════════════════════════════ */
async function loadProyectos() {
  try {
    const res = await fetch(`${WP_API}/proyectos?_embed&per_page=9&status=publish`);
    if (!res.ok) throw new Error('API error');
    const proyectos = await res.json();
    if (proyectos.length === 0) return;

    const grid = document.querySelector('.port-grid');
    if (!grid) return;

    grid.innerHTML = proyectos.map(proy => {
      const sector = proy.acf?.sector || proy._embedded?.['wp:term']?.[0]?.[0]?.name || 'Proyecto';
      const year = new Date(proy.date).getFullYear();
      const excerpt = proy.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 60) || '';
      const url = proy.acf?.url_proyecto || '#';
      const urlClean = url.replace(/https?:\/\//, '');

      // Imagen: ACF, featured media, o primera img del contenido
      const imgFromContent = proy.content?.rendered?.match(/<img[^>]+src="([^"]+)"/)?.[1] || null;
      const acfImg = !Array.isArray(proy.acf) ? proy.acf?.imagen_proyecto : null;
      const img = acfImg
     || proy._embedded?.['wp:featuredmedia']?.[0]?.source_url
     || imgFromContent
     || null;

      // Si hay imagen, mostramos preview real; si no, mock de texto
      const deviceBody = img
        ? `<div class="port-device-body" style="padding:0;overflow:hidden">
            <img src="${img}" alt="${proy.title.rendered}" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:0 0 8px 8px;">
           </div>`
        : `<div class="port-device-body">
            <div>
              <div class="port-mock-title">${proy.title.rendered}</div>
              <div class="port-mock-sub">${sector}</div>
            </div>
            <div class="port-mock-bottom">
              <div class="port-mock-cta">Ver proyecto</div>
              <div class="port-mock-line"></div>
            </div>
           </div>`;

      return `
        <div class="port-item">
          <span class="port-meta">${year} · ${sector.toUpperCase()}</span>
          <div class="port-device">
            <div class="port-device-bar">
              <span></span><span></span><span></span>
              <span class="url">${urlClean}</span>
            </div>
            ${deviceBody}
          </div>
          <div class="port-ov">
            <div class="port-tag">${sector}</div>
            <h4>${proy.title.rendered}</h4>
            <p>${excerpt}</p>
          </div>
        </div>
      `;
    }).join('');

    // Actualiza el contador de filtros
    const allFilter = document.querySelector('.port-filter.active');
    if (allFilter) allFilter.textContent = `Todos · ${proyectos.length.toString().padStart(2, '0')}`;

  } catch (err) {
    console.warn('Proyectos: usando contenido estático por defecto', err);
  }
}

/* ═══════════════════════════════════════════
   PRECIOS — Carga precios desde WordPress
   En WordPress: crear CPT con slug "precios"
   O usar ACF Options Page para los valores
═══════════════════════════════════════════ */
async function loadPrecios() {
  try {
    const res = await fetch(`${WP_API}/precios?per_page=10&status=publish`);
    if (!res.ok) throw new Error('API error');
    const precios = await res.json();
    if (precios.length === 0) return;

    // Actualiza los option-cards de la calculadora
    const tipoCards = document.querySelectorAll('#opt-tipo .option-card');
    const preciosTipo = precios.filter(p => p.acf?.tipo === 'proyecto');

    preciosTipo.forEach((precio, i) => {
      if (!tipoCards[i]) return;
      const label = tipoCards[i].querySelector('.oc-label');
      const price = tipoCards[i].querySelector('.oc-price');
      if (label) label.textContent = precio.title.rendered;
      if (price) price.textContent = `desde ${precio.acf?.precio || '—'} €`;
      tipoCards[i].dataset.val = precio.acf?.precio || tipoCards[i].dataset.val;
      tipoCards[i].dataset.label = precio.title.rendered;
    });

    calcUpdate(); // Recalcula el total con los nuevos precios

  } catch (err) {
    console.warn('Precios: usando contenido estático por defecto', err);
  }
}

/* ═══════════════════════════════════════════
   INIT — Ejecuta todo al cargar la página
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  loadServicios();
  loadProyectos();
  loadPrecios();
});

// También recarga cuando se navega a una sección (tu sistema de nav)
const _originalNav = window.nav;
window.nav = function(page) {
  if (typeof _originalNav === 'function') _originalNav(page);
  if (page === 'proyectos') loadProyectos();
  if (page === 'servicios') loadServicios();
};
