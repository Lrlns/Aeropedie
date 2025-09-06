  // éléments
  const trigger = document.querySelector('.search-trigger');
  const panel   = document.getElementById('searchPanel');
  const dialog  = document.getElementById('searchDialog');

  const panelForm  = document.getElementById('panelSearchForm');
  const panelInput = document.getElementById('panelInput');
  const panelBack  = document.getElementById('panelBack');

  const dialogForm  = document.getElementById('dialogSearchForm');
  const dialogInput = document.getElementById('dialogInput');
  const dialogClose = dialog.querySelector('.close');

  // seuil mobile/desktop (ajuste si besoin)
  const isMobile = () => window.matchMedia('(max-width: 700px)').matches;

  // ouvrir selon la taille
  function openSearch() {
    if (isMobile()) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open','');
      setTimeout(() => dialogInput && dialogInput.focus(), 0);
    } else {
      panel.hidden = false;
      setTimeout(() => panelInput && panelInput.focus(), 0);
    }
  }

  // fermer
  function closeSearch() {
    if (!isMobile()) {
      panel.hidden = true;
    } else {
      dialog.close();
    }
  }

  // lancement
  trigger.addEventListener('click', openSearch);
  panelBack.addEventListener('click', closeSearch);
  dialogClose.addEventListener('click', closeSearch);

  // soumission (même destination pour les deux)
  function onSubmit(e, inputEl) {
    e.preventDefault();
    const q = (inputEl.value || '').trim();
    if (!q) { closeSearch(); return; }
    // Redirection vers ta page de résultats :
    window.location.href = '/recherche?q=' + encodeURIComponent(q);
  }

  panelForm.addEventListener('submit', (e) => onSubmit(e, panelInput));
  dialogForm.addEventListener('submit', (e) => onSubmit(e, dialogInput));

  // suggestions (click sur un item remplit et soumet)
  function wireSuggestions(listEl, inputEl, formEl) {
    listEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-q]');
      if (!btn) return;
      inputEl.value = btn.dataset.q;
      formEl.requestSubmit();     // soumet le formulaire
    });
  }
  wireSuggestions(document.getElementById('popularList'), panelInput, panelForm);
  wireSuggestions(document.getElementById('popularListMobile'), dialogInput, dialogForm);

  // ESC pour fermer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // si on change la taille pendant que c'est ouvert, on ferme proprement
  window.addEventListener('resize', () => {
    if (!panel.hidden && isMobile()) panel.hidden = true;
    if (dialog.open && !isMobile()) dialog.close();
  });
