/* =========================================================
   Noyau commun : icônes, formatage, stockage, panier,
   modales, notifications, composants produit.
   ========================================================= */
(function () {
  const ICONS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/><path d="M10 21v-5h4v5"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    package: '<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-9"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    call: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    alert: '<path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    // Icônes produits
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    lamp: '<path d="M8 2h8l4 10H4z"/><path d="M12 12v6"/><path d="M8 22h8"/><path d="M12 18v4"/>',
    sparkles: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="M19 3v4M17 5h4"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    laptop: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 10v2l1 1"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05M7.88 16.36l.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>',
    pot: '<path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>'
  };

  const icon = (n, cls) => `<svg class="ico ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.box}</svg>`;

  // ---------- Formatage ----------
  const fmt = n => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' Ar';
  const fmtN = n => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const fmtDate = s => { const [d, t] = String(s).split(' '); const [y, m, j] = d.split('-'); return `${+j} ${MOIS[+m - 1]} ${y}${t ? ' à ' + t.replace(':', ' h ') : ''}`; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = k => new URLSearchParams(location.search).get(k);
  const initials = s => s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // ---------- Stockage (tolérant aux erreurs) ----------
  const store = {
    get(k, def) { try { const v = localStorage.getItem('sec_' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('sec_' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  // ---------- Référentiel ----------
  const P = id => DB.produits.find(p => p.id === id);
  const V = id => DB.vendeurs.find(v => v.id === id);
  const C = id => DB.categories.find(c => c.id === id);
  const Z = id => DB.zones.find(z => z.id === id);
  const PAY = id => DB.paiements.find(p => p.id === id);
  const CL = id => DB.clients.find(c => c.id === id);
  const unitPrice = p => (p.promo != null ? p.promo : p.prix);
  const dispo = p => Math.max(0, p.stock - (p.reserve || 0));
  const hueOf = p => { const c = C(p.cat); return (c ? c.hue : 200) + (parseInt(p.id.slice(1), 10) % 3) * 8; };
  const pct = p => (p.promo != null ? Math.round((1 - p.promo / p.prix) * 100) : 0);

  // ---------- Panier ----------
  const Cart = {
    items() { return store.get('cart', []); },
    save(items) { store.set('cart', items); document.dispatchEvent(new CustomEvent('cart:change')); },
    count() { return this.items().reduce((s, i) => s + i.qte, 0); },
    key(id, v) { return id + '|' + (v || ''); },
    add(id, qte, variante) {
      const p = P(id); if (!p) return { ok: false, msg: 'Produit introuvable.' };
      if (p.variantes && !variante) return { ok: false, msg: 'Veuillez choisir une option (' + Object.keys(p.variantes).join(', ') + ') avant d’ajouter au panier.' };
      const items = this.items();
      const dejaProduit = items.filter(i => i.id === id).reduce((s, i) => s + i.qte, 0);
      const d = dispo(p);
      if (d <= 0) return { ok: false, msg: 'Ce produit est en rupture de stock.' };
      if (dejaProduit + qte > d) return { ok: false, msg: `Stock insuffisant : ${d} disponible(s), ${dejaProduit} déjà dans votre panier.` };
      const k = this.key(id, variante);
      const ex = items.find(i => this.key(i.id, i.variante) === k);
      if (ex) ex.qte += qte; else items.push({ id, qte, variante: variante || null });
      this.save(items); return { ok: true };
    },
    setQty(k, qte) {
      const items = this.items(); const it = items.find(i => this.key(i.id, i.variante) === k); if (!it) return { ok: false };
      const p = P(it.id); const autres = items.filter(i => i.id === it.id && i !== it).reduce((s, i) => s + i.qte, 0);
      if (qte < 1) return { ok: false, msg: 'La quantité minimale est 1. Utilisez « Retirer » pour supprimer l’article.' };
      if (qte + autres > dispo(p)) return { ok: false, msg: `Stock insuffisant : ${dispo(p)} disponible(s) pour ce produit.` };
      it.qte = qte; this.save(items); return { ok: true };
    },
    remove(k) { this.save(this.items().filter(i => this.key(i.id, i.variante) !== k)); },
    clear() { this.save([]); },
    detail() {
      return this.items().map(i => { const p = P(i.id); return p ? { ...i, k: this.key(i.id, i.variante), p, v: V(p.vendeur), prix: unitPrice(p), total: unitPrice(p) * i.qte } : null; }).filter(Boolean);
    }
  };

  // ---------- Codes promo ----------
  function applyPromo(code, lignes, today) {
    const pr = DB.promos.find(x => x.code === String(code || '').trim().toUpperCase());
    today = today || '2026-09-28';
    if (!pr) return { ok: false, msg: 'Code promo inconnu.' };
    if (!pr.actif || today < pr.debut || today > pr.fin) return { ok: false, msg: 'Ce code promo n’est plus valable (période du ' + fmtDate(pr.debut) + ' au ' + fmtDate(pr.fin) + ').' };
    const base = lignes.filter(l => !pr.cat || l.p.cat === pr.cat).reduce((s, l) => s + l.total, 0);
    if (!base) return { ok: false, msg: 'Aucun article de votre panier n’est concerné par ce code (' + pr.cible + ').' };
    const st = lignes.reduce((s, l) => s + l.total, 0);
    if (st < pr.min) return { ok: false, msg: 'Montant minimum de ' + fmt(pr.min) + ' requis pour ce code.' };
    const remise = pr.type === 'pourcent' ? Math.round(base * pr.valeur / 100) : Math.min(pr.valeur, base);
    return { ok: true, promo: pr, remise };
  }

  // ---------- Favoris ----------
  const Favs = {
    all() { return store.get('favs', ['p9', 'p16']); },
    has(id) { return this.all().includes(id); },
    toggle(id) { const f = this.all(); const i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); store.set('favs', f); return i < 0; }
  };

  // ---------- Notifications & modales (jamais d'alert() natif) ----------
  function toast(msg, type, link) {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = icon(type === 'error' ? 'alert' : type === 'warning' ? 'info' : 'check') + `<span>${msg}</span>` + (link ? `<a href="${link.href}">${link.label}</a>` : '');
    box.appendChild(t);
    setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3600);
  }

  function modal(o) {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    const tone = o.tone || 'info';
    const ic = { info: 'info', success: 'check', warning: 'alert', danger: 'alert' }[tone];
    bd.innerHTML = `<div class="modal ${o.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mdl-t">
      <div class="modal-head">${o.noIcon ? '' : `<div class="modal-ico ${tone}">${icon(o.icon || ic)}</div>`}<h3 id="mdl-t">${o.title || ''}</h3>
      <button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Fermer">${icon('x')}</button></div>
      <div class="modal-body">${o.body || ''}</div>
      ${(o.actions || []).length ? `<div class="modal-foot">${o.actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-act="${i}">${a.label}</button>`).join('')}</div>` : ''}</div>`;
    const close = () => { bd.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    bd.addEventListener('click', e => {
      if (e.target === bd || e.target.closest('[data-close]')) close();
      const b = e.target.closest('[data-act]');
      if (b) { const a = o.actions[+b.dataset.act]; if (!a.onClick || a.onClick(bd, close) !== false) close(); }
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(bd);
    if (o.onOpen) o.onOpen(bd, close);
    const f = bd.querySelector('input, select, textarea, .modal-foot .btn'); if (f) setTimeout(() => f.focus(), 30);
    return close;
  }
  const confirmBox = (title, body, onYes, opts) => modal({
    title, body, tone: (opts && opts.tone) || 'warning',
    actions: [{ label: 'Annuler' }, { label: (opts && opts.yes) || 'Confirmer', cls: (opts && opts.yesCls) || 'btn-primary', onClick: onYes }]
  });

  // ---------- Validation de formulaires ----------
  const RX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    telMg: /^(\+261|0)\s?3[2-478]\s?\d{2}\s?\d{3}\s?\d{2}$/ // 032, 033, 034, 037, 038
  };
  function validate(form) {
    let ok = true;
    form.querySelectorAll('[data-rule]').forEach(inp => {
      const f = inp.closest('.field'); const v = inp.value.trim(); let err = '';
      const rules = inp.dataset.rule.split(' ');
      if (rules.includes('req') && !v) err = 'Ce champ est obligatoire.';
      else if (v && rules.includes('email') && !RX.email.test(v)) err = 'Adresse e-mail invalide.';
      else if (v && rules.includes('tel') && !RX.telMg.test(v)) err = 'Numéro malgache invalide (ex. 034 12 345 67).';
      else if (v && rules.includes('pwd') && (v.length < 8 || !/\d/.test(v) || !/[A-Za-z]/.test(v))) err = '8 caractères minimum, avec lettres et chiffres.';
      if (f) { f.classList.toggle('error', !!err); const e = f.querySelector('.err'); if (e) e.textContent = err; }
      if (err) ok = false;
    });
    const first = form.querySelector('.field.error input, .field.error select, .field.error textarea');
    if (first) first.focus();
    return ok;
  }
  // validation immédiate à la sortie du champ
  document.addEventListener('focusout', e => {
    const inp = e.target.closest && e.target.closest('[data-rule]');
    if (inp && inp.value.trim()) { const f = inp.closest('.field'); const form = inp.closest('form'); if (f && form && f.classList.contains('error')) validate(form); }
  });

  // ---------- Composants ----------
  const pv = (p, cls) => `<div class="pv ${cls || ''}" style="--h:${hueOf(p)}">${icon(p.icon)}</div>`;
  const pvCat = c => `<div class="pv" style="--h:${c.hue}">${icon(c.icon)}</div>`;
  const stars = n => Array.from({ length: 5 }, (_, i) => icon('star', i < Math.round(n) ? '' : 'off')).join('');
  const priceHtml = (p, lg) => `<div class="price ${lg ? 'lg' : ''}">${p.promo != null ? `<span class="now promo">${fmt(p.promo)}</span><span class="old">${fmt(p.prix)}</span>` : `<span class="now">${fmt(p.prix)}</span>`}</div>`;
  function stockHtml(p) {
    const d = dispo(p);
    if (d <= 0) return '<span class="stock out">Rupture de stock</span>';
    if (d <= p.seuil) return `<span class="stock low">Plus que ${d} en stock</span>`;
    return '<span class="stock ok">En stock</span>';
  }
  function badgesHtml(p) {
    const b = [];
    if (p.promo != null) b.push(`<span class="badge badge-promo">-${pct(p)} %</span>`);
    if (p.badge === 'new') b.push('<span class="badge badge-new">Nouveau</span>');
    if (p.badge === 'best') b.push('<span class="badge badge-primary">Meilleure vente</span>');
    return b.join('');
  }
  function productCard(p, base) {
    base = base || '';
    const v = V(p.vendeur); const out = dispo(p) <= 0;
    return `<article class="pcard ${out ? 'out' : ''}">
      <div class="badges">${badgesHtml(p)}</div>
      <button class="fav ${Favs.has(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Ajouter aux favoris">${icon('heart', 'sm')}</button>
      <a href="${base}produit.html?id=${p.id}">${pv(p)}</a>
      <div class="pc-body">
        <span class="pc-vendor">${icon('store', 'sm')} ${esc(v.nom)}</span>
        <a href="${base}produit.html?id=${p.id}" class="pc-name">${esc(p.nom)}</a>
        <span class="rating"><span class="stars">${stars(p.note)}</span>(${p.avis})</span>
        <div class="pc-foot">${priceHtml(p)}
          <button class="add" data-add="${p.id}" ${out ? 'disabled title="Rupture de stock"' : ''} aria-label="Ajouter au panier">${icon(p.variantes ? 'eye' : 'plus')}</button></div>
      </div></article>`;
  }
  const statusPill = (map, k) => { const s = DB[map][k]; return s ? `<span class="badge badge-${s.c}"><span class="dot"></span>${s.l}</span>` : ''; };

  // Délégation : favoris & ajout rapide
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]');
    if (f) { e.preventDefault(); const on = Favs.toggle(f.dataset.fav); f.classList.toggle('on', on); toast(on ? 'Ajouté à vos favoris' : 'Retiré de vos favoris'); return; }
    const a = e.target.closest('[data-add]');
    if (a) {
      e.preventDefault(); const p = P(a.dataset.add);
      if (p.variantes) { quickView(p); return; }
      const r = Cart.add(p.id, 1);
      if (r.ok) toast('« ' + esc(p.nom) + ' » ajouté au panier', '', { href: (window.BASE || '') + 'panier.html', label: 'Voir le panier' });
      else modal({ title: 'Ajout impossible', body: `<p>${r.msg}</p>`, tone: 'warning', actions: [{ label: 'Compris', cls: 'btn-primary' }] });
    }
  });

  function quickView(p) {
    const sel = {};
    const groups = Object.entries(p.variantes).map(([k, vals]) => `<div class="variant-group"><div class="lbl">${k} <span class="req" style="color:var(--danger)">*</span></div><div class="opts">${vals.map(v => `<button class="opt" data-g="${k}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`).join('');
    modal({
      title: esc(p.nom), noIcon: true,
      body: `<div class="row" style="align-items:flex-start;gap:16px"><div style="width:110px;flex:none">${pv(p, 'sm')}</div><div class="grow">${priceHtml(p)}<div style="margin-top:6px">${stockHtml(p)}</div></div></div>${groups}<div class="alert alert-danger hidden" data-err>${icon('alert')}<span></span></div>`,
      onOpen(bd) {
        bd.addEventListener('click', e => { const o = e.target.closest('.opt'); if (!o) return; bd.querySelectorAll(`.opt[data-g="${o.dataset.g}"]`).forEach(x => x.classList.remove('on')); o.classList.add('on'); sel[o.dataset.g] = o.dataset.v; });
      },
      actions: [
        { label: 'Voir la fiche', onClick: () => { location.href = (window.BASE || '') + 'produit.html?id=' + p.id; } },
        {
          label: 'Ajouter au panier', cls: 'btn-primary', onClick(bd) {
            const keys = Object.keys(p.variantes); const err = bd.querySelector('[data-err]');
            if (keys.some(k => !sel[k])) { err.classList.remove('hidden'); err.querySelector('span').textContent = 'Veuillez sélectionner : ' + keys.filter(k => !sel[k]).join(', ') + '.'; return false; }
            const r = Cart.add(p.id, 1, keys.map(k => sel[k]).join(' / '));
            if (!r.ok) { err.classList.remove('hidden'); err.querySelector('span').textContent = r.msg; return false; }
            toast('« ' + esc(p.nom) + ' » ajouté au panier', '', { href: (window.BASE || '') + 'panier.html', label: 'Voir le panier' });
          }
        }
      ]
    });
  }

  // ---------- Commandes du client connecté ----------
  const Orders = {
    mine() { return store.get('orders', []).concat(DB.commandes.filter(o => o.client === 'c1')); },
    find(n) { return this.mine().find(o => o.numero === n) || DB.commandes.find(o => o.numero === n); },
    add(o) { const l = store.get('orders', []); l.unshift(o); store.set('orders', l); },
    nextNumber() { const n = store.get('seq', 1285); store.set('seq', n + 1); return 'CMD-2026-' + String(n).padStart(6, '0'); }
  };

  const User = {
    get() { return store.get('user', { id: 'c1', prenom: 'Hery', nom: 'Rakoto', email: 'hery.rakoto@exemple.mg', tel: '+261 34 12 345 67' }); },
    logged() { return store.get('logged', true); },
    login() { store.set('logged', true); }, logout() { store.set('logged', false); }
  };

  window.App = { ICONS, icon, fmt, fmtN, fmtDate, esc, qs, initials, store, P, V, C, Z, PAY, CL, unitPrice, dispo, hueOf, pct, Cart, Favs, applyPromo, toast, modal, confirmBox, validate, RX, pv, pvCat, stars, priceHtml, stockHtml, badgesHtml, productCard, statusPill, quickView, Orders, User };
})();
