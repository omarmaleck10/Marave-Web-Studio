/* ═══════════════════════════════════════════
   MARAVE WEB STUDIO — Cookie Consent Banner
═══════════════════════════════════════════ */
(function() {

  const KEY = 'marave_cookie_consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch(e) { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch(e) {} };

  function hide() {
    const banner = document.getElementById('cookie-banner');
    const overlay = document.getElementById('cookie-overlay');
    if (banner) { banner.classList.remove('visible'); setTimeout(() => banner.remove(), 400); }
    if (overlay) { overlay.classList.remove('visible'); setTimeout(() => overlay.remove(), 400); }
    document.body.style.overflow = '';
  }

  window.cbAcceptAll = function() { set('all'); hide(); };
  window.cbRejectAll = function() { set('essential'); hide(); };
  window.cbShowPrefs = function() {
    document.getElementById('cookie-banner-main').style.display = 'none';
    document.getElementById('cookie-banner-prefs').style.display = 'block';
  };
  window.cbSavePrefs = function() {
    const a = document.getElementById('cb-analytics')?.checked;
    const m = document.getElementById('cb-marketing')?.checked;
    set(a && m ? 'all' : (!a && !m ? 'essential' : 'partial'));
    hide();
  };

  function build() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cookie-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 10);

    // Banner
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
      <!-- MAIN -->
      <div id="cookie-banner-main">
        <div class="cb-header">
          <div class="cb-header-icon">🍪</div>
          <div class="cb-header-txt">
            <div class="cb-title">Privacidad y cookies</div>
            <div class="cb-subtitle">Marave Web Studio</div>
          </div>
        </div>
        <div class="cb-body">
          <p>Usamos cookies técnicas propias para el funcionamiento de la web. No utilizamos cookies de publicidad ni seguimiento externo. Puedes aceptarlas, rechazarlas o personalizar tu elección en cualquier momento.</p>
          <p style="margin-top:.8rem;font-size:.75rem;">Más información en nuestra <a href="/cookies" class="cb-link">política de cookies</a> y <a href="/privacidad" class="cb-link">política de privacidad</a>.</p>
        </div>
        <div class="cb-divider"></div>
        <div class="cb-actions">
          <button class="cb-btn cb-reject" onclick="cbRejectAll()">Solo esenciales</button>
          <button class="cb-btn cb-prefs" onclick="cbShowPrefs()">Personalizar</button>
          <button class="cb-btn cb-accept" onclick="cbAcceptAll()">Aceptar todo</button>
        </div>
        <div class="cb-note">Al continuar navegando aceptas las cookies esenciales.</div>
      </div>

      <!-- PREFERENCIAS -->
      <div id="cookie-banner-prefs">
        <div class="cb-header">
          <div class="cb-header-icon">⚙</div>
          <div class="cb-header-txt">
            <div class="cb-title">Personalizar cookies</div>
            <div class="cb-subtitle">Elige qué aceptas</div>
          </div>
        </div>
        <div class="cb-body">
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies esenciales</span>
              <span class="cb-pref-desc">Necesarias para el funcionamiento básico. No se pueden desactivar.</span>
            </div>
            <span class="cb-toggle-on">Siempre activas</span>
          </div>
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies analíticas</span>
              <span class="cb-pref-desc">Nos ayudan a entender cómo usas la web para mejorar la experiencia.</span>
            </div>
            <label class="cb-switch"><input type="checkbox" id="cb-analytics"><span class="cb-slider"></span></label>
          </div>
          <div class="cb-pref-item">
            <div class="cb-pref-info">
              <span class="cb-pref-name">Cookies de marketing</span>
              <span class="cb-pref-desc">Permiten mostrarte publicidad relevante en otras plataformas.</span>
            </div>
            <label class="cb-switch"><input type="checkbox" id="cb-marketing"><span class="cb-slider"></span></label>
          </div>
        </div>
        <div class="cb-divider"></div>
        <div class="cb-actions-prefs">
          <button class="cb-btn cb-reject" onclick="cbRejectAll()">Rechazar todo</button>
          <button class="cb-btn cb-accept" onclick="cbSavePrefs()">Guardar preferencias</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    document.body.style.overflow = 'hidden';
    setTimeout(() => banner.classList.add('visible'), 10);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!get()) build();
  });

})();
