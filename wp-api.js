/**
 * Marave Web Studio — WordPress API Connector v3
 * Caché local, slugs SEO, meta tags dinámicos
 */

const WP_API = 'https://cms.maravewebstudio.com/wp-json/wp/v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCache(key) {
  try {
    const item = sessionStorage.getItem('mws_' + key);
    if (!item) return null;
    const { data, ts } = JSON.parse(item);
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem('mws_' + key); return null; }
    return data;
  } catch(e) { return null; }
}

function setCache(key, data) {
  try { sessionStorage.setItem('mws_' + key, JSON.stringify({ data, ts: Date.now() })); } catch(e) {}
}

async function fetchWithCache(url, cacheKey) {
  const cached = getCache(cacheKey);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

/* ── BLOG POSTS ── */
async function loadBlogPosts(gridId = 'blog-grid', limit = 3) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  try {
    const posts = await fetchWithCache(
      `${WP_API}/posts?_embed&per_page=${limit}&status=publish`,
      `posts_${limit}`
    );

    if (!posts || posts.length === 0) {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:3rem;">No hay artículos publicados aún.</p>';
      return;
    }

    grid.innerHTML = posts.map(post => {
      const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
      const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
      const readTime = Math.max(1, Math.round(words / 200));
      const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 120) + '…';
      const link = `/blog/${post.slug}/`;

      return `<article class="blog-card" itemscope itemtype="https://schema.org/Article">
        <a href="${link}" class="blog-thumb" style="${img ? `background-image:url('${img}');background-size:cover;background-position:center` : ''}" aria-label="${post.title.rendered}">
          <span class="blog-thumb-label">${cat}</span>
        </a>
        <div>
          <div class="blog-meta"><span class="blog-cat">${cat}</span><span>${readTime} min</span></div>
          <h3 itemprop="headline"><a href="${link}" style="color:inherit">${post.title.rendered}</a></h3>
          <p>${excerpt}</p>
          <a href="${link}" class="blog-read"><span>Leer artículo</span><span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    }).join('');

    // Update loading indicator if present
    const loading = document.getElementById('port-loading');
    if (loading) loading.remove();

  } catch(err) {
    console.warn('Blog: error cargando posts', err);
    if (grid) grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:3rem;">Error cargando artículos. <a href="#" onclick="location.reload()" style="color:var(--accent)">Reintentar</a></p>';
  }
}

/* ── ARTÍCULO ── */
async function loadArticulo() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  let apiUrl = null;

  // Slug URL: /blog/mi-articulo/
  const slugMatch = path.match(/\/blog\/([^/]+)\/?$/);
  if (slugMatch?.[1]) {
    apiUrl = `${WP_API}/posts?slug=${slugMatch[1]}&_embed`;
  }
  // Legacy ID URL: /articulo/?id=X → redirect to slug
  else if (params.get('id')) {
    try {
      const r = await fetch(`${WP_API}/posts/${params.get('id')}?_fields=slug`);
      if (r.ok) {
        const p = await r.json();
        if (p.slug) {
          window.history.replaceState(null, '', `/blog/${p.slug}/`);
          apiUrl = `${WP_API}/posts?slug=${p.slug}&_embed`;
        }
      }
    } catch(e) {}
    if (!apiUrl) apiUrl = `${WP_API}/posts/${params.get('id')}?_embed`;
  }

  if (!apiUrl) return;

  try {
    const raw = await fetchWithCache(apiUrl, 'art_' + (slugMatch?.[1] || params.get('id')));
    const post = Array.isArray(raw) ? raw[0] : raw;
    if (!post) throw new Error('Post not found');

    const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const cat = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
    const words = post.content.rendered.replace(/<[^>]+>/g, '').split(' ').length;
    const readTime = Math.max(1, Math.round(words / 200));
    const date = new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const canonicalUrl = `https://www.maravewebstudio.com/blog/${post.slug}/`;
    const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 155);

    // DOM updates
    document.title = `${post.title.rendered} — Marave Web Studio`;

    const setMeta = (sel, val, attr='content') => { let m=document.querySelector(sel); if(!m){m=document.createElement('meta'); const [a,v]=sel.includes('property')?['property',sel.match(/property="([^"]+)"/)?.[1]]:['name',sel.match(/name="([^"]+)"/)?.[1]]; m.setAttribute(a,v); document.head.appendChild(m); } m.setAttribute(attr, val); };
    setMeta('meta[name="description"]', excerpt);
    setMeta('meta[property="og:title"]', `${post.title.rendered} — Marave Web Studio`);
    setMeta('meta[property="og:description"]', excerpt);
    setMeta('meta[property="og:url"]', canonicalUrl);
    if (img) setMeta('meta[property="og:image"]', img);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;

    const el = id => document.getElementById(id);
    if (el('article-cat')) el('article-cat').textContent = cat;
    if (el('article-cat-label')) el('article-cat-label').textContent = cat;
    if (el('article-title')) el('article-title').innerHTML = post.title.rendered;
    if (el('article-date')) el('article-date').textContent = date;
    if (el('article-time')) el('article-time').textContent = `${readTime} min de lectura`;
    if (el('article-body')) el('article-body').innerHTML = post.content.rendered;

    if (img) {
      const hero = el('article-hero-img');
      if (hero) { hero.style.backgroundImage = `url('${img}')`; hero.style.display = 'block'; hero.setAttribute('aria-label', post.title.rendered); }
    }

    // Add JSON-LD for article
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Article",
      "headline": post.title.rendered, "description": excerpt,
      "url": canonicalUrl, "datePublished": post.date, "dateModified": post.modified,
      "image": img || 'https://www.maravewebstudio.com/og-image.jpg',
      "author": {"@type":"Person","name":"Omar Maleck","url":"https://www.maravewebstudio.com/nosotros/"},
      "publisher": {"@type":"Organization","name":"Marave Web Studio","logo":{"@type":"ImageObject","url":"https://www.maravewebstudio.com/og-image.jpg"}},
      "mainEntityOfPage": {"@type":"WebPage","@id": canonicalUrl}
    });
    document.head.appendChild(ld);

  } catch(err) {
    const title = document.getElementById('article-title');
    if (title) title.textContent = 'Artículo no encontrado';
    console.warn('Error cargando artículo:', err);
  }
}

/* ── PROYECTOS ── */
async function loadProyectos(gridId = 'port-grid') {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  try {
    const proyectos = await fetchWithCache(
      `${WP_API}/proyectos?_embed&per_page=12&status=publish`,
      'proyectos'
    );

    const loading = document.getElementById('port-loading');

    if (!proyectos || proyectos.length === 0) {
      if (loading) loading.textContent = 'No hay proyectos publicados aún.';
      return;
    }

    if (loading) loading.remove();

    grid.innerHTML = proyectos.map(proy => {
      const sector = proy.acf?.sector || proy._embedded?.['wp:term']?.[0]?.[0]?.name || 'Proyecto';
      const year = new Date(proy.date).getFullYear();
      const excerpt = proy.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 80) || '';
      const url = proy.acf?.url_proyecto || '#';
      const urlClean = url.replace(/https?:\/\//, '').replace(/\/$/, '');
      const acfImg = !Array.isArray(proy.acf) ? proy.acf?.imagen_proyecto : null;
      // Image: ACF field → featured media → first image in content (fallback)
      const featuredImg = proy._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
      let contentImg = null;
      if (!featuredImg && proy.content?.rendered) {
        const m = proy.content.rendered.match(/src="([^"]+\.(png|jpg|jpeg|webp))"/i);
        if (m) contentImg = m[1];
      }
      const img = acfImg || featuredImg || contentImg || null;

      const deviceBody = img
        ? `<div class="port-device-body" style="padding:0;overflow:hidden;"><img src="${img}" alt="${proy.title.rendered}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:top;"></div>`
        : `<div class="port-device-body"><div><div class="port-mock-title">${proy.title.rendered}</div><div class="port-mock-sub">${sector} · ${year}</div></div><div><div class="port-mock-cta">Ver proyecto</div></div></div>`;

      const cat = sector.toLowerCase().includes('app') ? 'app' : sector.toLowerCase().includes('market') ? 'marketing' : 'web';
      const itemHtml = `<div class="port-item" data-cat="${cat}">
        <div class="port-device">
          <div class="port-device-bar"><span></span><span></span><span></span><span class="url">${urlClean}</span></div>
          ${deviceBody}
        </div>
        <div class="port-ov">
          <div class="port-tag">${sector}</div>
          <h3>${proy.title.rendered}</h3>
          <p>${excerpt}</p>
        </div>
        ${url !== '#' ? `<div class="port-url-badge">Ver web ↗</div>` : ''}
      </div>`;
      return url !== '#'
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="port-item-link" aria-label="Ver proyecto: ${proy.title.rendered}">${itemHtml}</a>`
        : itemHtml;
    }).join('');

    const counter = document.getElementById('port-counter');
    if (counter) counter.textContent = `· ${proyectos.length.toString().padStart(2, '0')}`;

  } catch(err) {
    console.warn('Proyectos: error', err);
    const loading = document.getElementById('port-loading');
    if (loading) loading.textContent = 'Error cargando proyectos.';
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') loadBlogPosts('blog-grid', 3);
  if (path === '/blog/' || path === '/blog') loadBlogPosts('blog-grid', 9);
  if (path.startsWith('/blog/') && path !== '/blog/') loadArticulo();
  if (path.includes('/proyectos')) loadProyectos('port-grid');
  if (path.includes('/articulo')) loadArticulo();
});
