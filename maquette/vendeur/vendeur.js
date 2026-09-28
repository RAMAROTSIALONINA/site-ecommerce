/* =========================================================
   Espace Vendeur — Site E_commerce (marketplace)
   Démo connectée en tant que « Saveurs de la SAVA » (v3)
   ========================================================= */
(function () {
  const { icon, esc, fmt, fmtN, fmtDate, P, V, Z, PAY, CL, pv, toast, modal, confirmBox, validate, statusPill, dispo, store } = App;
  const h = BO.head.bind(BO), panel = BO.panel.bind(BO), table = BO.table.bind(BO), kpi = BO.kpi.bind(BO), field = BO.field.bind(BO);
  const VID = 'v3'; const v = V(VID);
  const myProds = () => DB.produits.filter(p => p.vendeur === VID);
  const allOrders = () => store.get('orders', []).map(o => ({ ...o, date: o.date === 'maintenant' ? '2026-09-28 10:00' : o.date })).concat(DB.commandes);
  const prep = () => store.get('vprep_' + VID, {});
  // Sous-commandes : uniquement les lignes du vendeur connecté
  const subs = () => allOrders().filter(o => o.lignes.some(l => l.vendeur === VID)).map(o => {
    const lignes = o.lignes.filter(l => l.vendeur === VID); const brut = lignes.reduce((s, l) => s + l.prix * l.qte, 0);
    const com = Math.round(brut * v.commission / 100);
    const etat = prep()[o.numero] || (['expediee', 'en_livraison', 'livree'].includes(o.statutLivraison) ? 'remis' : o.statutLivraison === 'retour' ? 'retour' : o.statutLivraison === 'annulee' ? 'annule' : 'a_preparer');
    return { ...o, ref: o.numero + '-' + VID.toUpperCase(), lignes, brut, com, net: brut - com, etat };
  });
  const ETATS = { a_preparer: ['À préparer', 'warning'], pret: ['Prêt — en attente d’enlèvement', 'info'], remis: ['Remis au transporteur', 'success'], retour: ['Retour', 'danger'], annule: ['Annulé', 'danger'] };
  const etatPill = e => `<span class="badge badge-${ETATS[e][1]}"><span class="dot"></span>${ETATS[e][0]}</span>`;
  const pillStock = p => { const d = dispo(p); return d <= 0 ? '<span class="badge badge-danger">Rupture</span>' : d <= p.seuil ? '<span class="badge badge-warning">Alerte</span>' : '<span class="badge badge-success">OK</span>'; };
  const canShip = s => s.statutPaiement === 'paye' || s.paiement === 'cod';
  const days = () => BO.days(30).map(d => ({ ...d, v: Math.round(d.v * 0.11), extra: Math.round(d.v * 0.11 / 38000) + ' commandes' }));

  const routes = {
    dashboard() {
      const s = subs(); const todo = s.filter(x => x.etat === 'a_preparer' && canShip(x));
      const solde = DB.reversements.filter(r => r.vendeur === VID && r.statut === 'a_payer').reduce((a, r) => a + Math.round(r.brut * (1 - v.commission / 100)), 0);
      const d = days();
      return h('Bonjour, ' + esc(v.nom), 'Voici l’activité de votre boutique', `<a class="btn" href="../boutique.html?id=${VID}" target="_blank">${icon('eye', 'sm')} Voir ma boutique</a><a class="btn btn-primary" href="#produit/new">${icon('plus', 'sm')} Ajouter un produit</a>`) +
        (todo.length ? `<div class="alert alert-warning" style="margin-bottom:16px">${icon('package')}<span><b>${todo.length} commande(s) à préparer</b> — délai d’expédition engagé : 48 h. <a href="#commandes" style="font-weight:700">Voir</a></span></div>` : '') +
        `<div class="kpis">${kpi('Ventes 30 jours', fmt(d.reduce((a, x) => a + x.v, 0)), 'wallet', 'vs mois précédent', 12)}${kpi('Commandes à préparer', todo.length, 'package', s.length + ' sous-commandes au total')}${kpi('Solde à recevoir', fmt(solde), 'bank', 'reversement le 1er oct.')}${kpi('Note boutique', v.note + ' / 5', 'star', v.avis + ' avis')}</div>
        <div class="bo-grid g-2-1">${panel('Mes ventes — 30 derniers jours', BO.lineChart('ch-v', d, { label: 'Ventes quotidiennes de la boutique' }))}
          ${panel('Stock à surveiller', myProds().filter(p => dispo(p) <= p.seuil * 2).map(p => `<div class="list-item"><div style="width:40px">${pv(p, 'sm')}</div><div class="grow"><b class="small">${esc(p.nom)}</b><div class="xs muted">Disponible ${dispo(p)} · seuil ${p.seuil}</div></div>${pillStock(p)}</div>`).join('') || '<p class="muted small" style="padding:16px">Tout va bien.</p>', '<a href="#stock">Stock</a>', true)}</div>
        <div style="margin-top:16px">${panel('Dernières commandes', subTable(s.slice(0, 5)), '<a href="#commandes">Toutes</a>', true)}</div>`;
    },
    commandes() {
      return h('Mes commandes', 'Sous-commandes contenant vos produits · les informations client sont limitées à la préparation') + panel('', subTable(subs()), '', true);
    },
    commande(num) {
      const s = subs().find(x => x.numero === num); if (!s) return h('Commande introuvable');
      const c = CL(s.client);
      return h('Sous-commande ' + s.ref, `Commande passée le ${fmtDate(s.date)} · ${etatPill(s.etat)}`, `<button class="btn" onclick="window.print()">${icon('print', 'sm')} Bon de préparation</button>`, `<a href="#commandes">Mes commandes</a>${icon('chevron-right', 'sm')}<span>${s.ref}</span>`) +
        `<div class="bo-grid g-2-1"><div class="stack">
          ${panel('Articles à préparer', table([{ l: 'Produit', v: l => `<div class="cell-prod">${pv(P(l.produit), 'sm')}<div><b class="small">${esc(P(l.produit).nom)}</b><div class="xs muted">${P(l.produit).sku}${l.variante ? ' · ' + esc(l.variante) : ''}</div></div></div>` }, { l: 'Qté', cls: 'right', v: l => `<b>${l.qte}</b>` }, { l: 'P.U.', cls: 'right nowrap', v: l => fmt(l.prix) }, { l: 'Total', cls: 'right nowrap', v: l => fmt(l.prix * l.qte) }], s.lignes, { foot: false }), '', true)}
          ${panel('Préparation', !canShip(s) && s.etat === 'a_preparer' ? `<div class="alert alert-warning">${icon('clock')}<span>Paiement du client non confirmé (${DB.statutsPaiement[s.statutPaiement].l}). <b>Ne préparez pas encore ce colis</b> : vous serez notifié dès la confirmation.</span></div>`
            : s.etat === 'a_preparer' ? `<ol class="small text-2" style="padding-left:18px;margin-top:0"><li>Vérifiez les articles et leur état.</li><li>Emballez le colis et collez l’étiquette ${s.ref}.</li><li>Marquez le colis comme prêt : le coursier de la plateforme passe l’enlever sous 24 h.</li></ol><button class="btn btn-primary" data-ready="${s.numero}">${icon('check', 'sm')} Colis prêt pour l’enlèvement</button>`
              : s.etat === 'pret' ? `<div class="alert alert-info">${icon('truck')}<span>Colis prêt. Enlèvement prévu demain entre 9 h et 12 h à ${v.ville}.</span></div>` : `<p class="small text-2" style="margin:0">${ETATS[s.etat][0]}.</p>`)}
        </div><div class="stack">
          ${panel('Montants', `<div class="sum-row"><span>Ventes (TTC)</span><b>${fmt(s.brut)}</b></div><div class="sum-row"><span>Commission ${v.commission} %</span><span>− ${fmt(s.com)}</span></div><div class="sum-row total"><span>Net pour vous</span><span>${fmt(s.net)}</span></div><p class="xs muted" style="margin:8px 0 0">Versé au prochain cycle après livraison. Frais de livraison gérés par la plateforme.</p>`)}
          ${panel('Client', `<p class="small" style="margin:0"><b>${esc(c.prenom)} ${esc(c.nom.charAt(0))}.</b> · ${c.ville}<br><span class="muted">Livraison : ${Z(s.zone).nom}</span></p><p class="xs muted" style="margin:10px 0 0">${icon('lock', 'sm')} Les coordonnées complètes sont transmises au livreur uniquement (protection des données).</p>`)}
          ${panel('Paiement', `<div class="sum-row"><span>${PAY(s.paiement).nom}</span>${statusPill('statutsPaiement', s.statutPaiement)}</div>`)}
        </div></div>`;
    },
    produits() {
      return h('Mes produits', myProds().length + ' produits', `<a class="btn btn-primary" href="#produit/new">${icon('plus', 'sm')} Ajouter un produit</a>`) +
        panel('', table([
          { l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<div><b class="small">${esc(p.nom)}</b><div class="xs muted">${p.sku}</div></div></div>` },
          { l: 'Prix', cls: 'right nowrap', v: p => p.promo != null ? `<b style="color:var(--accent)">${fmt(p.promo)}</b><div class="xs muted" style="text-decoration:line-through">${fmt(p.prix)}</div>` : `<b>${fmt(p.prix)}</b>` },
          { l: 'Disponible', cls: 'right', v: p => `${dispo(p)} ${pillStock(p)}` }, { l: 'Ventes', cls: 'right', v: p => fmtN(p.ventes) }, { l: 'Note', cls: 'right', v: p => p.note ? p.note + ' ★' : '—' },
          { l: 'Statut', v: p => p.validation === 'attente' ? '<span class="badge badge-warning">En validation</span>' : p.actif ? '<span class="badge badge-success">En ligne</span>' : '<span class="badge">Masqué</span>' },
          { l: '', cls: 'right', v: p => `<a class="btn btn-sm btn-ghost" href="#produit/${p.id}">${icon('edit', 'sm')}</a>` }], myProds(), { href: p => 'produit/' + p.id }), '', true);
    },
    produit(id) {
      const isNew = id === 'new'; const p = isNew ? { nom: '', sku: 'SS-', sous: '', prix: '', promo: null, stock: '', seuil: 5, desc: '' } : P(id);
      if (!p || (!isNew && p.vendeur !== VID)) return h('Produit introuvable');
      const cat = App.C('epicerie');
      return h(isNew ? 'Nouveau produit' : esc(p.nom), isNew ? 'Votre produit sera vérifié par l’équipe Site E_commerce avant publication (24 h).' : p.sku, `<button class="btn btn-primary" data-vsave="${isNew ? 'new' : p.id}">${icon('check', 'sm')} ${isNew ? 'Soumettre pour validation' : 'Enregistrer'}</button>`, `<a href="#produits">Mes produits</a>${icon('chevron-right', 'sm')}<span>${isNew ? 'Nouveau' : p.sku}</span>`) +
        `<form id="f-vp" novalidate><div class="bo-grid g-2-1"><div class="stack">
          ${panel('Informations', `<div class="form-grid two">${field('Nom du produit', 'nom', p.nom, { rule: 'req', cls: 'span-2' })}${field('Référence (SKU)', 'sku', p.sku, { rule: 'req' })}${field('Sous-catégorie', 'sous', p.sous, { type: 'select', rule: 'req', options: [['', 'Choisir…']].concat(cat.sous) })}${field('Description', 'desc', p.desc, { type: 'textarea', rule: 'req', cls: 'span-2', hint: 'Origine, poids, conservation… Une bonne description augmente les ventes.' })}</div>`)}
          ${panel('Photos', `<div class="upload-zone" data-up>${icon('image', 'lg')}<div><b>Prendre une photo</b> ou choisir dans la galerie</div><div class="xs">Fond clair, produit centré · 4 photos recommandées</div></div>`)}
        </div><div class="stack">
          ${panel('Prix & stock', `<div class="form-grid">${field('Prix de vente (Ar)', 'prix', p.prix, { type: 'number', rule: 'req', attrs: 'min="100" step="100" inputmode="numeric"' })}${field('Prix promotionnel (Ar)', 'promo', p.promo == null ? '' : p.promo, { type: 'number', attrs: 'inputmode="numeric"', hint: 'Facultatif, inférieur au prix de vente' })}${field('Quantité en stock', 'stock', p.stock, { type: 'number', rule: 'req', attrs: 'min="0" step="1" inputmode="numeric"' })}${field('Seuil d’alerte', 'seuil', p.seuil, { type: 'number', rule: 'req', attrs: 'min="0" step="1"' })}</div>
            <div id="net-prev" class="info-list" style="margin-top:12px;padding:10px 12px"></div>`)}
        </div></div></form>`;
    },
    stock() {
      return h('Mon stock', 'Mettez à jour vos quantités après chaque réception') +
        panel('', table([{ l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<b class="small">${esc(p.nom)}</b></div>` }, { l: 'Physique', cls: 'right', v: p => p.stock }, { l: 'Réservé', cls: 'right', v: p => p.reserve || 0 }, { l: 'Disponible', cls: 'right', v: p => `<b>${dispo(p)}</b>` }, { l: 'Seuil', cls: 'right', v: p => p.seuil }, { l: 'État', v: pillStock },
          { l: '', cls: 'right', v: p => `<button class="btn btn-sm" data-vin="${p.id}">${icon('plus', 'sm')} Réception</button>` }], myProds(), { foot: false }), '', true);
    },
    revenus() {
      const rv = DB.reversements.filter(r => r.vendeur === VID);
      return h('Revenus & reversements', `Commission ${v.commission} % · reversement tous les 15 jours par virement`) +
        `<div class="kpis">${kpi('À recevoir', fmt(rv.filter(r => r.statut === 'a_payer').reduce((a, r) => a + r.brut * (1 - v.commission / 100), 0)), 'clock', 'le 1er octobre')}${kpi('Reçu en septembre', fmt(rv.filter(r => r.statut === 'paye').reduce((a, r) => a + r.brut * (1 - v.commission / 100), 0)), 'check')}${kpi('Commissions payées', fmt(rv.reduce((a, r) => a + r.brut * v.commission / 100, 0)), 'percent')}${kpi('Compte de reversement', 'BOA ···· 7890', 'bank', '<a href="#boutique" style="color:var(--primary)">Modifier</a>')}</div>` +
        panel('Historique', table([{ l: 'Référence', v: r => `<b>${r.id}</b>` }, { l: 'Période', v: r => r.periode }, { l: 'Ventes', cls: 'right nowrap', v: r => fmt(r.brut) }, { l: 'Commission', cls: 'right nowrap', v: r => '− ' + fmt(r.brut * v.commission / 100) }, { l: 'Net', cls: 'right nowrap', v: r => `<b>${fmt(r.brut * (1 - v.commission / 100))}</b>` }, { l: 'Statut', v: r => r.statut === 'paye' ? `<span class="badge badge-success">Payé le ${fmtDate(r.date)}</span>` : '<span class="badge badge-warning">Programmé</span>' }, { l: '', cls: 'right', v: () => `<button class="btn btn-sm btn-ghost" data-rel>${icon('download', 'sm')} Relevé</button>` }], rv, { foot: false }), '', true);
    },
    avis() {
      const l = DB.avis.filter(a => P(a.produit).vendeur === VID);
      return h('Avis clients', 'Répondez publiquement aux avis de vos clients') + l.map(a => `<div class="panel" style="margin-bottom:12px"><div class="panel-body"><div class="row between wrap"><b class="small">${esc(P(a.produit).nom)}</b><span class="xs muted">${fmtDate(a.date)}</span></div><div class="row" style="gap:8px;margin:6px 0"><span class="stars">${App.stars(a.note)}</span><span class="small">${esc(a.client)}</span></div><p class="small text-2">${esc(a.texte)}</p>${a.reponse ? `<div class="alert alert-info">${icon('message')}<span><b>Votre réponse :</b> ${esc(a.reponse)}</span></div>` : `<button class="btn btn-sm" data-reply="${a.id}">${icon('message', 'sm')} Répondre</button>`}</div></div>`).join('');
    },
    boutique() {
      return h('Ma boutique', 'Informations affichées aux clients') + `<form id="f-shop" novalidate><div class="bo-grid g-2-1"><div class="stack">
        ${panel('Profil public', `<div class="form-grid two">${field('Nom de la boutique', 'nom', v.nom, { rule: 'req' })}${field('Ville', 'ville', v.ville, { rule: 'req' })}${field('Présentation', 'desc', v.desc, { type: 'textarea', rule: 'req', cls: 'span-2' })}${field('Téléphone', 'tel', v.tel, { rule: 'req tel' })}${field('E-mail', 'email', v.email, { rule: 'req email' })}</div>`)}
        ${panel('Expédition', `<div class="form-grid two">${field('Délai de préparation', 'del', '24 à 48 h', { type: 'select', options: ['Sous 24 h', '24 à 48 h', '3 à 5 jours'] })}${field('Adresse d’enlèvement', 'enl', 'Route de Vohémar, Sambava', { rule: 'req' })}</div><label class="check" style="margin-top:12px"><input type="checkbox"> Mettre la boutique en congé (produits masqués temporairement)</label>`)}
      </div><div class="stack">
        ${panel('Informations légales', `<table class="spec-table"><tbody><tr><td>NIF</td><td>${v.nif}</td></tr><tr><td>STAT</td><td>${v.stat}</td></tr><tr><td>Statut</td><td><span class="verified">${icon('shield')} Vérifié</span></td></tr></tbody></table><p class="xs muted" style="margin:10px 0 0">Pour modifier ces informations, contactez l’équipe vendeurs.</p>`)}
        ${panel('Reversements', `${field('Mode', 'rv', 'banque', { type: 'select', options: [['banque', 'Virement bancaire'], ['mm', 'Mobile Money']] })}<div style="margin-top:10px">${field('RIB / IBAN', 'iban', 'MG46 0000 5000 0012 3456 7890 123', { rule: 'req' })}</div><p class="xs muted" style="margin:8px 0 0">${icon('lock', 'sm')} Toute modification déclenche une vérification par SMS.</p>`)}
      </div></div><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn btn-primary">Enregistrer</button></div></form>`;
    }
  };

  function subTable(rows) {
    return table([
      { l: 'Sous-commande', v: s => `<b>${s.ref}</b><div class="xs muted">${fmtDate(s.date)}</div>` },
      { l: 'Articles', v: s => s.lignes.map(l => `${l.qte} × ${esc(P(l.produit).nom.split(' —')[0])}`).join('<br>') },
      { l: 'Paiement client', v: s => statusPill('statutsPaiement', s.statutPaiement) },
      { l: 'Préparation', v: s => etatPill(s.etat) },
      { l: 'Net vendeur', cls: 'right nowrap', v: s => `<b>${fmt(s.net)}</b>` }], rows, { href: s => 'commande/' + s.numero, foot: false, empty: 'Aucune commande' });
  }

  function netPreview() {
    const f = document.getElementById('f-vp'); if (!f) return;
    const prix = +(f.promo.value || f.prix.value) || 0; const com = Math.round(prix * v.commission / 100);
    document.getElementById('net-prev').innerHTML = `<div class="sum-row small" style="padding:2px 0"><span>Prix client</span><b>${fmt(prix)}</b></div><div class="sum-row small" style="padding:2px 0"><span>Commission ${v.commission} %</span><span>− ${fmt(com)}</span></div><div class="sum-row small" style="padding:2px 0"><span>Vous recevez</span><b style="color:var(--success)">${fmt(prix - com)}</b></div>`;
  }
  document.addEventListener('input', e => { if (e.target.closest('#f-vp')) netPreview(); });

  document.addEventListener('click', e => {
    const q = s => e.target.closest(s);
    if (q('[data-ready]')) { const n = q('[data-ready]').dataset.ready; confirmBox('Colis prêt ?', '<p>Confirmez que tous les articles sont emballés et étiquetés. Le coursier sera programmé.</p>', () => { const m = prep(); m[n] = 'pret'; store.set('vprep_' + VID, m); BO.refresh(); toast('Enlèvement programmé · la plateforme est notifiée'); }); }
    if (q('[data-up]')) toast('Sélection de photos (maquette).');
    if (q('[data-rel]')) toast('Relevé PDF téléchargé (maquette).');
    if (q('[data-vsave]')) {
      const id = q('[data-vsave]').dataset.vsave; const f = document.getElementById('f-vp'); let ok = validate(f);
      const fe = (n, m) => { const x = f[n].closest('.field'); x.classList.add('error'); x.querySelector('.err').textContent = m; ok = false; };
      const prix = +f.prix.value, promo = f.promo.value === '' ? null : +f.promo.value, stock = +f.stock.value;
      if (f.prix.value && (!Number.isInteger(prix) || prix < 100)) fe('prix', 'Prix entier ≥ 100 Ar.');
      if (promo != null && !(Number.isInteger(promo) && promo > 0 && promo < prix)) fe('promo', 'Doit être inférieur au prix de vente.');
      if (f.stock.value !== '' && (!Number.isInteger(stock) || stock < 0)) fe('stock', 'Nombre entier positif.');
      if (id !== 'new' && Number.isInteger(stock) && stock < (P(id).reserve || 0)) fe('stock', 'Inférieur aux unités réservées (' + P(id).reserve + ').');
      if (!ok) { toast('Corrigez les champs en erreur.', 'error'); return; }
      const d = { nom: f.nom.value.trim(), sku: f.sku.value.trim(), sous: f.sous.value, desc: f.desc.value.trim(), prix, promo, stock, seuil: +f.seuil.value };
      if (id === 'new') { DB.produits.push({ ...d, id: 'p' + (DB.produits.length + 1), cat: 'epicerie', vendeur: VID, reserve: 0, note: 0, avis: 0, ventes: 0, icon: 'leaf', actif: false, validation: 'attente', variantes: null }); toast('Produit soumis · validation sous 24 h'); location.hash = 'produits'; }
      else { Object.assign(P(id), d); toast('Modifications enregistrées'); BO.refresh(); }
    }
    if (q('[data-vin]')) { const p = P(q('[data-vin]').dataset.vin);
      modal({ title: 'Réception de marchandise', noIcon: true, body: `<p class="small"><b>${esc(p.nom)}</b> · stock actuel ${p.stock}</p><form class="form-grid" novalidate>${field('Quantité reçue', 'q', '', { type: 'number', rule: 'req', attrs: 'min="1" step="1"' })}${field('Référence (bon de livraison…)', 'ref', '', { rule: 'req' })}</form>`,
        actions: [{ label: 'Annuler' }, { label: 'Ajouter au stock', cls: 'btn-primary', onClick(bd) { const f = bd.querySelector('form'); let ok = validate(f); const n = +f.q.value; if (f.q.value && (!Number.isInteger(n) || n < 1)) { const x = f.q.closest('.field'); x.classList.add('error'); x.querySelector('.err').textContent = 'Entier ≥ 1.'; ok = false; } if (!ok) return false; p.stock += n; DB.mouvements.unshift(['2026-09-28 10:00', p.id, 'Entrée', n, f.ref.value, v.nom]); BO.refresh(); toast('+' + n + ' ajouté(s) · disponible : ' + dispo(p)); } }] }); }
    if (q('[data-reply]')) { const a = DB.avis.find(x => x.id === q('[data-reply]').dataset.reply);
      modal({ title: 'Répondre à ' + esc(a.client), noIcon: true, body: `<div class="field"><label>Réponse publique <span class="req">*</span></label><textarea class="textarea" id="rep" maxlength="500">Misaotra betsaka ! Merci pour votre confiance.</textarea><span class="err">Réponse vide.</span><span class="hint">Restez courtois : la réponse est visible sur la fiche produit.</span></div>`,
        actions: [{ label: 'Annuler' }, { label: 'Publier la réponse', cls: 'btn-primary', onClick(bd) { const t = bd.querySelector('#rep'); if (!t.value.trim()) { t.closest('.field').classList.add('error'); return false; } a.reponse = t.value.trim(); BO.refresh(); toast('Réponse publiée'); } }] }); }
  });
  document.addEventListener('submit', e => { if (e.target.id !== 'f-shop') return; e.preventDefault(); if (validate(e.target)) toast('Boutique mise à jour'); });

  BO.mount({
    key: 'vendeur', tag: 'Vendeur', home: '#dashboard', front: '../index.html',
    searchPh: 'Rechercher une commande ou un produit…',
    user: { nom: v.nom, role: () => 'Vendeur vérifié · ' + v.ville },
    sideFoot: `<div class="info-list" style="padding:12px"><b class="small">Besoin d’aide ?</b><span class="xs muted">Équipe vendeurs : +261 34 00 000 10 · vendeurs@site-ecommerce.mg</span></div><a class="bo-link" href="../admin/index.html" style="margin-top:8px">${icon('lock')} Back-office admin (démo)</a>`,
    notifs: [['warning', 'package', 'Nouvelle commande CMD-2026-001284', '2 × Vanille bourbon · payée MVola'], ['info', 'wallet', 'Reversement programmé', '1er octobre · virement BOA'], ['primary', 'star', 'Nouvel avis 5 étoiles', 'Vanille bourbon de la SAVA']],
    menu: [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', group: 'Ma boutique' },
      { id: 'commandes', label: 'Commandes', icon: 'package', group: 'Ma boutique', count: () => subs().filter(s => s.etat === 'a_preparer' && canShip(s)).length },
      { id: 'produits', label: 'Produits', icon: 'box', group: 'Ma boutique' }, { id: 'stock', label: 'Stock', icon: 'refresh', group: 'Ma boutique' },
      { id: 'revenus', label: 'Revenus', icon: 'wallet', group: 'Finances' }, { id: 'avis', label: 'Avis clients', icon: 'star', group: 'Finances' },
      { id: 'boutique', label: 'Paramètres boutique', icon: 'settings', group: 'Compte' }
    ],
    alias: { commande: 'commandes', produit: 'produits' },
    routes,
    after: { dashboard: () => BO.bindLine('ch-v', days(), fmt), produit: netPreview },
    onSearch(q) { const s = subs().find(x => x.numero.toLowerCase().includes(q.toLowerCase())); if (s) { location.hash = 'commande/' + s.numero; return; } const p = myProds().find(x => x.nom.toLowerCase().includes(q.toLowerCase())); if (p) { location.hash = 'produit/' + p.id; return; } toast('Aucun résultat', 'warning'); }
  });
})();
