/**
 * Marave Web Studio — WordPress API Connector
 * Compatible con estructura multipágina
 */

const WP_API = 'https://cms.maravewebstudio.com/wp-json/wp/v2';

/* ═══════════════════════════════════════════
   BLOG HOME — Carga los 3 últimos posts
   Usado en index.html y blog.html
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

      return `
        <article class="blog-card">
          <div class="blog-thumb" ${img ? `style="background-image:url('${img}');background-size:cover;background-position:center"` : ''}>
            <span class="blog-thumb-label">${cat}</span>
          </div>
          <div>
            <div class="blog-meta"><span class="blog-cat">${cat}</span><span>${readTime} min</span></div>
            <h4>${post.title.rendered}</h4>
            <p>${excerpt}</p>
            <a href="/articulo.html?id=${post.id}" class="blog-read"><span>Leer artículo</span><span>→</span></a>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.warn('Blog: usando contenido estático', err);
  }
}

/* ═══════════════════════════════════════════
   ARTÍCULO — Carga un post por ID desde URL
   Usado en articulo.html
═══════════════════════════════════════════ */
async function loadArticulo() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  if (!postId) return;

  try {
    const res = await fetch(`${WP_API}/posts/${postId}?_embed`);
    if (!res.ok) throw new Error('API error');
    const post = await res.json();

    const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
    const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
    const readTime = Math.max(1, Math.round(words / 200));
    const date = new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    document.title = `${post.title.rendered} — Marave Web Studio`;

    const el = id => document.getElementById(id);
    if (el('article-cat')) el('article-cat').textContent = cat;
    if (el('article-title')) el('article-title').innerHTML = post.title.rendered;
    if (el('article-date')) el('article-date').textContent = date;
    if (el('article-time')) el('article-time').textContent = `${readTime} min de lectura`;
    if (el('article-body')) el('article-body').innerHTML = post.content.rendered;

    const heroImg = document.getElementById('article-hero-img');
    if (heroImg && img) {
      heroImg.style.backgroundImage = `url('${img}')`;
      heroImg.style.display = 'block';
    }
  } catch (err) {
    console.warn('Error cargando artículo:', err);
  }
}

/* ═══════════════════════════════════════════
   PROYECTOS — Carga proyectos desde WordPress
   Usado en proyectos.html e index.html
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
      const sector = proy.acf?.sector || proy._embedded?.['wp:term']?.[0]?.[0]?.name || 'Proyecto';
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
    console.warn('Proyectos: usando contenido estático', err);
  }
}

/* ═══════════════════════════════════════════
   INIT — Detecta en qué página estamos
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/' || path.includes('index')) {
    loadBlogPosts('blog-grid', 3);
  }
  if (path.includes('blog')) {
    loadBlogPosts('blog-grid', 9);
  }
  if (path.includes('proyectos')) {
    loadProyectos('port-grid');
  }
  if (path.includes('articulo')) {
    loadArticulo();
  }
});
