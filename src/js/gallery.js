// Uses the native <dialog>: when closed it is hidden from keyboard and screen readers, when open the
// rest of the page is inert and Escape works. Without JS each photo is a plain link to the larger image.
(function () {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const menuLink = document.getElementById('lightbox-menu');
  const links = Array.from(document.querySelectorAll('.gallery-link'));
  let current = 0;
  let opener = null;

  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.src = link.dataset.full;
    image.alt = `${link.dataset.label} at Olympic Cafe`;
    caption.textContent = `${link.dataset.label} (${current + 1} of ${links.length})`;
    menuLink.hidden = !link.dataset.menu;
    if (link.dataset.menu) menuLink.href = `/menu.html#${link.dataset.menu}`;
  }

  links.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      opener = link;
      show(index);
      dialog.showModal();
      document.getElementById('lightbox-close').focus();
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
  document.getElementById('lightbox-next').addEventListener('click', () => show(current + 1));
  document.getElementById('lightbox-prev').addEventListener('click', () => show(current - 1));

  // A click on the backdrop lands on the dialog or its empty wrapper rather than on a control or the photo.
  dialog.addEventListener('click', (e) => {
    if (!e.target.closest('button, img, a')) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  // Swiping sideways on the photo moves between photos. The buttons do the same without a gesture.
  let swipeStart = null;
  image.addEventListener('touchstart', (e) => { swipeStart = e.changedTouches[0].clientX; }, { passive: true });
  image.addEventListener('touchend', (e) => {
    const distance = e.changedTouches[0].clientX - swipeStart;
    if (Math.abs(distance) > 50) show(current + (distance < 0 ? 1 : -1));
  }, { passive: true });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    if (opener) {
      // Back on whichever photo was last viewed, so a keyboard user keeps their place.
      links[current].focus();
      opener = null;
    }
  });

  // Keep Tab inside the dialog's controls and menu link rather than letting it reach the browser chrome and back.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const buttons = Array.from(dialog.querySelectorAll('button, a:not([hidden])'));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
