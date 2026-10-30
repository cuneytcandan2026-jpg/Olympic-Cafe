// Enhances the menu that is already in the HTML. Without this file the whole menu still shows and
// the category links still jump to each section.
(function () {
  const root = document.documentElement;
  const controls = document.getElementById('menu-controls');
  const results = document.getElementById('menu-results');
  const search = document.getElementById('menu-search');
  const select = document.getElementById('menu-category');
  const veg = document.getElementById('menu-veg');
  const reset = document.getElementById('menu-reset');
  const status = document.getElementById('menu-status');
  const empty = document.getElementById('menu-empty');
  const emptyText = document.getElementById('menu-empty-text');
  const emptyReset = document.getElementById('menu-empty-reset');
  const vegNote = document.getElementById('menu-veg-note');
  const chips = Array.from(document.querySelectorAll('[data-chip]'));
  const sections = Array.from(document.querySelectorAll('[data-category]'));
  const total = document.querySelectorAll('[data-search]').length;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const nameOf = (id) => select.querySelector(`option[value="${id}"]`).textContent;
  const validCategory = (id) => sections.some((s) => s.id === id);

  let category = '';

  function measureControls() {
    const stuck = getComputedStyle(controls).position === 'sticky';
    root.style.setProperty('--sticky-h', stuck ? `${controls.offsetHeight}px` : '0px');
  }

  // Lines the results up under the sticky bars. Never sends the visitor back to the top of the page.
  function alignResults(smooth) {
    const styles = getComputedStyle(root);
    const offset = parseFloat(styles.scrollPaddingTop) || 0;
    const top = results.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
  }

  function isPastResults() {
    return results.getBoundingClientRect().top < controls.getBoundingClientRect().bottom - 1;
  }

  function plural(n) {
    return `${n} ${n === 1 ? 'item' : 'items'}`;
  }

  function describe(count, words) {
    const scope = category ? `in ${nameOf(category)}` : 'in all categories';
    const kind = veg.checked ? 'vegetarian ' : '';
    if (words.length) return `${count ? plural(count).replace(' ', ` ${kind}`) : `No ${kind}items`} matching "${search.value.trim()}" ${scope}.`;
    if (veg.checked) return `${count ? plural(count).replace(' ', ` ${kind}`) : `No ${kind}items`} ${scope}.`;
    return category ? `Showing ${plural(count)} in ${nameOf(category)}.` : `Showing all ${plural(total)}.`;
  }

  function apply() {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;

    sections.forEach((section) => {
      let inSection = 0;
      const inScope = !category || section.id === category;
      section.querySelectorAll('[data-search]').forEach((item) => {
        const show = inScope
          && (!veg.checked || item.dataset.veg === '1')
          && words.every((w) => item.dataset.search.includes(w));
        item.hidden = !show;
        if (show) inSection += 1;
      });
      section.hidden = inSection === 0;
      count += inSection;
    });

    status.textContent = describe(count, words);
    vegNote.hidden = !veg.checked;

    const filtered = Boolean(words.length || veg.checked || category);
    reset.classList.toggle('hidden', !filtered);
    empty.hidden = count > 0;
    if (count === 0) {
      emptyText.textContent = veg.checked && category
        ? `No vegetarian-labelled items in ${nameOf(category)}. Try all categories, or show the full menu.`
        : 'Try a different word, or show the full menu again.';
    }

    select.value = category;
    chips.forEach((chip) => {
      const active = chip.dataset.chip === category;
      if (active) {
        chip.setAttribute('aria-current', 'true');
        // Scrolls only the chip row, never the page.
        if (chip.offsetParent) chip.parentElement.scrollLeft = chip.offsetLeft - chip.parentElement.offsetLeft - 16;
      } else {
        chip.removeAttribute('aria-current');
      }
    });
    measureControls();
  }

  function updateUrl(push) {
    const url = category ? `#${category}` : `${location.pathname}${location.search}`;
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  function chooseCategory(id, options = {}) {
    category = id;
    // Picking a category means browsing it, so an earlier search shouldn't silently narrow it.
    search.value = '';
    apply();
    updateUrl(options.push !== false);
    alignResults(options.smooth !== false);
  }

  function resetAll() {
    category = '';
    search.value = '';
    veg.checked = false;
    apply();
    updateUrl(false);
    if (isPastResults()) alignResults(false);
    search.focus();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      chooseCategory(chip.dataset.chip);
    });
  });
  select.addEventListener('change', () => chooseCategory(select.value));

  // Search always covers the whole menu. The category control shows that by going back to "All categories".
  search.addEventListener('input', () => {
    if (category) {
      category = '';
      updateUrl(false);
    }
    apply();
    if (isPastResults()) alignResults(false);
  });
  veg.addEventListener('change', () => {
    apply();
    if (isPastResults()) alignResults(false);
  });
  document.getElementById('menu-form').addEventListener('submit', (e) => e.preventDefault());
  reset.addEventListener('click', resetAll);
  emptyReset.addEventListener('click', resetAll);

  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (validCategory(id)) {
      category = id;
      search.value = '';
      apply();
      alignResults(false);
    } else if (!id || id === 'menu-results') {
      category = '';
      apply();
    }
  }
  window.addEventListener('hashchange', fromHash);

  if ('ResizeObserver' in window) new ResizeObserver(measureControls).observe(controls);
  window.addEventListener('resize', measureControls);

  // A browser may restore a typed search on reload, so read it before the first render.
  fromHash();
})();
