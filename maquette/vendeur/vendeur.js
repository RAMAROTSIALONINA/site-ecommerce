/* =========================================================
   Espace Vendeur — Site E_commerce (marketplace) — v2
   Démo connectée en tant que « Saveurs de la SAVA » (v3)
   ========================================================= */
(function () {
  const { icon, esc, fmt, fmtN, fmtDate, P, V, Z, PAY, CL, pv, toast, modal, confirmBox, validate, statusPill, dispo, store, stars } = App;
  const h = BO.head.bind(BO), panel = BO.panel.bind(BO), table = BO.table.bind(BO), kpi = BO.kpi.bind(BO), field = BO.field.bind(BO);
  const VID = 'v3'; const v = V(VID);
  const F = { period: 30, cmd: '', prod: '' };
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
  const ETATS = { a_preparer: ['À préparer', 'warning'], pret: ['Prêt — enlèvement programmé', 'info'], remis: ['Remis au transporteur', 'success'], retour: ['Retour', 'danger'], annule: ['Annulé', 'danger'] };
  const etatPill = e => `<span class="badge badge-${ETATS[e][1]}"><span class="dot"></span>${ETATS[e][0]}</span>`;
  const pillStock = p => { const d = dispo(p); return d <= 0 ? '<span class="badge badge-danger">Rupture</span>' : d <= p.seuil ? '<span class="badge badge-warning">Stock faible</span>' : '<span class="badge badge-success">OK</span>'; };
  const canShip = s => s.statutPaiement === 'paye' || s.paiement === 'cod';
  const thumbs = s => { const ids = [...new Set(s.lignes.map(l => l.produit))]; return `<div class="thumbs-mini">${ids.slice(0, 3).map(id => pv(P(id), 'sm')).join('')}${ids.length > 3 ? `<span class="more">+${ids.length - 3}</span>` : ''}</div>`; };
  // Ventes du vendeur : part de la marketplace (11 %)
  const days = n => BO.days(n).map(d => ({ ...d, v: Math.round(d.v * 0.11), extra: Math.max(1, Math.round(d.v * 0.11 / 38000)) + ' commandes' }));
  const soldeAPayer = () => DB.reversements.filter(r => r.vendeur === VID && r.statut === 'a_payer').reduce((a, r) => a + Math.round(r.brut * (1 - v.commission / 100)), 0);
  const perfBar = (label, val, pct, ok, hint) => `<div style="margin-bottom:14px"><div class="row between small"><span>${label}</span><b style="color:var(--${ok ? 'success' : 'warning'})">${val}</b></div><div class="hbar" style="grid-template-columns:1fr;margin-top:6px"><div class="track"><div class="fill" style="width:${pct}%;background:var(--${ok ? 'success' : 'warning'})"></div></div></div><div class="xs muted" style="margin-top:4px">${hint}</div></div>`;

  const routes = {
    // ================= TABLEAU DE BORD =================
    dashboard() {
      const s = subs(); const todo = s.filter(x => x.etat === 'a_preparer' && canShip(x)); const waitPay = s.filter(x => x.etat === 'a_preparer' && !canShip(x));
      const n = F.period; const d = days(n); const ca = d.reduce((a, x) => a + x.v, 0); const nbc = d.reduce((a, x) => a + parseInt(x.extra, 10), 0);
      const low = myProds().filter(p => dispo(p) <= p.seuil * 2);
      const top = [...myProds()].sort((a, b) => b.ventes * App.unitPrice(b) - a.ventes * App.unitPrice(a)).slice(0, 4);
      const heure = new Date().getHours();
      return h(`${heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'}, ${esc(v.nom)}`, `${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · boutique <span class="verified">${icon('shield')} vérifiée</span>`,
        `<div class="seg-ctl" role="group" aria-label="Période">${[7, 14, 30].map(p => `<button data-period="${p}" class="${n === p ? 'on' : ''}">${p} j</button>`).join('')}</div><a class="btn" href="../boutique.html?id=${VID}" target="_blank">${icon('eye', 'sm')} Ma boutique</a><a class="btn btn-primary" href="#produit/new">${icon('plus', 'sm')} Ajouter un produit</a>`) +
        (todo.length ? `<div class="alert alert-warning" style="margin-bottom:16px;align-items:center">${icon('package')}<span class="grow"><b>${todo.length} commande(s) payée(s) à préparer</b> — délai d’expédition engagé : 48 h.</span><a class="btn btn-sm btn-primary" href="#commandes">Préparer</a></div>` : '') +
        `<div class="kpis">
          ${kpi('Ventes', fmt(ca), 'wallet', `sur ${n} jours`, 12, d.map(x => x.v))}
          ${kpi('Commandes', fmtN(nbc), 'package', `sur ${n} jours`, 8, d.map(x => parseInt(x.extra, 10)), 'info')}
          ${kpi('Solde à recevoir', fmt(soldeAPayer()), 'bank', 'reversement le 1er octobre', null, null, 'accent')}
          ${kpi('Note boutique', v.note.toString().replace('.', ',') + ' / 5', 'star', v.avis + ' avis clients', null, null, 'warning')}
        </div>
        <div class="bo-grid g-2-1">
          ${panel('Mes ventes', `<div class="chart-sum"><div><b>${fmt(ca)}</b>Total ${n} jours</div><div><b>${fmt(ca * (1 - v.commission / 100))}</b>Net après commission</div><div><b>${fmt(ca / n)}</b>Moyenne par jour</div></div>` + BO.lineChart('ch-v', d, { label: 'Ventes quotidiennes de la boutique' }), '<a href="#revenus">Revenus →</a>')}
          ${panel('Performance de la boutique', perfBar('Expédition dans les délais', '96 %', 96, true, 'Objectif ≥ 95 % · colis remis sous 48 h') + perfBar('Taux d’annulation', '1,2 %', 12, true, 'Objectif < 3 %') + perfBar('Temps de réponse', '1 h 40', 72, true, 'Objectif < 2 h aux messages clients') + perfBar('Avis positifs (4–5 ★)', '94 %', 94, true, 'Sur les 90 derniers jours') +
            `<div class="alert alert-success" style="margin:4px 0 0">${icon('award')}<span class="small"><b>Vendeur Premium</b> — vos produits sont mis en avant dans les résultats.</span></div>`)}
        </div>
        <div class="bo-grid g-3" style="margin-top:16px">
          ${panel('À faire aujourd’hui', [
            ['warning', 'package', todo.length, 'Colis à préparer', 'Payés, prêts à expédier', '#commandes'],
            ['info', 'clock', waitPay.length, 'En attente de paiement', 'Ne pas préparer pour l’instant', '#commandes'],
            ['danger', 'alert', low.filter(p => dispo(p) <= p.seuil).length, 'Stock faible', 'Pensez à réapprovisionner', '#stock'],
            ['primary', 'message', DB.avis.filter(a => P(a.produit).vendeur === VID && !a.reponse && a.statut === 'publie').length, 'Avis sans réponse', 'Répondre améliore votre note', '#avis']
          ].map(t => `<a class="list-item" href="${t[5]}"><span class="li-ico" style="background:var(--${t[0]}-50);color:var(--${t[0]})">${icon(t[1], 'sm')}</span><div class="grow"><b class="small">${t[3]}</b><div class="xs muted">${t[4]}</div></div><span class="li-n">${t[2]}</span></a>`).join(''), '', true)}
          ${panel('Meilleurs produits', top.map((p, i) => `<a class="rank" href="#produit/${p.id}"><span class="r-n">${i + 1}</span>${pv(p, 'sm')}<div class="grow" style="min-width:0"><b>${esc(p.nom)}</b><span class="xs muted">${fmtN(p.ventes)} ventes · ${p.note} ★</span></div></a>`).join(''), '<a href="#produits">Tous →</a>', true)}
          ${panel('Prochain reversement', `<div class="goal"><div class="goal-ring" style="--p:${Math.round(3 / 15 * 100)}"><span style="font-size:.9rem">J-3</span></div><div><div class="small text-2">Montant prévu</div><b style="font-size:1.15rem;font-family:var(--font-title)">${fmt(soldeAPayer())}</b><div class="xs muted" style="margin-top:4px">Le 1er octobre par virement BOA<br>Période du 16 au 30 septembre</div></div></div>
            <div class="alert alert-info" style="margin-top:14px">${icon('info')}<span class="xs">Seules les ventes <b>livrées</b> sont reversées, moins la commission de ${v.commission} %.</span></div>`, '<a href="#revenus">Détail →</a>')}
        </div>
        <div class="bo-grid g-2-1" style="margin-top:16px">
          ${panel('Dernières commandes', subTable(s.slice(0, 5), false), '<a href="#commandes">Toutes →</a>', true)}
          ${panel('Conseils pour vendre plus', `<ul class="check-list" style="margin:0">${['Ajoutez 4 photos sur fond clair : +30 % de ventes en moyenne', 'Proposez un format découverte (50 g) pour la vanille', 'Répondez aux avis sous 24 h', 'Activez une promotion pendant les ventes flash du vendredi'].map(t => `<li>${icon('check', 'sm')} ${t}</li>`).join('')}</ul>`)}
        </div>`;
    },

    // ================= COMMANDES =================
    commandes() {
      const all = subs(); const tabs = [['', 'Toutes'], ['a_preparer', 'À préparer'], ['pret', 'Prêtes'], ['remis', 'Remises'], ['retour', 'Retours'], ['annule', 'Annulées']];
      const l = all.filter(s => !F.cmd || s.etat === F.cmd);
      return h('Mes commandes', 'Sous-commandes contenant vos produits · les coordonnées client sont limitées à la préparation', `<button class="btn" data-print>${icon('print', 'sm')} Imprimer les bons</button>`) +
        panel('', `<div class="status-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${F.cmd === t[0]}" class="${F.cmd === t[0] ? 'on' : ''}" data-tabc="${t[0]}">${t[1]} <span class="n">${t[0] ? all.filter(s => s.etat === t[0]).length : all.length}</span></button>`).join('')}</div>
          <div class="bulk-bar" id="bulk"><span id="bulk-n"></span><button class="btn btn-sm btn-primary" data-bulkready>${icon('check', 'sm')} Colis prêts pour l’enlèvement</button><button class="btn btn-sm" data-print>${icon('print', 'sm')} Bons de préparation</button></div>` +
          subTable(l, true), '', true);
    },
    commande(num) {
      const s = subs().find(x => x.numero === num); if (!s) return h('Commande introuvable');
      const c = CL(s.client);
      const steps = [['Commande reçue', true], ['Paiement confirmé', canShip(s)], ['Colis préparé', ['pret', 'remis'].includes(s.etat)], ['Remis au transporteur', s.etat === 'remis']];
      const cur = steps.findIndex(x => !x[1]);
      return h('Sous-commande ' + s.ref, `Commande passée le ${fmtDate(s.date)} · ${etatPill(s.etat)}`, `<button class="btn" onclick="window.print()">${icon('print', 'sm')} Bon de préparation</button>`, `<a href="#commandes">Mes commandes</a>${icon('chevron-right', 'sm')}<span>${s.ref}</span>`) +
        `<div class="bo-grid g-2-1"><div class="stack">
          ${panel('Articles à préparer', table([{ l: 'Produit', v: l => `<div class="cell-prod">${pv(P(l.produit), 'sm')}<div><b class="small">${esc(P(l.produit).nom)}</b><div class="xs muted">${P(l.produit).sku}${l.variante ? ' · ' + esc(l.variante) : ''}</div></div></div>` }, { l: 'Qté', cls: 'right', v: l => `<b>${l.qte}</b>` }, { l: 'P.U.', cls: 'right nowrap', v: l => fmt(l.prix) }, { l: 'Total', cls: 'right nowrap', v: l => fmt(l.prix * l.qte) }], s.lignes, { foot: false }), '', true)}
          ${panel('Préparation', `<ul class="timeline" style="margin-bottom:10px">${steps.map((x, i) => `<li class="${x[1] ? 'done' : i === cur ? 'current' : ''}"><span class="tl-dot">${x[1] ? icon('check') : ''}</span><b>${x[0]}</b><span>${x[1] ? 'Fait' : i === cur ? 'Étape en cours' : 'À venir'}</span></li>`).join('')}</ul>` +
            (!canShip(s) && s.etat === 'a_preparer' ? `<div class="alert alert-warning">${icon('clock')}<span>Paiement du client non confirmé (${DB.statutsPaiement[s.statutPaiement].l}). <b>Ne préparez pas encore ce colis</b> : vous serez notifié dès la confirmation.</span></div>`
              : s.etat === 'a_preparer' ? `<ol class="small text-2" style="padding-left:18px;margin-top:0"><li>Vérifiez les articles et leur état.</li><li>Emballez le colis et collez l’étiquette <b>${s.ref}</b>.</li><li>Marquez le colis comme prêt : le coursier passe l’enlever sous 24 h.</li></ol><button class="btn btn-primary" data-ready="${s.numero}">${icon('check', 'sm')} Colis prêt pour l’enlèvement</button>`
                : s.etat === 'pret' ? `<div class="alert alert-info">${icon('truck')}<span>Colis prêt. Enlèvement prévu demain entre 9 h et 12 h à ${v.ville}.</span></div>` : `<p class="small text-2" style="margin:0">${ETATS[s.etat][0]}.</p>`))}
        </div><div class="stack">
          ${panel('Montants', `<div class="sum-row"><span>Ventes (TTC)</span><b>${fmt(s.brut)}</b></div><div class="sum-row"><span>Commission ${v.commission} %</span><span>− ${fmt(s.com)}</span></div><div class="sum-row total"><span>Net pour vous</span><span>${fmt(s.net)}</span></div><p class="xs muted" style="margin:8px 0 0">Versé au prochain cycle après livraison. Frais de livraison gérés par la plateforme.</p>`)}
          ${panel('Client', `<div class="cell-user"><span class="avatar">${App.initials(c.prenom + ' ' + c.nom)}</span><div><b>${esc(c.prenom)} ${esc(c.nom.charAt(0))}.</b><div class="xs muted">${c.ville} · ${Z(s.zone).nom}</div></div></div><p class="xs muted" style="margin:12px 0 0">${icon('lock', 'sm')} Les coordonnées complètes sont transmises au livreur uniquement (protection des données).</p>`)}
          ${panel('Paiement', `<div class="sum-row"><span>${PAY(s.paiement).nom}</span>${statusPill('statutsPaiement', s.statutPaiement)}</div>`)}
        </div></div>`;
    },

    // ================= PRODUITS =================
    produits() {
      const all = myProds();
      const is = { en_ligne: p => p.actif && p.validation !== 'attente', validation: p => p.validation === 'attente', faible: p => dispo(p) <= p.seuil };
      const tabs = [['', 'Tous'], ['en_ligne', 'En ligne'], ['validation', 'En validation'], ['faible', 'Stock faible']];
      const l = all.filter(p => !F.prod || is[F.prod](p));
      return h('Mes produits', all.length + ' produits · ' + fmtN(all.reduce((s, p) => s + p.ventes, 0)) + ' ventes cumulées', `<a class="btn btn-primary" href="#produit/new">${icon('plus', 'sm')} Ajouter un produit</a>`) +
        panel('', `<div class="status-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${F.prod === t[0]}" class="${F.prod === t[0] ? 'on' : ''}" data-tabp="${t[0]}">${t[1]} <span class="n">${t[0] ? all.filter(is[t[0]]).length : all.length}</span></button>`).join('')}</div>` + table([
          { l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<div><b class="small">${esc(p.nom)}</b><div class="xs muted">${p.sku} · ${esc(p.sous)}</div></div></div>` },
          { l: 'Prix', cls: 'right nowrap', v: p => p.promo != null ? `<b style="color:var(--accent)">${fmt(p.promo)}</b><div class="xs muted" style="text-decoration:line-through">${fmt(p.prix)}</div>` : `<b>${fmt(p.prix)}</b>` },
          { l: 'Disponible', cls: 'nowrap', v: p => `<b>${dispo(p)}</b> ${pillStock(p)}` }, { l: 'Ventes', cls: 'right', v: p => fmtN(p.ventes) }, { l: 'Note', cls: 'right nowrap', v: p => p.note ? `<span class="stars">${icon('star')}</span> ${p.note}` : '—' },
          { l: 'Statut', v: p => p.validation === 'attente' ? '<span class="badge badge-warning"><span class="dot"></span>En validation</span>' : p.actif ? '<span class="badge badge-success"><span class="dot"></span>En ligne</span>' : '<span class="badge"><span class="dot"></span>Masqué</span>' },
          { l: '', cls: 'right nowrap', v: p => `<a class="btn btn-sm btn-ghost" href="../produit.html?id=${p.id}" target="_blank" aria-label="Voir sur le site">${icon('eye', 'sm')}</a><a class="btn btn-sm btn-ghost" href="#produit/${p.id}" aria-label="Modifier">${icon('edit', 'sm')}</a>` }], l, { href: p => 'produit/' + p.id, foot: false, empty: 'Aucun produit dans cet onglet' }), '', true);
    },
    produit(id) {
      const isNew = id === 'new'; const p = isNew ? { nom: '', sku: 'SS-', sous: '', prix: '', promo: null, stock: '', seuil: 5, desc: '' } : P(id);
      if (!p || (!isNew && p.vendeur !== VID)) return h('Produit introuvable');
      const cat = App.C('epicerie');
      return h(isNew ? 'Nouveau produit' : esc(p.nom), isNew ? 'Votre produit sera vérifié par l’équipe Site E_commerce avant publication (24 h).' : p.sku + ' · ' + fmtN(p.ventes) + ' ventes', `${isNew ? '' : `<a class="btn" href="../produit.html?id=${p.id}" target="_blank">${icon('eye', 'sm')} Voir sur le site</a>`}<button class="btn btn-primary" data-vsave="${isNew ? 'new' : p.id}">${icon('check', 'sm')} ${isNew ? 'Soumettre pour validation' : 'Enregistrer'}</button>`, `<a href="#produits">Mes produits</a>${icon('chevron-right', 'sm')}<span>${isNew ? 'Nouveau' : p.sku}</span>`) +
        `<form id="f-vp" novalidate><div class="bo-grid g-2-1"><div class="stack">
          ${panel('Informations', `<div class="form-grid two">${field('Nom du produit', 'nom', p.nom, { rule: 'req', cls: 'span-2' })}${field('Référence (SKU)', 'sku', p.sku, { rule: 'req' })}${field('Sous-catégorie', 'sous', p.sous, { type: 'select', rule: 'req', options: [['', 'Choisir…']].concat(cat.sous) })}${field('Description', 'desc', p.desc, { type: 'textarea', rule: 'req', cls: 'span-2', hint: 'Origine, poids, conservation… Une bonne description augmente les ventes.' })}</div>`)}
          ${panel('Photos', `<div class="upload-zone" data-up>${icon('image', 'lg')}<div><b>Prendre une photo</b> ou choisir dans la galerie</div><div class="xs">Fond clair, produit centré · 4 photos recommandées · converties automatiquement en WebP</div></div>${isNew ? '' : `<div class="img-grid">${[0, 1, 2, 3].map(i => pv(p, 'sm', i)).join('')}</div>`}`)}
        </div><div class="stack">
          ${panel('Prix & stock', `<div class="form-grid">${field('Prix de vente (Ar)', 'prix', p.prix, { type: 'number', rule: 'req', attrs: 'min="100" step="100" inputmode="numeric"' })}${field('Prix promotionnel (Ar)', 'promo', p.promo == null ? '' : p.promo, { type: 'number', attrs: 'inputmode="numeric"', hint: 'Facultatif, inférieur au prix de vente' })}${field('Quantité en stock', 'stock', p.stock, { type: 'number', rule: 'req', attrs: 'min="0" step="1" inputmode="numeric"' })}${field('Seuil d’alerte', 'seuil', p.seuil, { type: 'number', rule: 'req', attrs: 'min="0" step="1"' })}</div>
            <div id="net-prev" class="info-list" style="margin-top:12px;padding:10px 12px"></div>`)}
          ${isNew ? '' : panel('Aperçu dans le catalogue', `<div style="max-width:240px;margin:0 auto">${App.productCard(p, '../')}</div>`)}
        </div></div></form>`;
    },

    // ================= STOCK =================
    stock() {
      const l = myProds(); const val = l.reduce((s, p) => s + p.stock * App.unitPrice(p), 0);
      return h('Mon stock', 'Mettez à jour vos quantités après chaque réception') +
        `<div class="kpis">${kpi('Valeur du stock', fmt(val), 'wallet', 'au prix de vente')}${kpi('Unités disponibles', fmtN(l.reduce((s, p) => s + dispo(p), 0)), 'box', l.reduce((s, p) => s + (p.reserve || 0), 0) + ' réservées', null, null, 'info')}${kpi('Stock faible', l.filter(p => dispo(p) <= p.seuil).length, 'alert', 'produits sous le seuil', null, null, 'warning')}${kpi('Ruptures', l.filter(p => dispo(p) <= 0).length, 'x', 'commande bloquée', null, null, 'accent')}</div>` +
        panel('', table([{ l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<b class="small">${esc(p.nom)}</b></div>` }, { l: 'Physique', cls: 'right', v: p => p.stock }, { l: 'Réservé', cls: 'right', v: p => p.reserve || 0 }, { l: 'Disponible', cls: 'right', v: p => `<b>${dispo(p)}</b>` },
          { l: 'Niveau', v: p => `<div class="hbar" style="grid-template-columns:90px auto;gap:8px"><div class="track"><div class="fill" style="width:${Math.min(100, dispo(p) / (p.seuil * 4) * 100)}%;background:var(--${dispo(p) <= p.seuil ? 'warning' : 'success'})"></div></div></div>` },
          { l: 'État', v: pillStock }, { l: '', cls: 'right', v: p => `<button class="btn btn-sm" data-vin="${p.id}">${icon('plus', 'sm')} Réception</button>` }], [...l].sort((a, b) => (dispo(a) - a.seuil) - (dispo(b) - b.seuil)), { foot: false }), '', true);
    },

    // ================= REVENUS =================
    revenus() {
      const rv = DB.reversements.filter(r => r.vendeur === VID); const net = r => Math.round(r.brut * (1 - v.commission / 100));
      const mois = [['Avr.', 1.8], ['Mai', 2.1], ['Juin', 2.0], ['Juil.', 2.4], ['Août', 2.6], ['Sept.', 1.54]].map(m => ({ l: m[0], v: m[1] * 1e6 }));
      return h('Revenus & reversements', `Commission ${v.commission} % · reversement tous les 15 jours par virement`, `<button class="btn" data-rel>${icon('download', 'sm')} Relevé annuel</button>`) +
        `<div class="kpis">${kpi('À recevoir', fmt(rv.filter(r => r.statut === 'a_payer').reduce((a, r) => a + net(r), 0)), 'clock', 'le 1er octobre', null, null, 'accent')}${kpi('Reçu en septembre', fmt(rv.filter(r => r.statut === 'paye').reduce((a, r) => a + net(r), 0)), 'check', 'versé le 17 septembre')}${kpi('Net sur 6 mois', fmt(mois.reduce((s, m) => s + m.v, 0)), 'chart', 'avril → septembre', 9, mois.map(m => m.v), 'info')}${kpi('Compte de reversement', 'BOA ···· 7890', 'bank', '<a href="#boutique" style="color:var(--primary)">Modifier</a>')}</div>
        <div class="bo-grid g-2-1">
          ${panel('Net reversé par mois', BO.hbars(mois, x => (x / 1e6).toFixed(2).replace('.', ',') + ' M Ar') + '<p class="xs muted" style="margin:12px 0 0">Septembre : 1ʳᵉ quinzaine versée, 2ᵉ quinzaine programmée le 1er octobre.</p>')}
          ${panel('Comment fonctionne le reversement ?', `<ul class="timeline">${[['Vente livrée', 'Le client reçoit son colis'], ['Délai de rétractation', '7 jours pour un éventuel retour'], ['Calcul du reversement', 'Ventes livrées − commission ' + v.commission + ' %'], ['Virement', 'Le 1er et le 16 de chaque mois']].map((x, i) => `<li class="${i < 3 ? 'done' : 'current'}"><span class="tl-dot">${i < 3 ? icon('check') : ''}</span><b>${x[0]}</b><span>${x[1]}</span></li>`).join('')}</ul>`)}
        </div>
        <div style="margin-top:16px">${panel('Historique des reversements', table([{ l: 'Référence', v: r => `<b>${r.id}</b>` }, { l: 'Période', v: r => r.periode }, { l: 'Ventes', cls: 'right nowrap', v: r => fmt(r.brut) }, { l: 'Commission', cls: 'right nowrap', v: r => '− ' + fmt(r.brut * v.commission / 100) }, { l: 'Net', cls: 'right nowrap', v: r => `<b>${fmt(net(r))}</b>` }, { l: 'Statut', v: r => r.statut === 'paye' ? `<span class="badge badge-success"><span class="dot"></span>Payé le ${fmtDate(r.date)}</span>` : '<span class="badge badge-warning"><span class="dot"></span>Programmé</span>' }, { l: '', cls: 'right', v: () => `<button class="btn btn-sm btn-ghost" data-rel>${icon('download', 'sm')} Relevé</button>` }], rv, { foot: false }), '', true)}</div>`;
    },

    // ================= AVIS =================
    avis() {
      const l = DB.avis.filter(a => P(a.produit).vendeur === VID);
      const pub = l.filter(a => a.statut === 'publie'); const sans = pub.filter(a => !a.reponse).length;
      const dist = [5, 4, 3, 2, 1].map(n => [n, n === 5 ? 81 : n === 4 ? 13 : n === 3 ? 4 : n === 2 ? 1 : 1]);
      return h('Avis clients', 'Répondez publiquement : une réponse rapide améliore la confiance des acheteurs') +
        `<div class="bo-grid g-1-2"><div class="stack">
          ${panel('Note de la boutique', `<div class="review-score center"><b style="font-size:2.6rem">${v.note.toString().replace('.', ',')}</b><div class="stars" style="justify-content:center;margin:6px 0">${stars(v.note)}</div><div class="small muted">${v.avis} avis vérifiés</div></div><div style="margin-top:12px">${dist.map(([n, pc]) => `<div class="bar-row"><span>${n} ★</span><div class="bar"><i style="width:${pc}%"></i></div><span>${pc} %</span></div>`).join('')}</div>`)}
          ${panel('Réponses', `<div class="sum-row"><span>Avis publiés récents</span><b>${pub.length}</b></div><div class="sum-row"><span>Sans réponse</span><b style="color:var(--${sans ? 'warning' : 'success'})">${sans}</b></div><div class="sum-row"><span>Délai moyen de réponse</span><b>6 h</b></div>`)}
        </div><div>` +
        l.map(a => `<div class="panel" style="margin-bottom:12px"><div class="panel-body"><div class="row" style="gap:12px;align-items:flex-start"><div style="width:52px;flex:none">${pv(P(a.produit), 'sm')}</div><div class="grow"><div class="row between wrap"><b class="small">${esc(P(a.produit).nom)}</b><span class="xs muted">${fmtDate(a.date)}</span></div><div class="row" style="gap:8px;margin:6px 0"><span class="stars">${stars(a.note)}</span><span class="small">${esc(a.client)}</span>${a.achat ? '<span class="badge badge-success">Achat vérifié</span>' : ''}${a.statut !== 'publie' ? '<span class="badge badge-warning">En modération</span>' : ''}</div><p class="small text-2" style="margin:0 0 10px">${esc(a.texte)}</p>${a.reponse ? `<div class="alert alert-info">${icon('message')}<span><b>Votre réponse :</b> ${esc(a.reponse)}</span></div>` : a.statut === 'publie' ? `<button class="btn btn-sm" data-reply="${a.id}">${icon('message', 'sm')} Répondre</button>` : ''}</div></div></div></div>`).join('') + '</div></div>';
    },

    // ================= BOUTIQUE =================
    boutique() {
      return h('Ma boutique', 'Informations affichées aux clients', `<a class="btn" href="../boutique.html?id=${VID}" target="_blank">${icon('eye', 'sm')} Voir la page publique</a>`) + `<form id="f-shop" novalidate><div class="bo-grid g-2-1"><div class="stack">
        ${panel('Profil public', `<div class="form-grid two">${field('Nom de la boutique', 'nom', v.nom, { rule: 'req' })}${field('Ville', 'ville', v.ville, { rule: 'req' })}${field('Présentation', 'desc', v.desc, { type: 'textarea', rule: 'req', cls: 'span-2' })}${field('Téléphone', 'tel', v.tel, { rule: 'req tel' })}${field('E-mail', 'email', v.email, { rule: 'req email' })}</div>`)}
        ${panel('Expédition', `<div class="form-grid two">${field('Délai de préparation', 'del', '24 à 48 h', { type: 'select', options: ['Sous 24 h', '24 à 48 h', '3 à 5 jours'] })}${field('Adresse d’enlèvement', 'enl', 'Route de Vohémar, Sambava', { rule: 'req' })}</div><label class="check" style="margin-top:12px"><input type="checkbox"> Mettre la boutique en congé (produits masqués temporairement)</label>`)}
        ${panel('Reversements', `<div class="form-grid two">${field('Mode', 'rv', 'banque', { type: 'select', options: [['banque', 'Virement bancaire'], ['mm', 'Mobile Money']] })}${field('RIB / IBAN', 'iban', 'MG46 0000 5000 0012 3456 7890 123', { rule: 'req' })}</div><p class="xs muted" style="margin:8px 0 0">${icon('lock', 'sm')} Toute modification déclenche une vérification par SMS.</p>`)}
      </div><div class="stack">
        ${panel('Aperçu public', `<div id="shop-prev"></div>`)}
        ${panel('Informations légales', `<table class="spec-table"><tbody><tr><td>NIF</td><td>${v.nif}</td></tr><tr><td>STAT</td><td>${v.stat}</td></tr><tr><td>Statut</td><td><span class="verified">${icon('shield')} Vérifié</span></td></tr></tbody></table><p class="xs muted" style="margin:10px 0 0">Pour modifier ces informations, contactez l’équipe vendeurs.</p>`)}
      </div></div><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn btn-primary">${icon('check', 'sm')} Enregistrer</button></div></form>`;
    }
  };

  function subTable(rows, selectable) {
    return table((selectable ? [{ l: '<input type="checkbox" data-selall aria-label="Tout sélectionner">', v: s => s.etat === 'a_preparer' && canShip(s) ? `<input type="checkbox" data-sel="${s.numero}" aria-label="Sélectionner ${s.ref}">` : '' }] : []).concat([
      { l: 'Sous-commande', v: s => `<b>${s.ref.replace('CMD-2026-', '')}</b><div class="xs muted nowrap">${fmtDate(s.date).replace(' 2026', '')}</div>` },
      { l: 'Articles', v: s => `<div class="row" style="gap:10px">${thumbs(s)}<span class="xs text-2">${s.lignes.reduce((a, l) => a + l.qte, 0)} article(s)</span></div>` },
      { l: 'Paiement client', v: s => statusPill('statutsPaiement', s.statutPaiement) },
      { l: 'Préparation', v: s => etatPill(s.etat) },
      { l: 'Net vendeur', cls: 'right nowrap', v: s => `<b>${fmt(s.net)}</b>` }]), rows, { href: s => 'commande/' + s.numero, foot: false, empty: 'Aucune commande dans cet onglet' });
  }

  function netPreview() {
    const f = document.getElementById('f-vp'); if (!f) return;
    const prix = +(f.promo.value || f.prix.value) || 0; const com = Math.round(prix * v.commission / 100);
    document.getElementById('net-prev').innerHTML = `<div class="sum-row small" style="padding:2px 0"><span>Prix client</span><b>${fmt(prix)}</b></div><div class="sum-row small" style="padding:2px 0"><span>Commission ${v.commission} %</span><span>− ${fmt(com)}</span></div><div class="sum-row small" style="padding:2px 0"><span>Vous recevez</span><b style="color:var(--success)">${fmt(prix - com)}</b></div>`;
  }
  function shopPreview() {
    const f = document.getElementById('f-shop'); const el = document.getElementById('shop-prev'); if (!f || !el) return;
    el.innerHTML = `<div class="vcard" style="--h:${v.hue}"><div class="v-cover"></div><div class="v-body"><div class="v-avatar">${App.initials(f.nom.value || '?')}</div>
      <div class="row between" style="margin-top:10px"><b>${esc(f.nom.value)}</b><span class="verified">${icon('shield')} Vérifié</span></div><div class="small muted">${icon('pin', 'sm')} ${esc(f.ville.value)}</div>
      <p class="small text-2" style="margin:8px 0 0">${esc(f.desc.value)}</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px">${myProds().slice(0, 3).map(p => pv(p, 'sm')).join('')}</div></div></div>`;
  }
  function updateBulk() {
    const n = document.querySelectorAll('[data-sel]:checked').length; const b = document.getElementById('bulk'); if (!b) return;
    b.classList.toggle('show', n > 0); document.getElementById('bulk-n').textContent = n + ' colis sélectionné(s)';
  }
  document.addEventListener('input', e => { if (e.target.closest('#f-vp')) netPreview(); if (e.target.closest('#f-shop')) shopPreview(); });
  document.addEventListener('change', e => {
    if (e.target.hasAttribute('data-selall')) { document.querySelectorAll('[data-sel]').forEach(c => { c.checked = e.target.checked; }); updateBulk(); }
    if (e.target.hasAttribute('data-sel')) updateBulk();
  });

  document.addEventListener('click', e => {
    const q = s => e.target.closest(s);
    if (q('[data-period]')) { F.period = +q('[data-period]').dataset.period; BO.refresh(); }
    if (q('[data-tabc]')) { F.cmd = q('[data-tabc]').dataset.tabc; BO.refresh(); }
    if (q('[data-tabp]')) { F.prod = q('[data-tabp]').dataset.tabp; BO.refresh(); }
    if (q('[data-print]')) toast('Bons de préparation générés (PDF, maquette).');
    if (q('[data-bulkready]')) {
      const nums = [...document.querySelectorAll('[data-sel]:checked')].map(c => c.dataset.sel);
      confirmBox(nums.length + ' colis prêt(s) ?', '<p>Confirmez que tous les articles sont emballés et étiquetés. Un seul enlèvement sera programmé.</p>', () => { const m = prep(); nums.forEach(n => { m[n] = 'pret'; }); store.set('vprep_' + VID, m); BO.refresh(); toast(nums.length + ' colis prêt(s) · enlèvement programmé demain matin'); });
    }
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
      if (id === 'new') { DB.produits.push({ ...d, id: 'p' + (DB.produits.length + 1), cat: 'epicerie', vendeur: VID, reserve: 0, note: 0, avis: 0, ventes: 0, icon: 'leaf', actif: false, validation: 'attente', variantes: null }); toast('Produit soumis · validation sous 24 h'); F.prod = 'validation'; location.hash = 'produits'; }
      else { Object.assign(P(id), d); toast('Modifications enregistrées'); BO.refresh(); }
    }
    if (q('[data-vin]')) { const p = P(q('[data-vin]').dataset.vin);
      modal({ title: 'Réception de marchandise', noIcon: true, body: `<div class="row" style="gap:12px;margin-bottom:12px"><div style="width:52px">${pv(p, 'sm')}</div><div class="small"><b>${esc(p.nom)}</b><br>Stock actuel ${p.stock} · disponible ${dispo(p)}</div></div><form class="form-grid" novalidate>${field('Quantité reçue', 'q', '', { type: 'number', rule: 'req', attrs: 'min="1" step="1"' })}${field('Référence (bon de livraison…)', 'ref', '', { rule: 'req' })}</form>`,
        actions: [{ label: 'Annuler' }, { label: 'Ajouter au stock', cls: 'btn-primary', onClick(bd) { const f = bd.querySelector('form'); let ok = validate(f); const n = +f.q.value; if (f.q.value && (!Number.isInteger(n) || n < 1)) { const x = f.q.closest('.field'); x.classList.add('error'); x.querySelector('.err').textContent = 'Entier ≥ 1.'; ok = false; } if (!ok) return false; p.stock += n; DB.mouvements.unshift(['2026-09-28 10:00', p.id, 'Entrée', n, f.ref.value, v.nom]); BO.refresh(); toast('+' + n + ' ajouté(s) · disponible : ' + dispo(p)); } }] }); }
    if (q('[data-reply]')) { const a = DB.avis.find(x => x.id === q('[data-reply]').dataset.reply);
      modal({ title: 'Répondre à ' + esc(a.client), noIcon: true, body: `<div class="field"><label>Réponse publique <span class="req">*</span></label><textarea class="textarea" id="rep" maxlength="500">Misaotra betsaka ! Merci pour votre confiance.</textarea><span class="err">Réponse vide.</span><span class="hint">Restez courtois : la réponse est visible sur la fiche produit.</span></div>`,
        actions: [{ label: 'Annuler' }, { label: 'Publier la réponse', cls: 'btn-primary', onClick(bd) { const t = bd.querySelector('#rep'); if (!t.value.trim()) { t.closest('.field').classList.add('error'); return false; } a.reponse = t.value.trim(); BO.refresh(); toast('Réponse publiée'); } }] }); }
  });
  document.addEventListener('submit', e => { if (e.target.id !== 'f-shop') return; e.preventDefault(); if (validate(e.target)) toast('Boutique mise à jour'); });

  BO.mount({
    key: 'vendeur', tag: 'Vendeur', home: '#dashboard', front: '../index.html',
    searchPh: 'Commande ou produit…',
    user: { nom: v.nom, role: () => 'Vendeur vérifié · ' + v.ville },
    sideFoot: `<div class="info-list" style="padding:12px"><b class="small">Besoin d’aide ?</b><span class="xs muted">Équipe vendeurs : +261 34 00 000 10 · vendeurs@site-ecommerce.mg</span></div><a class="bo-link" href="../index.html" style="margin-top:8px">${icon('globe')} Voir le site</a><a class="bo-link" href="../admin/index.html">${icon('lock')} Back-office admin (démo)</a>`,
    notifs: [['warning', 'package', 'Nouvelle commande CMD-2026-001284', '2 × Vanille bourbon · payée MVola'], ['info', 'wallet', 'Reversement programmé', '1er octobre · virement BOA'], ['primary', 'star', 'Nouvel avis 5 étoiles', 'Vanille bourbon de la SAVA']],
    menu: [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', group: 'Ma boutique' },
      { id: 'commandes', label: 'Commandes', icon: 'package', group: 'Ma boutique', count: () => subs().filter(s => s.etat === 'a_preparer' && canShip(s)).length },
      { id: 'produits', label: 'Produits', icon: 'box', group: 'Ma boutique' }, { id: 'stock', label: 'Stock', icon: 'refresh', group: 'Ma boutique', count: () => myProds().filter(p => dispo(p) <= p.seuil).length },
      { id: 'revenus', label: 'Revenus', icon: 'wallet', group: 'Finances' }, { id: 'avis', label: 'Avis clients', icon: 'star', group: 'Finances' },
      { id: 'boutique', label: 'Paramètres boutique', icon: 'settings', group: 'Compte' }
    ],
    alias: { commande: 'commandes', produit: 'produits' },
    routes,
    after: { dashboard: () => BO.bindLine('ch-v', days(F.period), fmt), produit: netPreview, boutique: shopPreview },
    onSearch(q) { const s = subs().find(x => x.numero.toLowerCase().includes(q.toLowerCase())); if (s) { location.hash = 'commande/' + s.numero; return; } const p = myProds().find(x => x.nom.toLowerCase().includes(q.toLowerCase())); if (p) { location.hash = 'produit/' + p.id; return; } toast('Aucun résultat', 'warning'); }
  });
})();
