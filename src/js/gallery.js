// Uses the native <dialog>: when closed it is hidden from keyboard and screen readers, when open the
// rest of the page is inert and Escape works. Without JS each photo is a plain link to the larger image.
(function () {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const links = Array.from(document.querySelectorAll('.gallery-link'));
  let current = 0;
  let opener = null;

  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.src = link.dataset.full;
    image.alt = `${link.dataset.label} at Olympic Cafe`;
    caption.textContent = `${link.dataset.label} (${current + 1} of ${links.length})`;
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
    if (!e.target.closest('button, img')) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    if (opener) {
      // Back on whichever photo was last viewed, so a keyboard user keeps their place.
      links[current].focus();
      opener = null;
    }
  });

  // Keep Tab inside the dialog's controls rather than letting it reach the browser chrome and back.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const buttons = Array.from(dialog.querySelectorAll('button'));
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
