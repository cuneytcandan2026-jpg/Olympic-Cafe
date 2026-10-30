// The order pad: a list the customer keeps on their own phone, then shows at the counter, calls through or shares.
// It never sends anything to the cafe. Prices are always read from the menu on the page, never stored or shared,
// so they can't go stale or be changed by editing a link.
(function () {
  const dialog = document.getElementById('pad');
  const $ = (id) => document.getElementById(id);

  const STORE_KEY = 'olympic-order-pad';
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  const MAX_QTY = 20;
  const MAX_LINES = 60;
  const MAX_SPLIT = 12;

  const pence = (price) => Math.round(Number(price) * 100);
  const money = (p) => `£${(p / 100).toFixed(2)}`;

  // Everything orderable, read from the menu already in the page.
  const dishes = new Map();
  document.querySelectorAll('[data-category]').forEach((section) => {
    const addons = section.dataset.addons ? JSON.parse(section.dataset.addons) : [];
    section.querySelectorAll('[data-search]').forEach((el) => {
      const skip = (el.dataset.skip || '').split(',');
      const sizes = el.dataset.prices ? new Map(Object.entries(JSON.parse(el.dataset.prices)).map(([s, p]) => [s, pence(p)])) : null;
      dishes.set(el.id, {
        el,
        name: el.querySelector('h3').textContent,
        category: section.querySelector('h2').textContent,
        price: sizes ? null : pence(el.dataset.price),
        sizes,
        addons: new Map(addons.filter((a) => !skip.includes(a.id)).map((a) => [a.id, { label: a.label, price: pence(a.price) }])),
      });
    });
  });

  let lines = [];
  let undoLines = null;
  let split = 1;
  let pendingShared = null;
  let toastTimer = null;

  const keyOf = (line) => [line.id, line.size || '', line.addons.join('.')].join('|');
  const unitPrice = (line) => {
    const dish = dishes.get(line.id);
    const base = line.size ? dish.sizes.get(line.size) : dish.price;
    return line.addons.reduce((sum, a) => sum + dish.addons.get(a).price, base);
  };
  const lineTotal = (line) => unitPrice(line) * line.qty;
  const totalOf = (list) => list.reduce((sum, line) => sum + lineTotal(line), 0);
  const countOf = (list) => list.reduce((sum, line) => sum + line.qty, 0);
  const itemsText = (n) => `${n} ${n === 1 ? 'item' : 'items'}`;

  // The one gate for anything coming from storage or a link. Returns null if the dish or size doesn't exist.
  function clean({ id, size, addons, qty }) {
    const dish = dishes.get(id);
    const quantity = Math.min(Math.floor(Number(qty)), MAX_QTY);
    if (!dish || !(quantity >= 1)) return null;
    if (dish.sizes ? !dish.sizes.has(size) : size) return null;
    const known = [...new Set(Array.isArray(addons) ? addons : [])].filter((a) => dish.addons.has(a)).sort();
    return { id, size: dish.sizes ? size : undefined, addons: known, qty: quantity };
  }

  function merged(list) {
    const out = new Map();
    list.forEach((line) => {
      const existing = out.get(keyOf(line));
      if (existing) existing.qty = Math.min(existing.qty + line.qty, MAX_QTY);
      else if (out.size < MAX_LINES) out.set(keyOf(line), { ...line });
    });
    return [...out.values()];
  }

  // ---------- Storage. It may be blocked, so the pad must still work for this visit without it. ----------
  function save() {
    try {
      if (lines.length) window.localStorage.setItem(STORE_KEY, JSON.stringify({ at: Date.now(), lines }));
      else window.localStorage.removeItem(STORE_KEY);
    } catch (e) { /* Storage is blocked: the pad lasts until the page closes. */ }
  }
  function load() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORE_KEY));
      if (!saved || !Array.isArray(saved.lines)) return [];
      if (Date.now() - saved.at > MAX_AGE) {
        window.localStorage.removeItem(STORE_KEY);
        return [];
      }
      return merged(saved.lines.map(clean).filter(Boolean));
    } catch (e) {
      return [];
    }
  }

  // ---------- Shared links: /menu.html?pad=id~Size.addon*2,id*1 ----------
  function encode(list) {
    return list.map((l) => `${l.id}${l.size ? `~${l.size}` : ''}${l.addons.map((a) => `.${a}`).join('')}*${l.qty}`).join(',');
  }
  function decode(raw) {
    const parts = raw.split(',');
    const found = [];
    parts.slice(0, MAX_LINES).forEach((part) => {
      const m = /^([a-z0-9-]+)(?:~([A-Za-z]+))?((?:\.[a-z0-9-]+)*)\*(\d{1,3})$/.exec(part);
      const line = m && clean({ id: m[1], size: m[2], addons: m[3].split('.').filter(Boolean), qty: m[4] });
      if (line) found.push(line);
    });
    return { lines: merged(found), dropped: parts.length - found.length };
  }
  const shareUrl = () => `${location.origin}${location.pathname}?pad=${encode(lines)}`;

  // ---------- Drawing ----------
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function describe(line) {
    const dish = dishes.get(line.id);
    return [line.size, ...line.addons.map((a) => dish.addons.get(a).label)].filter(Boolean).join(', ');
  }

  function stepButton(act, key, symbol, label, disabled) {
    const button = el('button', 'pad-step', symbol);
    button.type = 'button';
    button.dataset.act = act;
    button.dataset.key = key;
    button.setAttribute('aria-label', label);
    button.disabled = Boolean(disabled);
    return button;
  }

  function drawLine(line) {
    const dish = dishes.get(line.id);
    const key = keyOf(line);
    const li = el('li', 'pad-line');

    const top = el('div', 'flex items-baseline gap-3');
    const title = el('p', 'font-semibold leading-snug', dish.name);
    const price = el('span', 'ml-auto whitespace-nowrap font-semibold text-brand-burgundy', money(lineTotal(line)));
    top.append(title, price);
    li.append(top);
    li.append(el('p', 'text-sm', [dish.category, line.size].filter(Boolean).join(', ')));

    const stepper = el('div', 'pad-stepper mt-1');
    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', `Quantity of ${dish.name}`);
    stepper.append(
      stepButton('dec', key, '−', line.qty === 1 ? `Remove ${dish.name}` : `One fewer ${dish.name}`),
      el('span', 'pad-qty', String(line.qty)),
      stepButton('inc', key, '+', `One more ${dish.name}`, line.qty >= MAX_QTY),
    );
    li.append(stepper);

    dish.addons.forEach((addon, id) => {
      const label = el('label', 'pad-addon');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = line.addons.includes(id);
      box.dataset.act = 'addon';
      box.dataset.key = key;
      box.dataset.addon = id;
      const words = el('span', '', `${addon.label} +${money(addon.price)}`);
      const who = el('span', 'sr-only', ` for ${dish.name}`);
      label.append(box, words, who);
      li.append(label);
    });
    return li;
  }

  function drawButtons() {
    const counts = new Map();
    lines.forEach((line) => {
      const key = `${line.id}|${line.size || ''}`;
      counts.set(key, (counts.get(key) || 0) + line.qty);
    });
    document.querySelectorAll('[data-add]').forEach((button) => {
      const dish = dishes.get(button.dataset.add);
      const size = button.dataset.size || '';
      const count = counts.get(`${button.dataset.add}|${size}`) || 0;
      const name = size ? `${dish.name}, ${size}` : dish.name;
      button.classList.toggle('is-on', count > 0);
      button.textContent = size ? (count ? `${size} ×${count}` : `+ ${size}`) : (count || '+');
      button.setAttribute('aria-label', count ? `Add another ${name}. ${count} on your order.` : `Add ${name} to your order`);
    });
  }

  function draw(focusSelector) {
    const count = countOf(lines);
    const total = totalOf(lines);

    const bar = $('pad-bar');
    bar.hidden = count === 0;
    document.body.classList.toggle('has-pad', count > 0);
    bar.textContent = `${itemsText(count)} · ${money(total)} · View`;
    bar.setAttribute('aria-label', `View your order: ${itemsText(count)}, estimated ${money(total)}`);

    $('pad-empty').hidden = count > 0;
    $('pad-filled').hidden = count === 0;
    $('pad-undo').hidden = !undoLines;
    $('pad-lines').replaceChildren(...lines.map(drawLine));
    $('pad-total').textContent = money(total);

    $('pad-split-count').textContent = String(split);
    $('pad-split-down').disabled = split <= 1;
    $('pad-split-up').disabled = split >= MAX_SPLIT;
    $('pad-split-each').hidden = split === 1;
    // Rounded up, so the shares always cover the total.
    $('pad-split-each').textContent = `About ${money(Math.ceil(total / split))} each`;

    drawButtons();
    save();
    if (focusSelector) {
      const target = dialog.querySelector(focusSelector);
      (target && !target.disabled ? target : $('pad-close')).focus();
    }
  }

  function toast(text) {
    const box = $('pad-toast');
    box.textContent = text;
    box.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('is-on'), 4000);
  }

  // ---------- Add buttons, added here so the printed and no-JavaScript menus stay clean ----------
  function addButton(id, cls, size) {
    const button = el('button', `${cls} js-only`);
    button.type = 'button';
    button.dataset.add = id;
    if (size) button.dataset.size = size;
    return button;
  }
  dishes.forEach((dish, id) => {
    if (dish.sizes) {
      const row = el('div', 'mt-1 flex flex-wrap gap-2');
      dish.sizes.forEach((_, size) => row.append(addButton(id, 'pad-add-size', size)));
      dish.el.querySelector('.dish-sizes').after(row);
    } else {
      const row = dish.el.querySelector('h3').parentElement;
      row.classList.add('pad-row');
      row.append(addButton(id, 'pad-add'));
    }
  });

  $('menu-results').addEventListener('click', (e) => {
    const button = e.target.closest('[data-add]');
    if (!button) return;
    const dish = dishes.get(button.dataset.add);
    const line = { id: button.dataset.add, size: button.dataset.size || undefined, addons: [], qty: 1 };
    const key = keyOf(line);
    const existing = lines.find((l) => keyOf(l) === key);
    if (existing && existing.qty >= MAX_QTY) {
      toast(`You can have up to ${MAX_QTY} of one item on the pad.`);
      return;
    }
    if (existing) existing.qty += 1;
    else if (lines.length >= MAX_LINES) {
      toast('Your pad is full.');
      return;
    } else lines.push(line);
    undoLines = null;
    draw();
    const name = line.size ? `${dish.name}, ${line.size}` : dish.name;
    toast(`Added ${name}. ${itemsText(countOf(lines))}, ${money(totalOf(lines))}.`);
  });

  // ---------- The pad ----------
  function openPad() {
    $('pad-link-box').hidden = true;
    dialog.showModal();
    $('pad-close').focus();
  }
  $('pad-bar').addEventListener('click', openPad);
  $('pad-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    showCounter(false);
    undoLines = null;
    $('pad-note').hidden = true;
    draw();
    // The bar is gone if the pad was emptied, so focus falls back to the start of the content.
    const bar = $('pad-bar');
    (bar.hidden ? $('main-content') : bar).focus({ preventScroll: true });
  });

  $('pad-lines').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-act]');
    if (!button) return;
    const index = lines.findIndex((l) => keyOf(l) === button.dataset.key);
    const line = lines[index];
    if (!line) return;
    const name = dishes.get(line.id).name;
    if (button.dataset.act === 'inc') {
      line.qty = Math.min(line.qty + 1, MAX_QTY);
      draw(`[data-act="inc"][data-key="${CSS.escape(keyOf(line))}"]`);
      toast(`${line.qty} of ${name}. Total ${money(totalOf(lines))}.`);
    } else if (line.qty > 1) {
      line.qty -= 1;
      draw(`[data-act="dec"][data-key="${CSS.escape(keyOf(line))}"]`);
      toast(`${line.qty} of ${name}. Total ${money(totalOf(lines))}.`);
    } else {
      lines.splice(index, 1);
      const neighbour = lines[index] || lines[index - 1];
      draw(neighbour ? `[data-act="dec"][data-key="${CSS.escape(keyOf(neighbour))}"]` : '#pad-close');
      toast(`Removed ${name}. Total ${money(totalOf(lines))}.`);
    }
  });

  $('pad-lines').addEventListener('change', (e) => {
    const box = e.target;
    if (box.dataset.act !== 'addon') return;
    const line = lines.find((l) => keyOf(l) === box.dataset.key);
    if (!line) return;
    const chosen = box.checked ? [...line.addons, box.dataset.addon] : line.addons.filter((a) => a !== box.dataset.addon);
    line.addons = chosen.sort();
    // Changing an option can make this the same as another line, so they join up.
    lines = merged(lines);
    draw(`[data-act="addon"][data-addon="${CSS.escape(box.dataset.addon)}"][data-key="${CSS.escape(keyOf(line))}"]`);
    toast(`Total ${money(totalOf(lines))}.`);
  });

  function setSplit(n) {
    split = n;
    draw();
    $(n <= 1 ? 'pad-split-up' : n >= MAX_SPLIT ? 'pad-split-down' : document.activeElement.id).focus();
    toast(split === 1 ? 'Not split.' : `Split between ${split}: ${$('pad-split-each').textContent}.`);
  }
  $('pad-split-down').addEventListener('click', () => setSplit(Math.max(split - 1, 1)));
  $('pad-split-up').addEventListener('click', () => setSplit(Math.min(split + 1, MAX_SPLIT)));

  $('pad-clear').addEventListener('click', () => {
    undoLines = lines;
    lines = [];
    split = 1;
    draw('#pad-undo');
    toast('Your pad is cleared.');
  });
  $('pad-undo').addEventListener('click', () => {
    lines = undoLines || [];
    undoLines = null;
    draw('#pad-clear');
    toast('Your order is back.');
  });

  // ---------- Show at the counter ----------
  function drawCounter() {
    $('pad-counter-lines').replaceChildren(...lines.map((line) => {
      const li = el('li', 'pad-counter-line');
      li.append(el('p', 'font-display text-3xl font-semibold leading-tight', `${line.qty} × ${dishes.get(line.id).name}`));
      const detail = describe(line);
      li.append(el('p', 'text-lg', [dishes.get(line.id).category, detail].filter(Boolean).join(', ')));
      return li;
    }));
    $('pad-counter-total').textContent = money(totalOf(lines));
  }
  function showCounter(on) {
    dialog.classList.toggle('is-counter', on);
    $('pad-counter').hidden = !on;
    $('pad-body').hidden = on;
    dialog.querySelector('.pad-head').hidden = on;
  }
  $('pad-show').addEventListener('click', () => {
    drawCounter();
    showCounter(true);
    dialog.scrollTop = 0;
    $('pad-counter-back').focus();
  });
  $('pad-counter-back').addEventListener('click', () => {
    showCounter(false);
    $('pad-show').focus();
  });

  // ---------- Share ----------
  function showLink(url) {
    $('pad-link-box').hidden = false;
    $('pad-link').value = url;
    $('pad-link').focus();
    $('pad-link').select();
  }
  $('pad-share').addEventListener('click', async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Our Olympic Cafe order', text: `${itemsText(countOf(lines))} from Olympic Cafe`, url });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied. Paste it to share your order.');
    } catch (e) {
      showLink(url);
    }
  });

  // ---------- Opening a shared link ----------
  function drawSharedLines(list) {
    $('pad-shared-lines').replaceChildren(...list.map((line) => el('li', 'py-0.5', `${line.qty} × ${dishes.get(line.id).name}${describe(line) ? ` (${describe(line)})` : ''}`)));
  }
  function setShared(on) {
    $('pad-shared').hidden = !on;
    $('pad-body').hidden = on;
  }
  function droppedText(n) {
    return `${n} ${n === 1 ? 'item' : 'items'} on that link couldn't be found on our menu, so ${n === 1 ? 'it was' : 'they were'} left out.`;
  }
  $('pad-shared-replace').addEventListener('click', () => {
    lines = pendingShared;
    pendingShared = null;
    setShared(false);
    draw('#pad-close');
    toast('Your pad now shows the shared order.');
  });
  $('pad-shared-keep').addEventListener('click', () => {
    pendingShared = null;
    setShared(false);
    draw('#pad-close');
  });

  function fromLink() {
    const params = new URLSearchParams(location.search);
    const raw = params.get('pad');
    if (raw === null) return;
    // The link has done its job. Taking it out means a reload can't ask again or undo later changes.
    params.delete('pad');
    const rest = params.toString();
    history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`);

    const shared = decode(raw);
    if (!shared.lines.length) {
      toast("We couldn't find anything from that link on our menu.");
      return;
    }
    const note = shared.dropped ? droppedText(shared.dropped) : '';
    if (encode(shared.lines) === encode(lines)) return;
    if (!lines.length) {
      lines = shared.lines;
      draw();
      $('pad-note').textContent = note;
      $('pad-note').hidden = !note;
      openPad();
      return;
    }
    pendingShared = shared.lines;
    $('pad-shared-text').textContent = `${itemsText(countOf(pendingShared))}, estimated ${money(totalOf(pendingShared))}.${note ? ` ${note}` : ''}`;
    drawSharedLines(pendingShared);
    setShared(true);
    openPad();
  }

  lines = load();
  draw();
  fromLink();
})();
