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


// Effet “zoom + ombre” au survol/focus des cartes .histoire > a
(function () {
  const cards = document.querySelectorAll('.histoire > a');
  if (!cards.length) return;

  const add  = el => el.classList.add('is-hovered');
  const remove = el => el.classList.remove('is-hovered');

  cards.forEach(card => {
    // Survol souris
    card.addEventListener('mouseenter', () => add(card));
    card.addEventListener('mouseleave', () => remove(card));

    // Clavier (Tab) = même effet
    card.addEventListener('focusin',  () => add(card));
    card.addEventListener('focusout', () => remove(card));

    // Touch (petit “tap” visuel)
    card.addEventListener('touchstart', () => {
      add(card);
      setTimeout(() => remove(card), 150);
    }, {passive:true});
  });
})();

