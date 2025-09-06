// éléments
const trigger = document.querySelector('.search-trigger');
const dialog  = document.getElementById('searchDialog');
const dialogForm  = document.getElementById('searchForm');
const dialogInput = dialog?.querySelector('input[name="q"]');
const dialogClose = dialog?.querySelector('.close');
const hero    = document.querySelector('.hero');

// ouvrir le plein écran
function openSearch() {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
  if (hero) hero.hidden = true;                 // cache la barre
  document.body.style.overflow = 'hidden';      // bloque le scroll du fond
  setTimeout(() => dialogInput?.focus(), 0);
}

// fermer le plein écran
function closeSearch() {
  if (!dialog) return;
  dialog.close();
}

// events
trigger?.addEventListener('click', openSearch);
dialogClose?.addEventListener('click', closeSearch);

// fermer quand le dialog se ferme (Esc, submit, etc.)
dialog?.addEventListener('close', () => {
  if (hero) hero.hidden = false;                // ré-affiche la barre
  document.body.style.overflow = '';            // réactive le scroll
});

// fermer au clic sur l’arrière-plan
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) closeSearch();
});

// Esc (par sécurité selon navigateurs)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog?.open) closeSearch();
});

// soumission
dialogForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (dialogInput?.value || '').trim();
  if (!q) return closeSearch();
  window.location.href = '/recherche?q=' + encodeURIComponent(q);
  closeSearch();
});

// “Recherches populaires” (boutons data-q dans le dialog)
dialog?.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-q]');
  if (!btn) return;
  if (dialogInput) dialogInput.value = btn.dataset.q || '';
  dialogForm?.requestSubmit();
});


// Menu "Explorer"
(function () {
  const btn  = document.getElementById('exploreBtn');
  const menu = document.getElementById('exploreMenu');
  if (!btn || !menu) return;

  function open()  { menu.hidden = false; btn.setAttribute('aria-expanded','true'); }
  function close() { menu.hidden = true;  btn.setAttribute('aria-expanded','false'); }
  function toggle(){ menu.hidden ? open() : close(); }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Fermer au clic à l’extérieur
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close();
  });

  // Echap pour fermer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Focus clavier : Tab sortant ferme le menu
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') close();
  });
})();




// Cartes images pour .liste (sauf le lien-titre) + overlay différé
(function () {
  const cards = document.querySelectorAll('.liste > a:not(.title)');
  if (!cards.length) return;

  // Effet "vient vers nous" + image en background
  cards.forEach(card => {
    const img = card.querySelector('img');
    if (img && img.src) {
      card.style.backgroundImage = `url("${img.src}")`;
      img.style.opacity = '0';
      img.style.pointerEvents = 'none';
      img.setAttribute('aria-hidden', 'true');
    }

    const on = () => card.classList.add('is-hovered');
    const off = () => card.classList.remove('is-hovered');

    card.addEventListener('mouseenter', on);
    card.addEventListener('mouseleave', off);
    card.addEventListener('focusin', on);
    card.addEventListener('focusout', off);
    card.addEventListener('touchstart', () => {
      on();
      setTimeout(off, 150);
    }, { passive: true });
  });

  // ---------- Overlay différé ----------
  let hoverTimer = null;
  let overlayEl = null;
  const SHOW_DELAY = 3200; // ms : "quelques secondes" -> ~1.2s, ajuste si tu veux

  // helpers
  function closeOverlay() {
    if (!overlayEl) return;
    overlayEl.classList.remove('image-overlay--open');
    // petite tempo pour laisser la transition se finir
    setTimeout(() => {
      overlayEl?.remove();
      overlayEl = null;
      document.body.style.overflow = ''; // réactive le scroll
    }, 200);
  }

  function openOverlay(fromCard) {
    // ferme l'existant
    if (overlayEl) closeOverlay();

    const title = (fromCard.querySelector('span')?.textContent || '').trim();
    const desc  = (fromCard.dataset.desc || fromCard.querySelector('img')?.alt || title || '').trim();

    // structure du panel
    overlayEl = document.createElement('div');
    overlayEl.className = 'image-overlay';
    overlayEl.innerHTML = `
      <div class="image-overlay__backdrop" part="backdrop"></div>
      <aside class="image-overlay__panel" role="dialog" aria-modal="true" aria-label="${title || 'Détail'}">
        ${title ? `<h3 class="image-overlay__title">${title}</h3>` : ''}
        ${desc ? `<p class="image-overlay__desc">${desc}</p>` : ''}
      </aside>
    `;
    document.body.appendChild(overlayEl);
    document.body.style.overflow = 'hidden'; // empêche le scroll du fond

    // montrer le panneau (slide-in)
    requestAnimationFrame(() => {
      overlayEl.classList.add('image-overlay--open');
    });

    const panel = overlayEl.querySelector('.image-overlay__panel');
    const backdrop = overlayEl.querySelector('.image-overlay__backdrop');

    // fermeture : cliquer sur le backdrop
    backdrop.addEventListener('click', closeOverlay);

    // fermeture : sortir la souris du panneau (après être entré)
    let inside = false;
    panel.addEventListener('mouseenter', () => { inside = true; });
    panel.addEventListener('mouseleave', () => {
      if (inside) closeOverlay();
    });

    // fermeture : touche Esc
    window.addEventListener('keydown', onEscOnce, { once: true });
    function onEscOnce(e) { if (e.key === 'Escape') closeOverlay(); }
  }

  // Démarre le timer au survol prolongé
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => openOverlay(card), SHOW_DELAY);
    });
    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      // ne ferme pas ici : on veut que ça reste si l'overlay est ouvert
    });

    // clavier : si on garde le focus assez longtemps, ouvre aussi
    card.addEventListener('focusin', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => openOverlay(card), SHOW_DELAY);
    });
    card.addEventListener('focusout', () => clearTimeout(hoverTimer));

    // mobile : long press approximatif
    let touchTimer = null;
    card.addEventListener('touchstart', () => {
      touchTimer = setTimeout(() => openOverlay(card), SHOW_DELAY);
    }, { passive: true });
    card.addEventListener('touchend',   () => clearTimeout(touchTimer));
    card.addEventListener('touchmove',  () => clearTimeout(touchTimer));
    card.addEventListener('touchcancel',() => clearTimeout(touchTimer));
  });
})();
