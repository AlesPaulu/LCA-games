/* ==========================================================================
   LCA hry – logika aplikace
   ========================================================================== */
(() => {
  const STAGE_W = 1190, STAGE_H = 842;
  const STORE_KEY = 'lca-games-v1';

  /* ---------- Uložený stav (jen pohodlí – vše funguje i bez něj) ---------- */
  const store = (() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  })();
  const save = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ lang, game, seen, g1: placed.g1, g2: placed.g2 }));
    } catch (e) { /* ignore */ }
  };

  let lang = store.lang === 'en' ? 'en' : 'cs';
  let game = store.game === 'g2' ? 'g2' : 'g1';
  const seen = store.seen || {};
  const placed = { g1: store.g1 || {}, g2: store.g2 || {} };  // slotId → klíč položky
  let marks = {};        // slotId / groupId → 'ok' | 'bad'
  let selected = null;   // { key, from: 'tray'|'slot', slotId }
  let scale = 1;

  const $ = (sel, root = document) => root.querySelector(sel);
  const stage = $('#stage');
  const sizer = $('#stage-sizer');
  const stageArea = $('#stage-area');
  const trayItems = $('#tray-items');
  const feedback = $('#feedback');

  const t = (k) => UI[lang][k];
  const tr = (o) => (o && typeof o === 'object' ? o[lang] : o);
  const fmt = (n) => n.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 1 });

  /* ---------- Typ a popisek položky ---------- */
  const itemType = (key) => (CARDS[key] ? CARDS[key][0] : PHOTOS[key] ? 'photo' : TOKENS[key] ? 'tok' : null);
  const cardLabel = (key) => CARDS[key][lang === 'cs' ? 1 : 2];

  /* ==========================================================================
     Definice políček
     ========================================================================== */
  const SLOTS = { g1: {}, g2: {} };   // id → { id, type, x, y, w, h, expected, locked, group }
  const ORDER = { g1: [], g2: [] };
  const GROUPS = {};                  // skupiny žetonů hry 2

  function addSlot(g, s) { SLOTS[g][s.id] = s; ORDER[g].push(s.id); }

  G1_BLOCKS.forEach((b) => {
    b.slots.forEach(([type, x, y, key, locked], i) => {
      addSlot('g1', { id: `${b.id}-${i}`, type, x, y, w: W, h: H, expected: key, locked: !!locked, group: `${b.id}:${type}` });
    });
    const [x, y, w, h, key] = b.photo;
    addSlot('g1', { id: `${b.id}-photo`, type: 'photo', x, y, w, h, expected: key, group: `${b.id}:photo` });
  });

  G2_COMPARISONS.forEach((c) => {
    const rowsY = (rows, one, two) => (rows.length === 1 ? [one] : two);
    [['fn', c.fnRows, 236, [219, 253]], ['fu', c.fuRows, 315, [298, 332]]].forEach(([type, rows, one, two]) => {
      const ys = rowsY(rows, one, two);
      rows.forEach((row, r) => {
        const offset = row.length === 2 ? 43.5 : 0;
        row.forEach((key, j) => {
          addSlot('g2', { id: `${c.id}-${type}-${r}-${j}`, type, x: c.x + offset + j * 87, y: ys[r], w: 79, h: 24, expected: key });
        });
      });
    });
    c.products.forEach((p, pi) => {
      const px = c.x + pi * 140;
      addSlot('g2', { id: `${c.id}-photo${pi}`, type: 'photo', x: px, y: 84, w: 113, h: 114, expected: p.photo });
      const gid = `${c.id}-t${pi}`;
      GROUPS[gid] = { id: gid, token: c.token, count: p.tokens, calc: p.calc, x: px, slots: [] };
      for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 2; col++) {
          const id = `${gid}-${r}-${col}`;
          addSlot('g2', { id, type: 'tok', x: px + col * 63, y: 451 + r * 64, w: 50, h: 50, group: gid });
          GROUPS[gid].slots.push(id);
        }
      }
    });
  });

  // odstranit neplatné uložené položky
  ['g1', 'g2'].forEach((g) => {
    Object.keys(placed[g]).forEach((id) => {
      const s = SLOTS[g][id];
      if (!s || s.locked || itemType(placed[g][id]) !== s.type) delete placed[g][id];
    });
  });

  /* ---------- Zásobník: kolik kusů od každé položky ---------- */
  function totals(g) {
    const tot = {};
    ORDER[g].forEach((id) => {
      const s = SLOTS[g][id];
      if (!s.locked && s.expected) tot[s.expected] = (tot[s.expected] || 0) + 1;
    });
    return tot;
  }
  const TOTALS = { g1: totals('g1'), g2: totals('g2') };
  function trayCount(key) {
    if (TOKENS[key]) return Infinity;
    const used = Object.values(placed[game]).filter((k) => k === key).length;
    return (TOTALS[game][key] || 0) - used;
  }

  // náhodné (ale během návštěvy stálé) pořadí kartiček v zásobníku
  const SHUFFLE = {};
  ['g1', 'g2'].forEach((g) => {
    const keys = Object.keys(TOTALS[g]);
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    SHUFFLE[g] = keys;
  });

  /* ==========================================================================
     Vykreslení
     ========================================================================== */
  function el(tag, cls, style, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) Object.assign(e.style, style);
    if (html != null) e.innerHTML = html;
    return e;
  }
  const px = (x, y, w, h) => ({ left: x + 'px', top: y + 'px', ...(w != null && { width: w + 'px' }), ...(h != null && { height: h + 'px' }) });

  function makeItem(key, locked) {
    const type = itemType(key);
    let e;
    if (type === 'photo') {
      e = el('div', 'photo-item');
      const img = el('img');
      img.src = `img/${key.replace(/^ph_/, '')}.jpg`;
      img.alt = tr(PHOTOS[key]);
      img.draggable = false;
      e.appendChild(img);
      e.title = tr(PHOTOS[key]);
    } else if (type === 'tok') {
      e = el('div', 'token', null, `<span>${TOKENS[key].label}<br>CO<sub>2</sub></span>`);
    } else {
      e = el('div', `card t-${type}`, null, cardLabel(key));
      if (locked) e.classList.add('locked');
    }
    e.dataset.key = key;
    if (!locked) { e.dataset.drag = '1'; e.tabIndex = 0; }
    return e;
  }

  function fitText(e) {
    let fs = 12.5;
    e.style.whiteSpace = 'nowrap';
    e.style.fontSize = fs + 'px';
    const over = () => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1;
    while (over() && fs > 10.5) { fs -= 0.5; e.style.fontSize = fs + 'px'; }
    if (!over()) return;
    e.style.whiteSpace = 'normal';
    fs = 11;
    e.style.fontSize = fs + 'px';
    while (over() && fs > 7.5) { fs -= 0.5; e.style.fontSize = fs + 'px'; }
  }

  function arrowPath(pts, r = 9) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const ax = x1 - ((x1 - x0) / l1) * rr, ay = y1 - ((y1 - y0) / l1) * rr;
      const bx = x1 + ((x2 - x1) / l2) * rr, by = y1 + ((y2 - y1) / l2) * rr;
      d += ` L${ax},${ay} Q${x1},${y1} ${bx},${by}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last[0]},${last[1]}`;
  }

  function renderStage() {
    stage.innerHTML = '';
    const slotEls = {};
    if (game === 'g1') {
      const T = G1_TEXT[lang];
      stage.appendChild(el('div', 'frame', px(14, 30, 1164, 519)));
      const colors = { k: '#15171b', g: '#8d9097', l: '#d2d4d8' };
      let svg = `<svg class="arrows" width="${STAGE_W}" height="${STAGE_H}" viewBox="0 0 ${STAGE_W} ${STAGE_H}"><defs>`;
      Object.entries(colors).forEach(([k, c]) => {
        svg += `<marker id="ah-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto"><path d="M1,1 L8,5 L1,9" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker>`;
      });
      svg += '</defs>';
      // světlé šipky nejdřív, aby tmavé byly navrchu
      [...G1_ARROWS].sort((a, b) => 'lgk'.indexOf(a[0]) - 'lgk'.indexOf(b[0])).forEach(([c, pts]) => {
        svg += `<path d="${arrowPath(pts)}" fill="none" stroke="${colors[c]}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" marker-end="url(#ah-${c})"/>`;
      });
      stage.insertAdjacentHTML('beforeend', svg + '</svg>');
      stage.appendChild(el('div', 'note', px(752, 512, 420), `<ul><li>${T.note1}</li><li>${T.note2}</li></ul>`));
      stage.appendChild(el('div', 'stage-title', px(30, 660, 300), T.title));
      stage.appendChild(el('div', 'legend-title', px(985, 624, 113), T.legend));
      ['emp', 'in', 'prod', 'emi'].forEach((type, i) => {
        stage.appendChild(el('div', `legend-item card t-${type}`, { ...px(985, 660 + i * 30, 113, 24), cursor: 'default' }, tr(TYPES[type])));
        const b = el('button', 'info-btn', px(1106, 663 + i * 30), 'i');
        b.dataset.info = type;
        b.setAttribute('aria-label', tr(TYPES[type]));
        stage.appendChild(b);
      });
    } else {
      const T = G2_TEXT[lang];
      stage.appendChild(el('div', 'stage-title', px(20, 52, 210), T.title));
      [['fn', 249], ['fu', 327], ['ref', 401], ['cf', 476]].forEach(([k, y]) => {
        const row = el('div', 'row-label', { ...px(0, y - 14, 240, 28) }, `<span>${T.rows[k]}</span>`);
        const b = el('button', 'info-btn', null, 'i');
        b.dataset.info = 'g2-' + k;
        b.setAttribute('aria-label', T.rows[k]);
        row.appendChild(b);
        stage.appendChild(row);
      });
      const ef = el('div', 'ef', px(62, 538, 158));
      G2_EF.forEach((e) => { ef.innerHTML += `<div style="margin-bottom:4px">${e[lang][0]}<span>${e[lang][1]}</span></div>`; });
      stage.appendChild(ef);
      G2_COMPARISONS.forEach((c) => {
        stage.appendChild(el('div', 'cmp-title', px(c.x - 30, 22, 313), tr(c.title)));
        c.products.forEach((p, pi) => {
          stage.appendChild(el('div', 'ref-box', px(c.x + pi * 140, 377, 113, 48), tr(p.ref)));
          const g = GROUPS[`${c.id}-t${pi}`];
          const m = el('div', 'group-mark', px(g.x - 2, 449, 117, 310));
          m.dataset.group = g.id;
          stage.appendChild(m);
        });
        const b = el('button', 'whatif-btn', px(c.x + 126.5, 796), tr(WHATIF[c.id].q));
        b.dataset.whatif = c.id;
        stage.appendChild(b);
      });
    }
    ORDER[game].forEach((id) => {
      const s = SLOTS[game][id];
      const e = el('div', `slot t-${s.type}`, px(s.x, s.y, s.w, s.h));
      e.dataset.slot = id;
      stage.appendChild(e);
      slotEls[id] = e;
    });
    stage._slotEls = slotEls;
    renderItems();
  }

  function renderItems() {
    const slotEls = stage._slotEls;
    const P = placed[game];
    ORDER[game].forEach((id) => {
      const s = SLOTS[game][id];
      const e = slotEls[id];
      e.innerHTML = '';
      e.classList.remove('ok', 'bad', 'has-item', 'selectable-target');
      const key = s.locked ? s.expected : P[id];
      if (key) {
        const item = makeItem(key, s.locked);
        if (!s.locked) { item.dataset.from = 'slot'; item.dataset.slot = id; }
        if (selected && selected.from === 'slot' && selected.slotId === id) item.classList.add('selected');
        e.appendChild(item);
        e.classList.add('has-item');
        if (item.classList.contains('card')) fitText(item);
      }
      if (marks[id] && s.type !== 'tok') e.classList.add(marks[id]);
      if (selected && !s.locked && s.type === itemType(selected.key) && !(selected.from === 'slot' && selected.slotId === id)) {
        e.classList.add('selectable-target');
      }
    });
    stage.querySelectorAll('.group-mark').forEach((m) => {
      m.classList.remove('ok', 'bad');
      if (marks[m.dataset.group]) m.classList.add(marks[m.dataset.group]);
    });
    renderTray();
  }

  function renderTray() {
    trayItems.innerHTML = '';
    const sections = game === 'g1' ? ['photo', 'emp', 'in', 'prod', 'emi'] : ['photo', 'fn', 'fu', 'tok'];
    const dotColor = { emp: 'var(--emp)', in: 'var(--in)', prod: 'var(--prod)', emi: 'var(--emi)', fn: 'var(--emp)', fu: 'var(--prod)', photo: '#2a2d33', tok: 'var(--tok)' };
    let any = false;
    sections.forEach((type) => {
      const keys = type === 'tok' ? Object.keys(TOKENS) : SHUFFLE[game].filter((k) => itemType(k) === type && trayCount(k) > 0);
      if (!keys.length) return;
      any = true;
      const sec = el('div', 'tray-section');
      sec.appendChild(el('h3', null, null, `<span class="dot" style="background:${dotColor[type]}"></span>${tr(TYPES[type])}`));
      const list = el('div', 'tray-list');
      keys.forEach((k) => {
        const item = makeItem(k);
        item.dataset.from = 'tray';
        const n = trayCount(k);
        if (n > 1 && n !== Infinity) item.appendChild(el('span', 'count', null, '×' + n));
        if (selected && selected.from === 'tray' && selected.key === k) item.classList.add('selected');
        list.appendChild(item);
      });
      sec.appendChild(list);
      trayItems.appendChild(sec);
    });
    if (!any || (game === 'g2' && trayItems.children.length === 1)) {
      trayItems.insertAdjacentHTML('afterbegin', `<div class="tray-empty">${t('emptyTray')}</div>`);
    }
  }

  function applyTexts() {
    document.documentElement.lang = lang;
    document.title = `${t('appTitle')} – ${lang === 'cs' ? 'VŠCHT Praha' : 'UCT Prague'}`;
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    document.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.game === game)));
    $('#modal-close').setAttribute('aria-label', t('close'));
  }

  function layout() {
    const w = stageArea.clientWidth - 24;
    const h = stageArea.clientHeight - 24;
    const narrow = window.innerWidth <= 900;
    scale = Math.min(w / STAGE_W, h / STAGE_H);
    scale = narrow ? Math.max(w / STAGE_W, 0.62) : Math.max(scale, 0.5);
    scale = Math.min(scale, 1.35);
    stage.style.transform = `scale(${scale})`;
    sizer.style.width = STAGE_W * scale + 'px';
    sizer.style.height = STAGE_H * scale + 'px';
  }

  /* ==========================================================================
     Manipulace s položkami
     ========================================================================== */
  function clearMarksFor(ids) {
    ids.forEach((id) => {
      if (!id) return;
      delete marks[id];
      const s = SLOTS[game][id];
      if (s && s.group && GROUPS[s.group]) delete marks[s.group];
    });
  }

  function placeItem(item, slotId) {
    const s = SLOTS[game][slotId];
    if (!s || s.locked) return false;
    if (itemType(item.key) !== s.type) { toast(t('wrongType')); return false; }
    const P = placed[game];
    if (item.from === 'slot') {
      if (item.slotId === slotId) return true;
      const cur = P[slotId];
      delete P[item.slotId];
      if (cur) P[item.slotId] = cur;   // prohození
    } else if (trayCount(item.key) <= 0) {
      return false;
    }
    P[slotId] = item.key;
    clearMarksFor([slotId, item.slotId]);
    save();
    renderItems();
    return true;
  }

  function returnToTray(slotId) {
    delete placed[game][slotId];
    clearMarksFor([slotId]);
    save();
    renderItems();
  }

  function select(e) {
    const item = { key: e.dataset.key, from: e.dataset.from, slotId: e.dataset.slot };
    if (selected && selected.key === item.key && selected.from === item.from && selected.slotId === item.slotId) selected = null;
    else selected = item;
    renderItems();
  }
  function clearSelection() { if (selected) { selected = null; renderItems(); } }

  /* ---------- Přetahování (myš i dotyk) ---------- */
  let drag = null;
  let suppressClick = false;

  function onPointerDown(ev) {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    const src = ev.target.closest('[data-drag]');
    if (!src) return;
    if (ev.pointerType === 'mouse') ev.preventDefault();
    drag = { src, key: src.dataset.key, from: src.dataset.from, slotId: src.dataset.slot, x0: ev.clientX, y0: ev.clientY, pid: ev.pointerId, started: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', cancelDrag);
  }

  function startDrag(ev) {
    drag.started = true;
    if (selected) { selected = null; renderItems(); drag.src = findSource(); }
    const r = drag.src.getBoundingClientRect();
    const inStage = drag.from === 'slot';
    const g = drag.src.cloneNode(true);
    g.classList.add('drag-ghost');
    g.classList.remove('selected');
    g.querySelectorAll('.count').forEach((c) => c.remove());
    const w = inStage ? r.width / scale : r.width;
    const h = inStage ? r.height / scale : r.height;
    Object.assign(g.style, { width: w + 'px', height: h + 'px', transformOrigin: '0 0', transform: `scale(${inStage ? scale : 1}) rotate(-2deg)`, fontSize: drag.src.style.fontSize, whiteSpace: drag.src.style.whiteSpace });
    document.body.appendChild(g);
    drag.ghost = g;
    drag.dx = ev.clientX - r.left;
    drag.dy = ev.clientY - r.top;
    drag.src.classList.add('dragging-src');
    document.body.style.cursor = 'grabbing';
  }

  function findSource() {
    if (drag.from === 'slot') return stage.querySelector(`[data-drag][data-slot="${drag.slotId}"]`) || drag.src;
    return trayItems.querySelector(`[data-drag][data-key="${drag.key}"]`) || drag.src;
  }

  let hoverSlot = null;
  function onPointerMove(ev) {
    if (!drag || ev.pointerId !== drag.pid) return;
    if (!drag.started) {
      if (Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 6) return;
      startDrag(ev);
    }
    ev.preventDefault();
    drag.ghost.style.left = ev.clientX - drag.dx + 'px';
    drag.ghost.style.top = ev.clientY - drag.dy + 'px';
    const under = document.elementFromPoint(ev.clientX, ev.clientY);
    const slotEl = under && under.closest('.slot');
    if (hoverSlot && hoverSlot !== slotEl) hoverSlot.classList.remove('drop-ok', 'drop-no');
    hoverSlot = slotEl;
    if (slotEl) {
      const s = SLOTS[game][slotEl.dataset.slot];
      slotEl.classList.add(!s.locked && s.type === itemType(drag.key) ? 'drop-ok' : 'drop-no');
    }
    $('#tray').classList.toggle('drop-return', drag.from === 'slot' && !!(under && under.closest('#tray')));
    autoScroll(ev);
  }

  function autoScroll(ev) {
    const r = stageArea.getBoundingClientRect();
    const edge = 40, sp = 14;
    if (ev.clientY < r.top + edge && ev.clientY > r.top) stageArea.scrollTop -= sp;
    else if (ev.clientY > r.bottom - edge && ev.clientY < r.bottom) stageArea.scrollTop += sp;
    if (ev.clientX < r.left + edge && ev.clientX > r.left) stageArea.scrollLeft -= sp;
    else if (ev.clientX > r.right - edge && ev.clientX < r.right) stageArea.scrollLeft += sp;
  }

  function onPointerUp(ev) {
    if (!drag || ev.pointerId !== drag.pid) return;
    const d = drag;
    cleanupDrag();
    if (!d.started) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 60);
    const under = document.elementFromPoint(ev.clientX, ev.clientY);
    const slotEl = under && under.closest('.slot');
    if (slotEl) {
      placeItem(d, slotEl.dataset.slot);
    } else if (d.from === 'slot') {
      returnToTray(d.slotId);
    }
  }

  function cancelDrag() { cleanupDrag(); }
  function cleanupDrag() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', cancelDrag);
    if (drag) {
      if (drag.ghost) drag.ghost.remove();
      if (drag.src) drag.src.classList.remove('dragging-src');
    }
    if (hoverSlot) hoverSlot.classList.remove('drop-ok', 'drop-no');
    hoverSlot = null;
    $('#tray').classList.remove('drop-return');
    document.body.style.cursor = '';
    drag = null;
  }

  /* ---------- Kliknutí / ťuknutí ---------- */
  document.addEventListener('pointerdown', onPointerDown);

  document.addEventListener('click', (ev) => {
    if (suppressClick) { suppressClick = false; return; }
    const info = ev.target.closest('[data-info]');
    if (info) { showInfo(info.dataset.info); return; }
    const wi = ev.target.closest('[data-whatif]');
    if (wi) { openWhatIf(wi.dataset.whatif); return; }
    if (!ev.target.closest('#stage, #tray-items')) return;

    const dragEl = ev.target.closest('[data-drag]');
    const slotEl = ev.target.closest('.slot');
    if (selected) {
      const sameItem = dragEl && dragEl.dataset.from === selected.from && dragEl.dataset.key === selected.key && dragEl.dataset.slot === selected.slotId;
      if (sameItem) { clearSelection(); return; }
      if (slotEl) {
        const sel = selected;
        selected = null;
        if (!placeItem(sel, slotEl.dataset.slot)) renderItems();
        return;
      }
      if (ev.target.closest('#tray-items')) {
        if (selected.from === 'slot') { const id = selected.slotId; selected = null; returnToTray(id); return; }
        if (dragEl) { select(dragEl); return; }
      }
      clearSelection();
      return;
    }
    if (dragEl) select(dragEl);
  });

  document.addEventListener('dblclick', (ev) => {
    const dragEl = ev.target.closest('#stage [data-drag]');
    if (dragEl) { selected = null; returnToTray(dragEl.dataset.slot); }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (!$('#modal').hidden) closeModal();
      else clearSelection();
      return;
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-drag]')) {
      ev.preventDefault();
      ev.target.click();
    }
  });

  /* ==========================================================================
     Kontrola, nápověda, řešení
     ========================================================================== */
  function evaluate() {
    const P = placed[game];
    const res = { status: {}, ok: 0, bad: 0, empty: 0, total: 0, badTokens: [] };
    if (game === 'g1') {
      const groups = {};
      ORDER.g1.forEach((id) => { const s = SLOTS.g1[id]; (groups[s.group] = groups[s.group] || []).push(s); });
      Object.values(groups).forEach((list) => {
        const remaining = {};
        list.forEach((s) => { if (!s.locked) remaining[s.expected] = (remaining[s.expected] || 0) + 1; });
        // nejprve přiřadit správné kartičky, pak označit zbytek
        list.forEach((s) => {
          if (s.locked) return;
          const k = P[s.id];
          if (k && remaining[k] > 0) { remaining[k]--; res.status[s.id] = 'ok'; }
        });
        list.forEach((s) => {
          if (s.locked || res.status[s.id]) return;
          res.status[s.id] = P[s.id] ? 'bad' : 'empty';
        });
        list.forEach((s) => { if (!s.locked) res[res.status[s.id]]++; });
        res.remaining = res.remaining || {};
        res.remaining[list[0].group] = remaining;
      });
    } else {
      ORDER.g2.forEach((id) => {
        const s = SLOTS.g2[id];
        if (s.type === 'tok') return;
        const k = P[id];
        res.status[id] = !k ? 'empty' : k === s.expected ? 'ok' : 'bad';
        res[res.status[id]]++;
      });
      Object.values(GROUPS).forEach((g) => {
        const keys = g.slots.map((id) => P[id]).filter(Boolean);
        const sum = keys.reduce((a, k) => a + TOKENS[k].value, 0);
        let st;
        if (!keys.length) st = 'empty';
        else st = sum === g.count * TOKENS[g.token].value ? 'ok' : 'bad';
        res.status[g.id] = st;
        res[st]++;
        if (st !== 'ok') res.badTokens.push(g);
      });
    }
    res.total = res.ok + res.bad + res.empty;
    return res;
  }

  function check() {
    const res = evaluate();
    marks = {};
    Object.entries(res.status).forEach(([id, st]) => { if (st === 'ok' || st === 'bad') marks[id] = st; });
    renderItems();
    feedback.className = 'feedback';
    if (res.ok === res.total) {
      feedback.classList.add('good');
      feedback.textContent = t('allDone');
      showSuccess();
    } else {
      feedback.classList.add('warn');
      let msg = t('scoreLine')(res.ok, res.total);
      if (res.bad) msg += ' ' + t('scoreWrong');
      if (res.empty) msg += ' ' + t('scoreEmpty')(res.empty);
      feedback.textContent = msg;
    }
  }

  function flash(id) {
    const e = stage._slotEls[id];
    if (!e) return;
    e.classList.remove('flash');
    void e.offsetWidth;
    e.classList.add('flash');
    const r = e.getBoundingClientRect(), a = stageArea.getBoundingClientRect();
    if (r.top < a.top || r.bottom > a.bottom || r.left < a.left || r.right > a.right) e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  }

  // uvolní jeden kus klíče (z chybného políčka), pokud v zásobníku žádný není
  function freeKey(key, status) {
    if (trayCount(key) > 0) return;
    const P = placed[game];
    const id = Object.keys(P).find((sid) => P[sid] === key && status[sid] !== 'ok');
    if (id) delete P[id];
  }

  function hint() {
    const res = evaluate();
    const P = placed[game];
    // nejdřív opravit chybně umístěné, pak doplnit prázdné
    const ids = [...ORDER[game]].sort((a, b) => (res.status[b] === 'bad') - (res.status[a] === 'bad'));
    for (const id of ids) {
      const s = SLOTS[game][id];
      if (s.locked || s.type === 'tok' || res.status[id] === 'ok') continue;
      let needed = s.expected;
      if (game === 'g1' && s.type !== 'photo') {
        const rem = res.remaining[s.group];
        needed = Object.keys(rem).find((k) => rem[k] > 0);
      }
      delete P[id];
      freeKey(needed, res.status);
      P[id] = needed;
      clearMarksFor([id]);
      save();
      renderItems();
      flash(id);
      toast(t('placedHint'));
      return;
    }
    if (res.badTokens.length) {
      const g = res.badTokens[0];
      g.slots.forEach((id) => delete P[id]);
      g.slots.slice(0, g.count).forEach((id) => { P[id] = g.token; });
      delete marks[g.id];
      save();
      renderItems();
      flash(g.slots[0]);
      openModal({ title: t('hint'), html: `<p class="lead">${tr(g.calc)}</p>`, actions: [{ label: t('ok'), primary: true }] });
      return;
    }
    toast(t('nothingToHint'));
  }

  function solve() {
    const P = (placed[game] = {});
    ORDER[game].forEach((id) => { const s = SLOTS[game][id]; if (!s.locked && s.expected) P[id] = s.expected; });
    if (game === 'g2') Object.values(GROUPS).forEach((g) => g.slots.slice(0, g.count).forEach((id) => { P[id] = g.token; }));
    selected = null;
    save();
    check();
  }

  function reset() {
    placed[game] = {};
    marks = {};
    selected = null;
    feedback.className = 'feedback';
    feedback.textContent = '';
    save();
    renderItems();
  }

  /* ==========================================================================
     Modální okna
     ========================================================================== */
  const modal = $('#modal');
  let modalOnClose = null;
  function openModal({ title, html, actions = [], onClose }) {
    $('#modal-title').innerHTML = title;
    $('#modal-body').innerHTML = html;
    const act = $('#modal-actions');
    act.innerHTML = '';
    actions.forEach((a) => {
      const b = el('button', 'btn' + (a.primary ? ' primary' : ''), null, a.label);
      b.addEventListener('click', () => { closeModal(); if (a.onClick) a.onClick(); });
      act.appendChild(b);
    });
    modalOnClose = onClose || null;
    modal.hidden = false;
    const first = act.querySelector('.primary') || $('#modal-close');
    first.focus({ preventScroll: true });
  }
  function closeModal() {
    modal.hidden = true;
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
  }
  $('#modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

  function showIntro() {
    const T = game === 'g1' ? G1_TEXT[lang] : G2_TEXT[lang];
    seen[game] = true;
    save();
    openModal({ title: T.introTitle, html: T.intro, actions: [{ label: t('start'), primary: true }] });
  }

  function showSuccess() {
    const T = game === 'g1' ? G1_TEXT[lang] : G2_TEXT[lang];
    openModal({ title: T.successTitle, html: T.success, actions: [{ label: t('ok'), primary: true }] });
  }

  function showInfo(k) {
    if (k.startsWith('g2-')) {
      const T = G2_TEXT[lang];
      const key = k.slice(3);
      openModal({ title: T.rows[key], html: `<p class="lead">${T.rowInfo[key]}</p>`, actions: [{ label: t('ok'), primary: true }] });
    } else {
      openModal({
        title: `<span class="chip t-${k}" style="font-size:18px">${tr(TYPES[k])}</span>`,
        html: `<p class="lead">${tr(TYPE_INFO[k])}</p>`,
        actions: [{ label: t('ok'), primary: true }],
      });
    }
  }

  function openWhatIf(cid) {
    const W = WHATIF[cid];
    const opts = W.options.map((o) => `<button class="option" data-opt="${o.id}">${tr(o)}</button>`).join('');
    openModal({
      title: tr(W.q),
      html: `<p class="lead">${tr(W.ask)}</p><p style="margin:10px 0 0;font-weight:600">${t('predict')}</p><div class="options">${opts}</div><div id="wi-result"></div>`,
      actions: [{ label: t('close') }],
    });
    const body = $('#modal-body');
    body.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
      body.querySelectorAll('.option').forEach((o) => o.classList.toggle('chosen', o === b));
      revealWhatIf(W, b.dataset.opt);
    }));
  }

  function revealWhatIf(W, choice) {
    const box = $('#wi-result');
    let verdict;
    if (W.verdicts && W.verdicts[choice]) {
      const v = W.verdicts[choice];
      verdict = `<div class="verdict ${v.kind}">${tr(v)}</div>`;
    } else if (W.correct == null) verdict = `<div class="verdict neutral">${t('guessNeutral')}</div>`;
    else if (choice === W.correct) verdict = `<div class="verdict right">${t('guessRight')}</div>`;
    else verdict = `<div class="verdict wrong">${t('guessWrong')}</div>`;
    const sl = W.slider;
    const unit = tr(sl.unit);
    box.innerHTML = `${verdict}<p>${tr(W.explain)}</p>
      <div class="explore">
        <p style="margin:0;font-weight:600">${t('explore')}</p>
        <label class="slider-row"><span>${tr(sl.label)}</span>
          <input type="range" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${sl.value}">
          <output></output></label>
        <div class="bars"></div>
        <div class="break-even">${t('breakEven')} ${tr(W.breakEven)}.</div>
      </div>`;
    const input = box.querySelector('input');
    const out = box.querySelector('output');
    const bars = box.querySelector('.bars');
    const maxVal = Math.max(...W.bars(sl.min).map((b) => b.value), ...W.bars(sl.max).map((b) => b.value));
    const draw = () => {
      const v = parseFloat(input.value);
      out.textContent = `${fmt(v)} ${unit}`;
      const data = W.bars(v);
      const known = data.filter((d) => !d.unknown).map((d) => d.value);
      const min = Math.min(...known);
      bars.innerHTML = data.map((d) => {
        const img = d.photo ? `<img src="img/${d.photo}.jpg" alt="">` : '<span class="noimg"></span>';
        const pct = Math.max((d.value / maxVal) * 100, d.unknown ? 0 : 1.5);
        const val = d.unknown ? `0 ${t('gco2')} + ?` : `${fmt(d.value)} ${t('gco2')}`;
        return `<div class="bar-row">${img}<span>${tr(d.label)}</span><div class="bar-track"><div class="bar-fill${!d.unknown && d.value === min ? ' best' : ''}" style="width:${pct}%"></div><span class="bar-val">${val}</span></div></div>`;
      }).join('');
    };
    input.addEventListener('input', draw);
    draw();
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const e = $('#toast');
    e.textContent = msg;
    e.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { e.hidden = true; }, 3200);
  }

  /* ==========================================================================
     Přepínání her a jazyka
     ========================================================================== */
  function setGame(g) {
    game = g;
    marks = {};
    selected = null;
    feedback.className = 'feedback';
    feedback.textContent = '';
    save();
    applyTexts();
    renderStage();
    stageArea.scrollTo(0, 0);
    if (!seen[game]) showIntro();
  }

  function setLang(l) {
    lang = l;
    save();
    if (!modal.hidden) closeModal();
    applyTexts();
    renderStage();
    if (feedback.textContent) check();
  }

  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { if (b.dataset.game !== game) setGame(b.dataset.game); }));
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }));
  $('#btn-help').addEventListener('click', showIntro);
  $('#btn-check').addEventListener('click', check);
  $('#btn-hint').addEventListener('click', hint);
  $('#btn-solve').addEventListener('click', () => openModal({
    title: t('solution'), html: `<p class="lead">${t('confirmSolve')}</p>`,
    actions: [{ label: t('cancel') }, { label: t('yesSolve'), primary: true, onClick: solve }],
  }));
  $('#btn-reset').addEventListener('click', () => openModal({
    title: t('reset'), html: `<p class="lead">${t('confirmReset')}</p>`,
    actions: [{ label: t('cancel') }, { label: t('yesReset'), primary: true, onClick: reset }],
  }));

  window.addEventListener('resize', layout);

  applyTexts();
  layout();
  renderStage();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderItems());
  if (!seen[game]) showIntro();
})();
