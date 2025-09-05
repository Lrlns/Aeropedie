<script>
  const trigger = document.querySelector('.search-trigger');
  const dialog  = document.getElementById('searchDialog');
  const form    = document.getElementById('searchForm');
  const closeBtn= dialog.querySelector('.close');

  trigger.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    // focus sur l'input
    setTimeout(() => dialog.querySelector('input').focus(), 0);
  });

  closeBtn.addEventListener('click', () => dialog.close());

  // branche la vraie action de recherche ici
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(form).get('q') || '';
    if (!q.trim()) return dialog.close();

    // OPTION 1 : redirection vers ta page de résultats
    window.location.href = '/recherche?q=' + encodeURIComponent(q);

    // OPTION 2 : si tu as déjà une fonction JS
    // doSearch(q);

    dialog.close();
  });
</script>
