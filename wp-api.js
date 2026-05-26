/**
 * Marave Web Studio — WordPress API Connector
 * Soporta URLs por slug: /blog/mi-articulo/
 * y por ID: /articulo/?id=1
 */

const WP_API = 'https://cms.maravewebstudio.com/wp-json/wp/v2';

/* ═══════════════════════════════════════════
   BLOG — Carga artículos
═══════════════════════════════════════════ */
async function loadBlogPosts(gridId = 'blog-grid', limit = 3) {
  try {
    const res = await fetch(`${WP_API}/posts?_embed&per_page=${limit}&status=publish`);
    if (!res.ok) throw new Error('API error');
    const posts = await res.json();
    const grid = document.getElementById(gridId);
    if (!grid || posts.length === 0) return;

    grid.innerHTML = posts.map(post => {
      const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
      const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
      const readTime = Math.max(1, Math.round(words / 200));
      const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 120) + '…';
      // Enlace con slug: /blog/mi-articulo/
      const link = `/blog/${post.slug}/`;

      return `
        <article class="blog-card">
          <div class="blog-thumb" ${img ? `style="background-image:url('${img}');background-size:cover;background-position:center"` : ''}>
            <span class="blog-thumb-label">${cat}</span>
          </div>
          <div>
            <div class="blog-meta"><span class="blog-cat">${cat}</span><span>${readTime} min</span></div>
            <h4>${post.title.rendered}</h4>
            <p>${excerpt}</p>
            <a href="${link}" class="blog-read"><span>Leer artículo</span><span>→</span></a>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.warn('Blog: error cargando posts', err);
  }
}

/* ═══════════════════════════════════════════
   ARTÍCULO — Carga por slug o por ID
═══════════════════════════════════════════ */
async function loadArticulo() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  let apiUrl = null;

  // Modo slug: /blog/mi-articulo/
  const slugMatch = path.match(/\/blog\/([^/]+)\/?$/);
  if (slugMatch && slugMatch[1]) {
    apiUrl = `${WP_API}/posts?slug=${slugMatch[1]}&_embed`;
  }
  // Modo ID: /articulo/?id=1 (fallback)
  else if (params.get('id')) {
    apiUrl = `${WP_API}/posts/${params.get('id')}?_embed`;
  }

  if (!apiUrl) return;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    // Si es array (búsqueda por slug), coge el primero
    const post = Array.isArray(data) ? data[0] : data;
    if (!post) throw new Error('Post no encontrado');

    const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
    const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
    const readTime = Math.max(1, Math.round(words / 200));
    const date = new Date(post.date).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Título dinámico
    document.title = `${post.title.rendered} — Marave Web Studio`;

    // Meta description dinámica
    const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 155);
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = excerpt;

    // OG tags dinámicos
    const ogTitle = document.querySelector('meta[property="og:title"]') || (() => { const m = document.createElement('meta'); m.setAttribute('property','og:title'); document.head.appendChild(m); return m; })();
    ogTitle.content = `${post.title.rendered} — Marave Web Studio`;

    const ogDesc = document.querySelector('meta[property="og:description"]') || (() => { const m = document.createElement('meta'); m.setAttribute('property','og:description'); document.head.appendChild(m); return m; })();
    ogDesc.content = excerpt;

    const ogUrl = document.querySelector('meta[property="og:url"]') || (() => { const m = document.createElement('meta'); m.setAttribute('property','og:url'); document.head.appendChild(m); return m; })();
    ogUrl.content = window.location.href;

    if (img) {
      const ogImg = document.querySelector('meta[property="og:image"]') || (() => { const m = document.createElement('meta'); m.setAttribute('property','og:image'); document.head.appendChild(m); return m; })();
      ogImg.content = img;
    }

    // Canonical dinámico
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;

    const el = id => document.getElementById(id);
    if (el('article-cat'))   el('article-cat').textContent = cat;
    if (el('article-title')) el('article-title').innerHTML = post.title.rendered;
    if (el('article-date'))  el('article-date').textContent = date;
    if (el('article-time'))  el('article-time').textContent = `${readTime} min de lectura`;
    if (el('article-body'))  el('article-body').innerHTML = post.content.rendered;

    const heroImg = document.getElementById('article-hero-img');
    if (heroImg && img) {
      heroImg.style.backgroundImage = `url('${img}')`;
      heroImg.style.display = 'block';
    }
  } catch (err) {
    const title = document.getElementById('article-title');
    if (title) title.textContent = 'Artículo no encontrado';
    console.warn('Error cargando artículo:', err);
  }
}

/* ═══════════════════════════════════════════
   PROYECTOS
═══════════════════════════════════════════ */
async function loadProyectos(gridId = 'port-grid') {
  try {
    const res = await fetch(`${WP_API}/proyectos?_embed&per_page=9&status=publish`);
    if (!res.ok) throw new Error('API error');
    const proyectos = await res.json();
    if (proyectos.length === 0) return;

    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = proyectos.map(proy => {
      const sector = proy.acf?.sector
        || proy._embedded?.['wp:term']?.[0]?.[0]?.name
        || 'Proyecto';
      const year = new Date(proy.date).getFullYear();
      const excerpt = proy.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 60) || '';
      const url = proy.acf?.url_proyecto || '#';
      const urlClean = url.replace(/https?:\/\//, '');
      const imgFromContent = proy.content?.rendered?.match(/<img[^>]+src="([^"]+)"/)?.[1] || null;
      const acfImg = !Array.isArray(proy.acf) ? proy.acf?.imagen_proyecto : null;
      const img = acfImg || proy._embedded?.['wp:featuredmedia']?.[0]?.source_url || imgFromContent || null;

      const deviceBody = img
        ? `<div class="port-device-body" style="padding:0;overflow:hidden"><img src="${img}" alt="${proy.title.rendered}" style="width:100%;height:100%;object-fit:cover;object-position:top;"></div>`
        : `<div class="port-device-body"><div><div class="port-mock-title">${proy.title.rendered}</div><div class="port-mock-sub">${sector}</div></div><div class="port-mock-bottom"><div class="port-mock-cta">Ver proyecto</div><div class="port-mock-line"></div></div></div>`;

      return `
        <div class="port-item">
          <span class="port-meta">${year} · ${sector.toUpperCase()}</span>
          <div class="port-device">
            <div class="port-device-bar"><span></span><span></span><span></span><span class="url">${urlClean}</span></div>
            ${deviceBody}
          </div>
          <div class="port-ov"><div class="port-tag">${sector}</div><h4>${proy.title.rendered}</h4><p>${excerpt}</p></div>
        </div>
      `;
    }).join('');

    const counter = document.getElementById('port-counter');
    if (counter) counter.textContent = `Todos · ${proyectos.length.toString().padStart(2, '0')}`;
  } catch (err) {
    console.warn('Proyectos: error cargando', err);
  }
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    loadBlogPosts('blog-grid', 3);
  }
  if (path === '/blog/' || path === '/blog') {
    loadBlogPosts('blog-grid', 9);
  }
  if (path.startsWith('/blog/') && path !== '/blog/') {
    loadArticulo();
  }
  if (path.includes('/proyectos')) {
    loadProyectos('port-grid');
  }
  if (path.includes('/articulo')) {
    loadArticulo();
  }
});
