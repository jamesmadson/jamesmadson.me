// ============================================================
// Graft — conversation curation prototype
// Scripted demo: every branch is authored. No model runs here.
// State: { discovered: [branchIds], active: branchId, kept: [{blockId}] }
// persisted to localStorage so a visitor's grafting survives reload.
// ============================================================
(function () {
  var app = document.getElementById('graft_app');
  if (!app) return;

  // ---------- the script ----------
  // Turns are shared by reference: a branch = parent turns up to its
  // fork point, then its own continuation. Blocks are the keepable
  // units; ids are stable so provenance survives any navigation.
  var SCRIPT = {
    main: {
      name: 'main',
      parent: null,
      forkTurn: null,
      turns: [
        { role: 'user', text: ["I need a hero line for my portfolio. Twenty years of design and front-end code, brands and product, and I never split the two. Give me options."] },
        { role: 'assistant',
          text: ["Three directions, different weights:"],
          blocks: [
            { id: 'm1', text: 'Designer. Engineer. Both, always.' },
            { id: 'm2', text: 'I design products and build them too.' },
            { id: 'm3', text: 'Twenty years of design, shipped in code.' }
          ],
          forks: [
            { dir: 'Shorter', branch: 'shorter' },
            { dir: 'Warmer', branch: 'warmer' }
          ]
        },
        { role: 'user', text: ["Closer, but they read like taglines. I want it to sound like a person."] },
        { role: 'assistant',
          text: ["Then stop describing the work and say what you believe about it:"],
          blocks: [
            { id: 'm4', text: 'I make things that work, and work well.' },
            { id: 'm5', text: 'A lot of different things. All design.' }
          ],
          forks: [
            { dir: 'More honest', branch: 'honest' }
          ]
        }
      ]
    },
    shorter: {
      name: 'shorter',
      parent: 'main',
      forkTurn: 1,
      turns: [
        { role: 'user', text: ["Shorter. Punchy. Three words max."] },
        { role: 'assistant',
          text: ["Compression costs nuance, but here's the floor:"],
          blocks: [
            { id: 's1', text: 'Design, shipped.' },
            { id: 's2', text: 'Built by design.' },
            { id: 's3', text: 'Design that ships.' }
          ],
          forks: []
        }
      ]
    },
    warmer: {
      name: 'warmer',
      parent: 'main',
      forkTurn: 1,
      turns: [
        { role: 'user', text: ["Warmer. Like I'm talking to a friend, not a hiring panel."] },
        { role: 'assistant',
          text: ["Warm means specific. Try leading with the person:"],
          blocks: [
            { id: 'w1', text: "Hi, I'm James. I design things, then I build them." },
            { id: 'w2', text: "I've been making the web since I was seventeen." }
          ],
          forks: []
        }
      ]
    },
    honest: {
      name: 'honest',
      parent: 'main',
      forkTurn: 3,
      turns: [
        { role: 'user', text: ["What's the most honest version? What do I actually keep saying?"] },
        { role: 'assistant',
          text: ["You've said the same thing four different ways in this thread. Said plainly, it's this:"],
          blocks: [
            { id: 'h1', text: 'Design and engineering are the same job to me.' }
          ],
          forks: []
        }
      ]
    }
  };

  var STORE_KEY = 'graft_v1';
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = load() || { discovered: ['main'], active: 'main', kept: [] };

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- derived helpers ----------

  // Full turn list for a branch: inherited parent turns + its own.
  function turnsFor(id) {
    var b = SCRIPT[id];
    if (!b.parent) return b.turns.map(function (t, i) { return { t: t, branch: id, index: i, inherited: false }; });
    var parentAll = turnsFor(b.parent).slice(0, b.forkTurn + 1).map(function (row) {
      return { t: row.t, branch: row.branch, index: row.index, inherited: true };
    });
    return parentAll.concat(b.turns.map(function (t, i) { return { t: t, branch: id, index: i, inherited: false }; }));
  }

  function findBlock(blockId) {
    var ids = Object.keys(SCRIPT);
    for (var i = 0; i < ids.length; i++) {
      var turns = SCRIPT[ids[i]].turns;
      for (var j = 0; j < turns.length; j++) {
        var blocks = turns[j].blocks || [];
        for (var k = 0; k < blocks.length; k++) {
          if (blocks[k].id === blockId) return { block: blocks[k], branch: ids[i], turn: j };
        }
      }
    }
    return null;
  }

  function isKept(blockId) {
    return state.kept.indexOf(blockId) !== -1;
  }

  // ---------- rendering ----------

  var treeEl = document.getElementById('graft_tree');
  var threadEl = document.getElementById('graft_thread');
  var pillsEl = document.getElementById('graft_branch_pills');
  var masterEl = document.getElementById('graft_master');
  var masterEmpty = document.getElementById('graft_master_empty');
  var copyBtn = document.getElementById('graft_copy');
  var compareEl = document.getElementById('graft_compare');
  var compareToggle = document.getElementById('graft_compare_toggle');
  var cmpA = document.getElementById('graft_cmp_a');
  var cmpB = document.getElementById('graft_cmp_b');
  var comparing = false;

  function renderAll() {
    renderTree();
    renderPills();
    renderThread();
    renderMaster();
    if (comparing) renderCompare();
    save();
  }

  // --- tree: horizontal trunk with fork rows, ghosts for untaken paths
  function renderTree() {
    var NS = 'http://www.w3.org/2000/svg';
    treeEl.innerHTML = '';

    var X0 = 24, STEP = 96, Y_MAIN = 44, ROW = 46, R = 7;
    var rows = { main: Y_MAIN };
    var order = ['shorter', 'warmer', 'honest'];
    var nextRow = 1;
    order.forEach(function (id) {
      if (state.discovered.indexOf(id) !== -1) { rows[id] = Y_MAIN + ROW * nextRow++; }
    });
    // ghost rows sit below discovered ones
    order.forEach(function (id) {
      if (!(id in rows)) { rows[id] = Y_MAIN + ROW * nextRow++; }
    });

    var height = Y_MAIN + ROW * nextRow + 8;
    treeEl.setAttribute('viewBox', '0 0 760 ' + Math.max(150, height));
    treeEl.style.height = Math.max(150, height) + 'px';

    function xFor(globalIndex) { return X0 + STEP * globalIndex; }

    function mkEl(tag, attrs) {
      var el = document.createElementNS(NS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    }

    // main trunk
    var mainTurns = SCRIPT.main.turns;
    var trunkEnd = xFor(mainTurns.length - 1);
    treeEl.appendChild(mkEl('path', {
      'class': 'g_edge' + (state.active === 'main' ? ' active' : ''),
      d: 'M ' + X0 + ' ' + Y_MAIN + ' H ' + trunkEnd
    }));
    treeEl.appendChild(mkTreeLabel('main', X0, Y_MAIN - 18, false));

    // branches: discovered get solid rows; untaken get ghost stubs
    order.forEach(function (id) {
      var b = SCRIPT[id];
      var discovered = state.discovered.indexOf(id) !== -1;
      var y = rows[id];
      var fx = xFor(b.forkTurn);

      if (discovered) {
        var endX = fx + STEP * b.turns.length;
        treeEl.appendChild(mkEl('path', {
          'class': 'g_edge' + (state.active === id ? ' active' : ''),
          d: 'M ' + fx + ' ' + Y_MAIN + ' C ' + fx + ' ' + (Y_MAIN + 26) + ', ' + (fx + 30) + ' ' + y + ', ' + (fx + 44) + ' ' + y + ' H ' + endX
        }));
        treeEl.appendChild(mkTreeLabel(b.name, fx + 44, y - 14, false, id));
        for (var i = 0; i < b.turns.length; i++) {
          treeEl.appendChild(mkNode(fx + 44 + STEP * i + (i === 0 ? 0 : 0), y, id, i));
        }
      } else {
        var stubX = fx + 46;
        var ghost = mkEl('g', { 'class': 'g_ghost_hit', tabindex: '0', role: 'button' });
        ghost.setAttribute('aria-label', 'Fork: ' + forkDirFor(id) + ' — take this path');
        ghost.appendChild(mkEl('path', {
          'class': 'g_edge ghost',
          d: 'M ' + fx + ' ' + Y_MAIN + ' C ' + fx + ' ' + (Y_MAIN + 26) + ', ' + (fx + 26) + ' ' + y + ', ' + (fx + 38) + ' ' + y + ' H ' + stubX
        }));
        var gl = mkTreeLabel(forkDirFor(id) + ' ?', fx + 46, y + 4, true);
        ghost.appendChild(gl);
        ghost.addEventListener('click', function () { fork(id); });
        ghost.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fork(id); }
        });
        treeEl.appendChild(ghost);
      }
    });

    // trunk nodes drawn last so they sit above edges
    for (var i = 0; i < mainTurns.length; i++) {
      treeEl.appendChild(mkNode(xFor(i), Y_MAIN, 'main', i));
    }

    function mkNode(cx, cy, branch, turnIndex) {
      var g = mkEl('g', {
        'class': 'g_node' + (state.active === branch ? ' active' : ''),
        tabindex: '0', role: 'button'
      });
      g.setAttribute('data-node', branch + ':' + turnIndex);
      g.setAttribute('aria-label', 'Go to ' + SCRIPT[branch].name + ', turn ' + (turnIndex + 1));
      g.appendChild(mkEl('circle', { cx: cx, cy: cy, r: R }));
      function go() { setActive(branch); scrollToTurn(branch, turnIndex); }
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
      return g;
    }

    function mkTreeLabel(text, x, y, ghost, branchId) {
      var t = mkEl('text', { 'class': 'g_label' + (ghost ? ' ghostlabel' : ''), x: x, y: y });
      t.textContent = text;
      return t;
    }
  }

  function forkDirFor(branchId) {
    var ids = Object.keys(SCRIPT);
    for (var i = 0; i < ids.length; i++) {
      var turns = SCRIPT[ids[i]].turns;
      for (var j = 0; j < turns.length; j++) {
        var forks = turns[j].forks || [];
        for (var k = 0; k < forks.length; k++) {
          if (forks[k].branch === branchId) return forks[k].dir;
        }
      }
    }
    return SCRIPT[branchId].name;
  }

  // --- branch pills
  function renderPills() {
    pillsEl.innerHTML = '';
    state.discovered.forEach(function (id) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'graft_pill';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(state.active === id));
      btn.textContent = SCRIPT[id].name;
      btn.addEventListener('click', function () { setActive(id); });
      pillsEl.appendChild(btn);
    });
  }

  // --- thread
  function renderThread() {
    threadEl.innerHTML = '';
    turnsFor(state.active).forEach(function (row) {
      threadEl.appendChild(turnEl(row, false));
    });
  }

  function turnEl(row, inCompare) {
    var t = row.t;
    var wrap = document.createElement('div');
    wrap.className = 'graft_turn ' + t.role + (row.inherited ? ' inherited' : '');
    wrap.setAttribute('data-turn', row.branch + ':' + row.index);

    var role = document.createElement('p');
    role.className = 'graft_turn_role';
    role.textContent = t.role === 'user' ? 'You' : 'Assistant';
    wrap.appendChild(role);

    var body = document.createElement('div');
    body.className = 'graft_turn_body';
    t.text.forEach(function (para) {
      var p = document.createElement('p');
      p.textContent = para;
      body.appendChild(p);
    });

    (t.blocks || []).forEach(function (b) {
      var blockEl = document.createElement('div');
      blockEl.className = 'graft_block' + (isKept(b.id) ? ' kept' : '');
      var txt = document.createElement('span');
      txt.className = 'graft_block_text';
      txt.textContent = b.text;
      var keep = document.createElement('button');
      keep.type = 'button';
      keep.className = 'graft_keep';
      keep.textContent = isKept(b.id) ? 'Kept' : 'Keep';
      keep.setAttribute('aria-pressed', String(isKept(b.id)));
      keep.addEventListener('click', function () { toggleKeep(b.id); });
      blockEl.appendChild(txt);
      blockEl.appendChild(keep);
      body.appendChild(blockEl);
    });

    // fork affordances only on the live thread, not inside compare cols
    var forks = (t.forks || []);
    if (!inCompare && forks.length) {
      var rowEl = document.createElement('div');
      rowEl.className = 'graft_forkrow';
      var lab = document.createElement('span');
      lab.className = 'graft_forkrow_label';
      lab.textContent = 'Fork from here:';
      rowEl.appendChild(lab);
      forks.forEach(function (f) {
        var taken = state.discovered.indexOf(f.branch) !== -1;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'graft_fork' + (taken ? ' taken' : '');
        btn.textContent = taken ? f.dir + ' ✓' : f.dir;
        btn.addEventListener('click', function () { fork(f.branch); });
        rowEl.appendChild(btn);
      });
      body.appendChild(rowEl);
    }

    wrap.appendChild(body);
    return wrap;
  }

  // --- master
  function renderMaster() {
    masterEl.querySelectorAll('.graft_kept').forEach(function (n) { n.remove(); });
    masterEmpty.hidden = state.kept.length > 0;
    copyBtn.disabled = state.kept.length === 0;

    state.kept.forEach(function (blockId, idx) {
      var found = findBlock(blockId);
      if (!found) return;
      var card = document.createElement('div');
      card.className = 'graft_kept';

      var text = document.createElement('p');
      text.className = 'graft_kept_text';
      text.textContent = found.block.text;
      card.appendChild(text);

      var meta = document.createElement('div');
      meta.className = 'graft_kept_meta';

      var prov = document.createElement('button');
      prov.type = 'button';
      prov.className = 'graft_prov';
      prov.textContent = '↰ ' + SCRIPT[found.branch].name + ' · turn ' + (found.turn + 1);
      prov.setAttribute('aria-label', 'Show source: ' + SCRIPT[found.branch].name + ', turn ' + (found.turn + 1));
      prov.addEventListener('click', function () {
        setActive(found.branch);
        scrollToTurn(found.branch, found.turn, true);
      });
      meta.appendChild(prov);

      var actions = document.createElement('div');
      actions.className = 'graft_kept_actions';
      actions.appendChild(moveBtn('↑', 'Move up', idx, -1));
      actions.appendChild(moveBtn('↓', 'Move down', idx, 1));
      actions.appendChild(removeBtn(blockId));
      meta.appendChild(actions);

      card.appendChild(meta);
      masterEl.appendChild(card);
    });

    function moveBtn(glyph, label, idx, delta) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = glyph;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', function () {
        var to = idx + delta;
        if (to < 0 || to >= state.kept.length) return;
        var moved = state.kept.splice(idx, 1)[0];
        state.kept.splice(to, 0, moved);
        renderAll();
      });
      return b;
    }
    function removeBtn(blockId) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '×';
      b.setAttribute('aria-label', 'Remove from master');
      b.addEventListener('click', function () { toggleKeep(blockId); });
      return b;
    }
  }

  // --- compare
  function renderCompare() {
    fillPicker(cmpA, cmpA.value || state.active);
    var fallbackB = SCRIPT[state.active].parent || state.discovered.find(function (d) { return d !== cmpA.value; }) || 'main';
    fillPicker(cmpB, cmpB.value && cmpB.value !== cmpA.value ? cmpB.value : fallbackB);
    renderCompareCol(document.getElementById('graft_cmp_col_a'), cmpA.value);
    renderCompareCol(document.getElementById('graft_cmp_col_b'), cmpB.value);
  }

  function fillPicker(sel, val) {
    sel.innerHTML = '';
    state.discovered.forEach(function (id) {
      var o = document.createElement('option');
      o.value = id;
      o.textContent = SCRIPT[id].name;
      sel.appendChild(o);
    });
    sel.value = state.discovered.indexOf(val) !== -1 ? val : state.discovered[0];
  }

  function renderCompareCol(col, branchId) {
    col.innerHTML = '';
    var name = document.createElement('p');
    name.className = 'graft_col_name';
    name.textContent = SCRIPT[branchId].name;
    col.appendChild(name);
    // only the branch's own (divergent) turns — the shared history is
    // exactly what compare exists to strip away
    turnsFor(branchId).filter(function (r) { return !r.inherited || branchId === 'main'; })
      .forEach(function (row) { col.appendChild(turnEl(row, true)); });
  }

  // ---------- actions ----------

  function setActive(id) {
    state.active = id;
    renderAll();
  }

  function fork(branchId) {
    if (state.discovered.indexOf(branchId) === -1) state.discovered.push(branchId);
    state.active = branchId;
    renderAll();
    var own = turnsFor(branchId).filter(function (r) { return !r.inherited; });
    if (own.length) scrollToTurn(branchId, own[0].index);
  }

  function toggleKeep(blockId) {
    var at = state.kept.indexOf(blockId);
    if (at === -1) state.kept.push(blockId); else state.kept.splice(at, 1);
    renderAll();
  }

  function scrollToTurn(branch, index, flash) {
    var el = threadEl.querySelector('[data-turn="' + branch + ':' + index + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
    if (flash && !prefersReduced) {
      el.classList.remove('flashsrc');
      void el.offsetWidth;
      el.classList.add('flashsrc');
      var node = treeEl.querySelector('[data-node="' + branch + ':' + index + '"]');
      if (node) {
        node.classList.add('flash');
        setTimeout(function () { node.classList.remove('flash'); }, 1400);
      }
    }
  }

  // compare toggle
  compareToggle.addEventListener('click', function () {
    comparing = !comparing;
    compareToggle.setAttribute('aria-pressed', String(comparing));
    compareEl.hidden = !comparing;
    threadEl.hidden = comparing;
    if (comparing) renderCompare();
  });
  cmpA.addEventListener('change', renderCompare);
  cmpB.addEventListener('change', renderCompare);

  // copy markdown with provenance footnotes
  copyBtn.addEventListener('click', function () {
    var lines = ['# Kept from this exploration', ''];
    var notes = [];
    state.kept.forEach(function (blockId, i) {
      var f = findBlock(blockId);
      if (!f) return;
      lines.push('- ' + f.block.text + ' [^' + (i + 1) + ']');
      notes.push('[^' + (i + 1) + ']: ' + SCRIPT[f.branch].name + ', turn ' + (f.turn + 1));
    });
    var md = lines.concat([''], notes).join('\n');
    navigator.clipboard.writeText(md).then(function () {
      var orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = orig; }, 1600);
    });
  });

  // reset
  document.getElementById('graft_reset').addEventListener('click', function () {
    state = { discovered: ['main'], active: 'main', kept: [] };
    comparing = false;
    compareToggle.setAttribute('aria-pressed', 'false');
    compareEl.hidden = true;
    threadEl.hidden = false;
    renderAll();
  });

  renderAll();
}());
