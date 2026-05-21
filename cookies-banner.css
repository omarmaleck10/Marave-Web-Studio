/* ═══════════════════════════════════════════
   MARAVE WEB STUDIO — Cookie Consent Banner
═══════════════════════════════════════════ */

(function() {

  const COOKIE_KEY = 'marave_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(COOKIE_KEY); } catch(e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(COOKIE_KEY, val); } catch(e) {}
  }

  function removeBanner() {
    const b = document.getElementById('cookie-banner');
    if (b) { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); }
  }

  function showPreferences() {
    document.getElementById('cookie-banner-main').style.display = 'none';
    document.getElementById('cookie-banner-prefs').style.display = 'block';
  }

  function acceptAll() {
    setConsent('all');
    removeBanner();
  }

  function rejectAll() {
    setConsent('essential');
    removeBanner();
  }

  function savePreferences() {
    const analytics = document.getElementById('cb-analytics')?.checked;
    const marketing = document.getElementById('cb-marketing')?.checked;
    if (analytics && marketing) setConsent('all');
    else if (!analytics && !marketing) setConsent('essential');
    else setConsent('partial');
    removeBanner();
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
      <div id="cookie-banner-main">
        <div class="cb-text">
          <div class="cb-title">🍪 Usamos cookies</div>
          <p>Utilizamos cookies técnicas propias para el funcionamiento de la web. No usamos cookies de seguimiento ni publicidad. Puedes aceptarlas, rechazarlas o personalizar tu elección. <a href="/cookies" class="cb-link">Política de cookies</a></p>
        </div>
        <div class="cb-actions">
          <button class="cb-btn cb-reject" onclick="rejectAll()">Rechazar</button>
          <button class="cb-btn cb-prefs" onclick="showPreferences()">Personalizar</button>
          <button class="cb-btn cb-accept" onclick="acceptAll()">Aceptar todo</button>
        </div>
      </div>
      <div id="cookie-banner-prefs" style="display:none">
        <div class="cb-text">
          <div class="cb-title">Personalizar cookies</div>
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies esenciales</span>
              <span class="cb-pref-desc">Necesarias para el funcionamiento de la web. No se pueden desactivar.</span>
            </div>
            <div class="cb-toggle cb-toggle-on">Siempre activas</div>
          </div>
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies analíticas</span>
              <span class="cb-pref-desc">Nos ayudan a entender cómo usas la web para mejorarla.</span>
            </div>
            <label class="cb-switch">
              <input type="checkbox" id="cb-analytics">
              <span class="cb-slider"></span>
            </label>
          </div>
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies de marketing</span>
              <span class="cb-pref-desc">Permiten mostrar publicidad relevante en otras webs.</span>
            </div>
            <label class="cb-switch">
              <input type="checkbox" id="cb-marketing">
              <span class="cb-slider"></span>
            </label>
          </div>
        </div>
        <div class="cb-actions">
          <button class="cb-btn cb-reject" onclick="rejectAll()">Rechazar todo</button>
          <button class="cb-btn cb-accept" onclick="savePreferences()">Guardar preferencias</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.style.opacity = '1', 100);
  }

  // Expose functions globally
  window.acceptAll = acceptAll;
  window.rejectAll = rejectAll;
  window.showPreferences = showPreferences;
  window.savePreferences = savePreferences;

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    if (!getConsent()) createBanner();
  });

})();
