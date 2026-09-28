/* =========================================================
   Socle Back-Office : gabarit, routeur, tableaux, graphiques
   Utilisé par l'administration et l'espace vendeur
   ========================================================= */
(function () {
  const { icon, esc, fmt, fmtN } = App;

  const BO = {
    cfg: null, role: null,
    mount(cfg) {
      this.cfg = cfg;
      this.role = App.store.get(cfg.key + '_role', cfg.defaultRole || null);
      document.body.classList.add('bo-body');
      document.body.innerHTML = `
        <div class="bo">
          <aside class="bo-side" id="bo-side">
            <div class="bo-brand"><a class="logo" href="${cfg.home}"><span class="logo-mark">${icon('bag')}</span>Site E_commerce</a><span class="tag">${cfg.tag}</span></div>
            <nav class="bo-menu" id="bo-menu" aria-label="Menu"></nav>
            <div class="bo-side-foot">${cfg.sideFoot || ''}</div>
          </aside>
          <div class="side-backdrop" data-side-close></div>
          <div class="bo-main">
            <header class="bo-top">
              <button class="btn btn-ghost btn-icon bo-burger" data-side aria-label="Menu">${icon('menu')}</button>
              <form class="search-box" id="bo-search"><input type="search" placeholder="${cfg.searchPh || 'Rechercher…'}" aria-label="Rechercher"><button aria-label="Rechercher">${icon('search')}</button></form>
              <div class="row" style="margin-left:auto;gap:8px">
                ${cfg.roles ? `<select class="select bo-role" id="bo-role" title="Démonstration : simuler un rôle">${cfg.roles.map(r => `<option value="${r.id}" ${r.id === this.role ? 'selected' : ''}>Rôle : ${r.nom}</option>`).join('')}</select>` : ''}
                <a class="btn btn-ghost btn-icon" href="${cfg.front}" title="Voir la boutique" aria-label="Voir le site">${icon('globe')}</a>
                <button class="btn btn-ghost btn-icon" data-notifs aria-label="Notifications" style="position:relative">${icon('bell')}<span class="count" style="position:absolute;top:4px;right:4px;min-width:16px;height:16px;border-radius:999px;background:var(--accent);color:#fff;font-size:.62rem;font-weight:700;display:grid;place-items:center">${cfg.notifs.length}</span></button>
                <div class="bo-user"><div class="avatar">${App.initials(cfg.user.nom)}</div><div class="who"><b class="small">${esc(cfg.user.nom)}</b><div class="xs muted" id="bo-user-role">${esc(cfg.user.role())}</div></div></div>
              </div>
            </header>
            <main class="bo-content" id="bo-view"></main>
          </div>
        </div>`;
      addEventListener('hashchange', () => this.route());
      document.addEventListener('click', e => {
        if (e.target.closest('[data-side]')) { document.getElementById('bo-side').classList.add('open'); document.body.classList.add('side-open'); }
        if (e.target.closest('[data-side-close]') || e.target.closest('.bo-link')) { document.getElementById('bo-side').classList.remove('open'); document.body.classList.remove('side-open'); }
        const rl = e.target.closest('[data-href]'); if (rl && !e.target.closest('a,button,input,select,label')) location.hash = rl.dataset.href;
        if (e.target.closest('[data-notifs]')) App.modal({ title: 'Notifications', tone: 'info', icon: 'bell', body: cfg.notifs.map(n => `<div class="list-item" style="padding:10px 0"><span class="li-ico" style="background:var(--${n[0]}-50);color:var(--${n[0]})">${icon(n[1], 'sm')}</span><div class="grow small"><b>${n[2]}</b><div class="xs muted">${n[3]}</div></div></div>`).join(''), actions: [{ label: 'Tout marquer comme lu', cls: 'btn-primary' }] });
      });
      const rs = document.getElementById('bo-role');
      if (rs) rs.addEventListener('change', () => { this.role = rs.value; App.store.set(cfg.key + '_role', rs.value); document.getElementById('bo-user-role').textContent = cfg.user.role(); const u = document.querySelector('.bo-user'); u.querySelector('b').textContent = cfg.user.nom; u.querySelector('.avatar').textContent = App.initials(cfg.user.nom); this.route(); App.toast('Vue simulée : ' + rs.options[rs.selectedIndex].text.replace('Rôle : ', '')); });
      document.getElementById('bo-search').addEventListener('submit', e => { e.preventDefault(); const q = e.target.querySelector('input').value.trim(); if (q && cfg.onSearch) cfg.onSearch(q); });
      this.route();
    },
    allowed(id) { const c = this.cfg; if (!c.roles) return true; const r = c.roles.find(x => x.id === this.role); return r.modules.includes('*') || r.modules.includes(id); },
    menu(cur) {
      let g = null;
      document.getElementById('bo-menu').innerHTML = this.cfg.menu.map(m => {
        let h = '';
        if (m.group !== g) { g = m.group; h += `<div class="bo-group">${g}</div>`; }
        const ok = this.allowed(m.id);
        const cnt = typeof m.count === 'function' ? m.count() : m.count;
        return h + `<a href="#${m.id}" class="bo-link ${cur === m.id ? 'on' : ''} ${ok ? '' : 'locked'}">${icon(m.icon)} ${m.label}${ok ? (cnt ? `<span class="cnt">${cnt}</span>` : '') : icon('lock', 'sm')}</a>`;
      }).join('');
    },
    route() {
      const [id, ...rest] = decodeURIComponent(location.hash.slice(1) || this.cfg.menu[0].id).split('/');
      const r = this.cfg.routes[id] ? id : this.cfg.menu[0].id;
      const menuId = this.cfg.alias && this.cfg.alias[r] ? this.cfg.alias[r] : r;
      this.menu(menuId);
      const v = document.getElementById('bo-view');
      if (!this.allowed(menuId)) {
        v.innerHTML = `<div class="panel denied">${icon('lock')}<h2>Accès refusé</h2><p class="text-2">Le rôle « ${esc(this.cfg.roles.find(x => x.id === this.role).nom)} » n’a pas accès au module « ${esc(this.cfg.menu.find(m => m.id === menuId).label)} ».</p><p class="xs muted">Contrôle d’accès par rôle appliqué côté serveur (API) — la maquette le simule ici.</p><a class="btn btn-primary" href="#${this.cfg.menu[0].id}">Retour au tableau de bord</a></div>`;
        return;
      }
      v.innerHTML = this.cfg.routes[r](...rest);
      if (this.cfg.after && this.cfg.after[r]) this.cfg.after[r](...rest);
      scrollTo({ top: 0 });
    },
    refresh() { this.route(); },

    // ---------- Helpers d'affichage ----------
    head(title, sub, actions, crumb) {
      return `${crumb ? `<div class="bo-crumb">${crumb}</div>` : ''}<div class="bo-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="actions">${actions || ''}</div></div>`;
    },
    kpi(label, val, ico, sub, delta) {
      return `<div class="kpi"><div class="k-top">${label}<span class="k-ico">${icon(ico, 'sm')}</span></div><div class="k-val">${val}</div><div class="k-sub">${delta != null ? `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} %</span> ` : ''}${sub || ''}</div></div>`;
    },
    panel(title, body, link, flush) {
      return `<section class="panel">${title ? `<div class="panel-head"><h3>${title}</h3>${link || ''}</div>` : ''}${flush ? body : `<div class="panel-body">${body}</div>`}</section>`;
    },
    table(cols, rows, opts) {
      opts = opts || {};
      return `<div class="table-wrap" style="border-radius:0"><table class="table"><thead><tr>${cols.map(c => `<th class="${c.cls || ''}">${c.l}</th>`).join('')}</tr></thead><tbody>
        ${rows.length ? rows.map(r => `<tr class="${opts.href ? 'row-link' : ''}" ${opts.href ? `data-href="${opts.href(r)}"` : ''}>${cols.map(c => `<td class="${c.cls || ''}">${c.v(r)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length}" class="center muted" style="padding:30px">${opts.empty || 'Aucun résultat'}</td></tr>`}
        </tbody></table></div>${opts.foot !== false ? `<div class="table-foot"><span>${rows.length} ligne(s)${opts.total ? ' sur ' + opts.total : ''}</span><span class="row" style="gap:6px"><button class="btn btn-sm" disabled>Précédent</button><button class="btn btn-sm" ${opts.total > rows.length ? '' : 'disabled'}>Suivant</button></span></div>` : ''}`;
    },
    sw(checked, attrs) { return `<label class="switch"><input type="checkbox" ${checked ? 'checked' : ''} ${attrs || ''}><span></span></label>`; },
    field(label, name, value, opts) {
      opts = opts || {};
      const req = opts.rule && opts.rule.includes('req');
      const ctl = opts.type === 'select' ? `<select class="select" name="${name}" ${opts.rule ? `data-rule="${opts.rule}"` : ''}>${opts.options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
        : opts.type === 'textarea' ? `<textarea class="textarea" name="${name}" ${opts.rule ? `data-rule="${opts.rule}"` : ''} ${opts.attrs || ''}>${esc(value)}</textarea>`
          : `<input class="input" name="${name}" type="${opts.type || 'text'}" value="${esc(value == null ? '' : value)}" ${opts.rule ? `data-rule="${opts.rule}"` : ''} ${opts.attrs || ''}>`;
      return `<div class="field ${opts.cls || ''}"><label>${label}${req ? ' <span class="req">*</span>' : ''}</label>${ctl}<span class="err"></span>${opts.hint ? `<span class="hint">${opts.hint}</span>` : ''}</div>`;
    },

    // ---------- Graphiques (une seule série, couleur primaire, survol) ----------
    lineChart(id, data, opts) {
      opts = opts || {};
      const W = 720, H = 240, L = 56, R = 12, T = 12, B = 28;
      const max = Math.max(...data.map(d => d.v)) * 1.12;
      const x = i => L + (i * (W - L - R)) / (data.length - 1);
      const y = v => T + (H - T - B) * (1 - v / max);
      const pts = data.map((d, i) => [x(i), y(d.v)]);
      const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const ticks = [0, .25, .5, .75, 1].map(f => max * f);
      const fmtAxis = v => v >= 1e6 ? (v / 1e6).toFixed(1).replace('.', ',') + ' M' : v >= 1e3 ? Math.round(v / 1e3) + ' k' : Math.round(v);
      return `<div class="chart" id="${id}" role="img" aria-label="${esc(opts.label || '')}"><svg viewBox="0 0 ${W} ${H}">
        <defs><linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0D9488" stop-opacity=".22"/><stop offset="1" stop-color="#0D9488" stop-opacity="0"/></linearGradient></defs>
        <g class="grid">${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}</g>
        <g class="axis">${ticks.map(t => `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${fmtAxis(t)}</text>`).join('')}
          ${data.map((d, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${d.l}</text>` : '').join('')}</g>
        <path class="area" d="${path} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z"/>
        <path class="line" d="${path}"/>
        <line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/>
        <circle class="dot" r="5" style="display:none"/>
        <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" data-hit/>
      </svg><div class="tip" style="display:none"></div></div>`;
    },
    bindLine(id, data, fmtV) {
      const el = document.getElementById(id); if (!el) return;
      const svg = el.querySelector('svg'); const tip = el.querySelector('.tip'); const cross = el.querySelector('.cross'); const dot = el.querySelector('.dot');
      const W = 720, L = 56, R = 12, T = 12, B = 28, H = 240; const max = Math.max(...data.map(d => d.v)) * 1.12;
      const move = ev => {
        const r = svg.getBoundingClientRect(); const cx = (ev.clientX - r.left) * W / r.width;
        const i = Math.max(0, Math.min(data.length - 1, Math.round((cx - L) / ((W - L - R) / (data.length - 1)))));
        const px = L + i * (W - L - R) / (data.length - 1); const py = T + (H - T - B) * (1 - data[i].v / max);
        cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.style.display = ''; dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.style.display = '';
        tip.style.display = ''; tip.style.left = (px / W * r.width) + 'px'; tip.style.top = (py / H * r.height) + 'px';
        tip.innerHTML = `<span>${data[i].full || data[i].l}</span><b>${fmtV(data[i].v)}</b>${data[i].extra ? `<span>${data[i].extra}</span>` : ''}`;
      };
      const hit = svg.querySelector('[data-hit]');
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
      hit.addEventListener('pointerleave', () => { tip.style.display = 'none'; cross.style.display = 'none'; dot.style.display = 'none'; });
    },
    hbars(items, fmtV) {
      const max = Math.max(...items.map(i => i.v), 1);
      return `<div class="hbars">${items.map(i => `<div class="hbar" title="${esc(i.l)} : ${fmtV(i.v)}"><span class="small text-2" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.l)}</span><div class="track"><div class="fill" style="width:${Math.max(2, i.v / max * 100)}%"></div></div><b>${fmtV(i.v)}</b></div>`).join('')}</div>`;
    },
    days(n) { return DB.ventes30.slice(-n).map(d => ({ l: d.date.getDate() + '/' + (d.date.getMonth() + 1), full: d.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), v: d.ca, extra: d.commandes + ' commandes' })); }
  };
  window.BO = BO;
})();
