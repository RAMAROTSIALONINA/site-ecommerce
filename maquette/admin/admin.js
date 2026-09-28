/* =========================================================
   Back-Office Administration — Site E_commerce
   ========================================================= */
(function () {
  const { icon, esc, fmt, fmtN, fmtDate, P, V, C, Z, PAY, CL, pv, toast, modal, confirmBox, validate, statusPill, dispo, store } = App;
  const h = BO.head.bind(BO), panel = BO.panel.bind(BO), table = BO.table.bind(BO), kpi = BO.kpi.bind(BO), field = BO.field.bind(BO);

  // Commandes : celles de la démo + celles passées sur le site dans ce navigateur
  const orders = () => store.get('orders', []).map(o => ({ ...o, date: o.date === 'maintenant' ? '2026-09-28 10:00' : o.date, _local: true })).concat(DB.commandes);
  const findOrder = n => orders().find(o => o.numero === n);
  function saveOrder(o) {
    if (o._local) { const l = store.get('orders', []); const i = l.findIndex(x => x.numero === o.numero); if (i >= 0) { const c = { ...o }; delete c._local; l[i] = c; store.set('orders', l); } }
    else { const i = DB.commandes.findIndex(x => x.numero === o.numero); DB.commandes[i] = o; }
  }
  const cname = id => { const c = CL(id); return c ? c.prenom + ' ' + c.nom : '—'; };
  const now = () => '2026-09-28 ' + new Date().toTimeString().slice(0, 5);
  const commissionOf = o => o.lignes.reduce((s, l) => s + Math.round(l.prix * l.qte * V(l.vendeur).commission / 100), 0);
  const alertes = () => DB.produits.filter(p => dispo(p) <= p.seuil);
  const ROLE_USER = { super: 'u1', produits: 'u2', commandes: 'u3', comptable: 'u4', livraison: 'u5', vendeurs: 'u6' };
  const me = () => DB.utilisateurs.find(u => u.id === ROLE_USER[BO.role]);
  const log = (type, msg) => DB.journal.unshift([now(), me().nom, type, msg, '102.16.44.12']);
  const pillStock = p => { const d = dispo(p); return d <= 0 ? '<span class="badge badge-danger">Rupture</span>' : d <= p.seuil ? '<span class="badge badge-warning">Alerte</span>' : '<span class="badge badge-success">OK</span>'; };
  const F = { period: 30, cmd: { q: '', sp: '', sl: '', pay: '' }, prod: { q: '', cat: '', v: '', st: '' }, pay: { sp: '' }, avis: 'en_attente', journal: '' };

  // Vignettes des articles d’une commande (3 max + compteur)
  const thumbs = o => { const ids = [...new Set(o.lignes.map(l => l.produit))]; return `<div class="thumbs-mini">${ids.slice(0, 3).map(id => pv(P(id), 'sm')).join('')}${ids.length > 3 ? `<span class="more">+${ids.length - 3}</span>` : ''}</div>`; };

  const TRANS_LIV = { a_preparer: ['expediee', 'annulee'], expediee: ['en_livraison', 'retour'], en_livraison: ['livree', 'retour'], livree: ['retour'], retour: [], annulee: [] };

  const routes = {
    // ================= TABLEAU DE BORD =================
    dashboard() {
      const os = orders(); const n = F.period; const days = DB.ventes30.slice(-n); const prev = DB.ventes30.slice(-2 * n, -n);
      const ca = days.reduce((s, d) => s + d.ca, 0), nb = days.reduce((s, d) => s + d.commandes, 0);
      const caPrev = prev.length ? prev.reduce((s, d) => s + d.ca, 0) : ca / 1.14, nbPrev = prev.length ? prev.reduce((s, d) => s + d.commandes, 0) : nb / 1.09;
      const pctv = (a, b) => Math.round((a / b - 1) * 1000) / 10;
      const aPrep = os.filter(o => o.statutLivraison === 'a_preparer' && !['annule', 'echoue'].includes(o.statutPaiement));
      const payWait = os.filter(o => ['attente', 'initie'].includes(o.statutPaiement) && o.statutLivraison !== 'annulee');
      const best = days.reduce((a, d) => (d.ca > a.ca ? d : a), days[0]);
      const todo = [
        ['warning', 'package', aPrep.length, 'Commandes à préparer', 'Dont ' + aPrep.filter(o => o.statutPaiement === 'paye').length + ' payées', '#commandes'],
        ['info', 'card', payWait.length, 'Paiements à rapprocher', 'Virements et Mobile Money initiés', '#paiements'],
        ['danger', 'alert', alertes().length, 'Alertes de stock', alertes().filter(p => dispo(p) <= 0).length + ' produit(s) en rupture', '#stock'],
        ['primary', 'star', DB.avis.filter(a => a.statut === 'en_attente').length, 'Avis à modérer', 'Dont 1 contenu suspect', '#avis'],
        ['primary', 'store', DB.vendeurs.filter(v => v.statut === 'en_attente').length, 'Demande vendeur', 'Toamasina Import — dossier à vérifier', '#vendeurs']
      ];
      const livr = [['a_preparer', 'warning'], ['expediee', 'info'], ['en_livraison', 'primary'], ['livree', 'success'], ['retour', 'danger'], ['annulee', 'muted']]
        .map(([k, c]) => ({ l: DB.statutsLivraison[k].l, n: os.filter(o => o.statutLivraison === k).length, c, href: '#commandes' }));
      const byPay = DB.paiements.map(p => ({ l: p.nom, v: os.filter(o => o.paiement === p.id).length })).filter(x => x.v).sort((a, b) => b.v - a.v);
      const caMois = DB.ventes30.reduce((s, d) => s + d.ca, 0), objectif = 75000000, pc = Math.min(100, Math.round(caMois / objectif * 100));
      const JT = { Commande: ['package', 'primary'], Stock: ['alert', 'warning'], Produit: ['box', 'info'], Connexion: ['lock', 'success'], 'Sécurité': ['shield', 'danger'], Livraison: ['truck', 'info'], Paiement: ['wallet', 'success'], Vendeur: ['store', 'primary'], 'Paramètres': ['settings', 'warning'], Avis: ['star', 'primary'], Client: ['user', 'info'], Utilisateur: ['users', 'info'], Promotion: ['tag', 'primary'] };
      const topP = [...DB.produits].sort((a, b) => b.ventes * App.unitPrice(b) - a.ventes * App.unitPrice(a)).slice(0, 5);
      const heure = new Date().getHours();
      return h(`${heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'}, ${esc(me().nom.split(' ')[0])}`, new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · voici l’activité de la marketplace',
        `<div class="seg-ctl" role="group" aria-label="Période">${[7, 14, 30].map(p => `<button data-period="${p}" class="${n === p ? 'on' : ''}">${p} j</button>`).join('')}</div><a class="btn btn-primary" href="#rapports">${icon('chart', 'sm')} Rapports</a>`) +
        `<div class="kpis">
          ${kpi('Chiffre d’affaires', fmt(ca), 'wallet', `sur ${n} jours`, pctv(ca, caPrev), days.map(d => d.ca))}
          ${kpi('Commandes', fmtN(nb), 'package', `sur ${n} jours`, pctv(nb, nbPrev), days.map(d => d.commandes), 'info')}
          ${kpi('Panier moyen', fmt(ca / nb), 'cart', 'par commande', pctv(ca / nb, caPrev / nbPrev), days.map((d, i) => { const w = days.slice(Math.max(0, i - 3), i + 1); return w.reduce((s, x) => s + x.ca, 0) / w.reduce((s, x) => s + x.commandes, 0); }), 'accent')}
          ${kpi('À traiter maintenant', aPrep.length + payWait.length, 'clock', `${aPrep.length} à préparer · ${payWait.length} paiements`, null, null, 'warning')}
        </div>
        <div class="bo-grid g-2-1">
          ${panel('Chiffre d’affaires', `<div class="chart-sum"><div><b>${fmt(ca)}</b>Total ${n} jours</div><div><b>${fmt(ca / n)}</b>Moyenne par jour</div><div><b>${fmt(best.ca)}</b>Meilleur jour · ${best.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div></div>` +
            BO.lineChart('ch-ca', BO.days(n), { label: `Chiffre d’affaires quotidien sur ${n} jours` }) + '<p class="xs muted" style="margin:8px 0 0">Survolez le graphique pour le détail journalier. CA TTC des commandes payées, hors frais de livraison.</p>', '<a href="#rapports">Détail →</a>')}
          ${panel('À traiter', todo.map(t => `<a class="list-item" href="${t[5]}"><span class="li-ico" style="background:var(--${t[0]}-50);color:var(--${t[0]})">${icon(t[1], 'sm')}</span><div class="grow"><b class="small">${t[3]}</b><div class="xs muted">${t[4]}</div></div><span class="li-n">${t[2]}</span>${icon('chevron-right', 'sm')}</a>`).join(''), '', true)}
        </div>
        <div class="bo-grid g-3" style="margin-top:16px">
          ${panel('Statut des livraisons', BO.statusBar(livr), '<a href="#livraisons">Suivi →</a>')}
          ${panel('Objectif de septembre', `<div class="goal"><div class="goal-ring" style="--p:${pc}"><span>${pc} %</span></div><div><div class="small text-2">CA réalisé</div><b style="font-size:1.15rem;font-family:var(--font-title)">${fmt(caMois)}</b><div class="xs muted" style="margin-top:4px">Objectif : ${fmt(objectif)}<br>Reste ${fmt(Math.max(0, objectif - caMois))} en 2 jours</div></div></div>
            <div class="sum-row small" style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><span>Commission marketplace</span><b>${fmt(caMois * .104)}</b></div><div class="sum-row small"><span>Nouveaux clients</span><b>318</b></div><div class="sum-row small"><span>Taux de conversion</span><b>2,4 %</b></div>`)}
          ${panel('Moyens de paiement', BO.hbars(byPay, v => v + ' cmd') + '<p class="xs muted" style="margin:14px 0 0">Nombre de commandes par moyen, toutes périodes de l’échantillon.</p>')}
        </div>
        <div class="bo-grid g-2-1" style="margin-top:16px">
          ${panel('Commandes récentes', table([
            { l: 'Commande', v: o => `<b>${o.numero.slice(-6)}</b><div class="xs muted nowrap">${fmtDate(o.date).replace(' 2026', '')}</div>` },
            { l: 'Client', v: o => `<div class="cell-user"><span class="avatar">${App.initials(cname(o.client))}</span><span>${esc(cname(o.client))}</span></div>` },
            { l: 'Articles', v: o => thumbs(o) },
            { l: 'Paiement', v: o => statusPill('statutsPaiement', o.statutPaiement) }, { l: 'Livraison', v: o => statusPill('statutsLivraison', o.statutLivraison) },
            { l: 'Total', cls: 'right nowrap', v: o => `<b>${fmt(o.total)}</b>` }], os.slice(0, 6), { href: o => 'commande/' + o.numero, foot: false }), '<a href="#commandes">Toutes →</a>', true)}
          ${panel('Activité récente', `<ul class="feed">${DB.journal.slice(0, 6).map(j => { const t = JT[j[2]] || ['info', 'info']; return `<li><span class="f-ico" style="background:var(--${t[1]}-50);color:var(--${t[1]})">${icon(t[0])}</span><div class="grow"><b>${esc(j[1])}</b> <time>· ${fmtDate(j[0]).replace(/ 2026/, '')}</time><p>${esc(j[3])}</p></div></li>`; }).join('')}</ul>`, '<a href="#journal">Journal →</a>', true)}
        </div>
        <div class="bo-grid g-1-1" style="margin-top:16px">
          ${panel('Produits les plus rentables', topP.map((p, i) => `<a class="rank" href="#produit/${p.id}"><span class="r-n">${i + 1}</span>${pv(p, 'sm')}<div class="grow" style="min-width:0"><b>${esc(p.nom)}</b><span class="xs muted">${esc(V(p.vendeur).nom)} · ${fmtN(p.ventes)} ventes</span></div><b class="small nowrap">${fmt(p.ventes * App.unitPrice(p))}</b></a>`).join(''), '<a href="#produits">Catalogue →</a>', true)}
          ${panel('Stock faible', table([{ l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<div><b class="small">${esc(p.nom)}</b><div class="xs muted">${esc(V(p.vendeur).nom)}</div></div></div>` }, { l: 'Dispo', cls: 'right nowrap', v: p => `<b>${dispo(p)}</b> / seuil ${p.seuil}` }, { l: '', v: pillStock }], alertes(), { href: p => 'stock', foot: false }), '<a href="#stock">Gérer →</a>', true)}
        </div>`;
    },

    // ================= COMMANDES =================
    commandes() {
      const f = F.cmd; const all = orders();
      const l = all.filter(o => (!f.sp || o.statutPaiement === f.sp) && (!f.sl || o.statutLivraison === f.sl) && (!f.pay || o.paiement === f.pay) &&
        (!f.q || (o.numero + ' ' + cname(o.client)).toLowerCase().includes(f.q.toLowerCase())));
      const opt = (map, cur) => Object.entries(DB[map]).map(([k, s]) => `<option value="${k}" ${cur === k ? 'selected' : ''}>${s.l}</option>`).join('');
      const tabs = [['', 'Toutes'], ['a_preparer', 'À préparer'], ['expediee', 'Expédiées'], ['en_livraison', 'En livraison'], ['livree', 'Livrées'], ['retour', 'Retours'], ['annulee', 'Annulées']];
      return h('Commandes', all.length + ' commandes dans l’échantillon · les commandes passées sur le site dans ce navigateur apparaissent ici', `<button class="btn" data-export>${icon('download', 'sm')} Exporter CSV</button>`) +
        panel('', `<div class="status-tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${f.sl === t[0]}" class="${f.sl === t[0] ? 'on' : ''}" data-tabsl="${t[0]}">${t[1]} <span class="n">${t[0] ? all.filter(o => o.statutLivraison === t[0]).length : all.length}</span></button>`).join('')}</div>
          <div class="filters-bar">
          <input class="input" data-fc="q" placeholder="N° de commande ou client…" value="${esc(f.q)}">
          <select class="select" data-fc="sp"><option value="">Tous paiements</option>${opt('statutsPaiement', f.sp)}</select>
          <select class="select" data-fc="pay"><option value="">Tous moyens</option>${DB.paiements.map(p => `<option value="${p.id}" ${f.pay === p.id ? 'selected' : ''}>${p.nom}</option>`).join('')}</select>
          ${f.q || f.sp || f.sl || f.pay ? `<button class="btn btn-sm btn-ghost" data-freset="cmd">Effacer les filtres</button>` : ''}</div>
          <div class="bulk-bar" id="bulk"><span id="bulk-n"></span><button class="btn btn-sm btn-primary" data-bulk="expediee">${icon('truck', 'sm')} Marquer expédiées</button><button class="btn btn-sm" data-bulk="print">${icon('print', 'sm')} Bons de préparation</button><button class="btn btn-sm btn-ghost" data-bulk="clear">Désélectionner</button></div>` +
          table([
            { l: '<input type="checkbox" data-selall aria-label="Tout sélectionner">', v: o => `<input type="checkbox" data-sel="${o.numero}" aria-label="Sélectionner ${o.numero}">` },
            { l: 'Commande', v: o => `<b>${o.numero}</b>${o._local ? ' <span class="badge badge-info">Nouvelle</span>' : ''}<div class="xs muted">${fmtDate(o.date)}</div>` },
            { l: 'Client', v: o => `<div class="cell-user"><span class="avatar">${App.initials(cname(o.client))}</span><div>${esc(cname(o.client))}<div class="xs muted">${CL(o.client).ville}</div></div></div>` },
            { l: 'Articles', v: o => thumbs(o) },
            { l: 'Moyen', v: o => `<span class="row" style="gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:${PAY(o.paiement).couleur}"></span>${PAY(o.paiement).nom}</span>` },
            { l: 'Paiement', v: o => statusPill('statutsPaiement', o.statutPaiement) },
            { l: 'Livraison', v: o => statusPill('statutsLivraison', o.statutLivraison) },
            { l: 'Total', cls: 'right nowrap', v: o => `<b>${fmt(o.total)}</b>` }
          ], l, { href: o => 'commande/' + o.numero, total: 1284 }), '', true);
    },
    commande(num) {
      const o = findOrder(num);
      if (!o) return h('Commande introuvable', '', '<a class="btn" href="#commandes">Retour</a>');
      const c = CL(o.client); const a = o.adresse || { nom: c.prenom + ' ' + c.nom, tel: c.tel, adresse: 'Lot II M 12', fokontany: 'Centre', commune: c.ville === 'Antananarivo' ? 'Antananarivo Renivohitra' : c.ville, ville: c.ville, region: '', repere: '—' };
      const groups = {}; o.lignes.forEach(l => { (groups[l.vendeur] = groups[l.vendeur] || []).push(l); });
      const next = TRANS_LIV[o.statutLivraison];
      const com = commissionOf(o);
      return h(`Commande ${o.numero}`, `Passée le ${fmtDate(o.date)} · ${statusPill('statutsPaiement', o.statutPaiement)} ${statusPill('statutsLivraison', o.statutLivraison)}`,
        `<a class="btn" href="../facture.html?id=${o.numero}" target="_blank">${icon('file', 'sm')} Facture PDF</a><button class="btn" data-notify-client>${icon('message', 'sm')} Notifier le client</button>`,
        `<a href="#commandes">Commandes</a>${icon('chevron-right', 'sm')}<span>${o.numero}</span>`) +
        `<div class="bo-grid g-2-1">
          <div class="stack">
            ${Object.entries(groups).map(([vid, ls]) => panel(`${icon('store', 'sm')} Sous-commande ${esc(V(vid).nom)}`, table([
              { l: 'Produit', v: l => `<div class="cell-prod">${pv(P(l.produit), 'sm')}<div><b class="small">${esc(P(l.produit).nom)}</b><div class="xs muted">${P(l.produit).sku}${l.variante ? ' · ' + esc(l.variante) : ''}</div></div></div>` },
              { l: 'Qté', cls: 'right', v: l => l.qte }, { l: 'P.U.', cls: 'right nowrap', v: l => fmt(l.prix) }, { l: 'Total', cls: 'right nowrap', v: l => `<b>${fmt(l.prix * l.qte)}</b>` }], ls, { foot: false }) +
              `<div class="table-foot"><span>Commission ${V(vid).commission} % : <b>${fmt(ls.reduce((s, l) => s + Math.round(l.prix * l.qte * V(vid).commission / 100), 0))}</b></span><span>${o.statutLivraison === 'a_preparer' ? '<span class="badge badge-warning">En préparation chez le vendeur</span>' : '<span class="badge badge-success">Colis remis</span>'}</span></div>`,
              `<span class="xs muted">${o.numero}-${vid.toUpperCase()}</span>`, true)).join('')}
            ${panel('Historique des statuts', `<ul class="timeline">${o.historique.map((x, i) => `<li class="done"><span class="tl-dot">${icon('check')}</span><b>${esc(x.statut)}</b><span>${x.date === 'maintenant' ? 'À l’instant' : fmtDate(x.date)} · ${esc(x.par)}</span></li>`).join('')}</ul>
              <div class="row" style="gap:8px"><input class="input" id="note-int" placeholder="Ajouter une note interne (non visible du client)…"><button class="btn" data-note>Ajouter</button></div>`)}
          </div>
          <div class="stack">
            ${panel('Livraison', `<p class="small" style="margin:0 0 12px"><b>${esc(a.nom)}</b> · ${a.tel}<br>${esc(a.adresse)}, fokontany ${esc(a.fokontany)}<br>${esc(a.commune)} — ${esc(a.ville)}<br><span class="muted">Repère : ${esc(a.repere || '—')}</span></p>
              <div class="info-list" style="padding:10px 12px"><div class="small"><b>${Z(o.zone).nom}</b> · ${o.frais ? fmt(o.frais) : 'Gratuit'} · ${Z(o.zone).delai}${o.creneau ? '<br>Créneau : ' + o.creneau : ''}</div></div>
              ${next.length ? `<div class="field" style="margin-top:14px"><label>Faire évoluer le statut</label><div class="row" style="gap:8px"><select class="select" id="next-liv">${next.map(s => `<option value="${s}">${DB.statutsLivraison[s].l}</option>`).join('')}</select><button class="btn btn-primary" data-liv>Valider</button></div><span class="hint">Le client est notifié automatiquement (SMS / e-mail).</span></div>` : '<p class="small muted" style="margin:12px 0 0">Aucune transition possible depuis ce statut.</p>'}`)}
            ${panel('Paiement', `<div class="sum-row"><span>Moyen</span><b>${PAY(o.paiement).nom}</b></div>${o.mmTel ? `<div class="sum-row"><span>Numéro</span><span>${esc(o.mmTel)}</span></div>` : ''}
              <div class="sum-row"><span>Statut</span>${statusPill('statutsPaiement', o.statutPaiement)}</div><div class="sum-row"><span>Référence</span><span class="small">${o.refPaiement || '—'}</span></div>
              <div class="sum-row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:10px"><span>Sous-total</span><span>${fmt(o.sousTotal)}</span></div>
              ${o.remise ? `<div class="sum-row"><span>Remise ${o.codePromo}</span><span class="discount">− ${fmt(o.remise)}</span></div>` : ''}
              <div class="sum-row"><span>Livraison</span><span>${fmt(o.frais)}</span></div><div class="sum-row total"><span>Total</span><span>${fmt(o.total)}</span></div>
              <div class="sum-row small muted"><span>Commission marketplace</span><span>${fmt(com)}</span></div>
              <div class="stack" style="margin-top:12px">
                ${['attente', 'initie'].includes(o.statutPaiement) ? `<button class="btn btn-primary btn-block" data-pay="paye">${icon('check', 'sm')} Confirmer la réception du paiement</button>` : ''}
                ${o.statutPaiement === 'initie' ? `<button class="btn btn-block" data-pay="echoue">Marquer comme échoué</button>` : ''}
                ${o.statutPaiement === 'paye' ? `<button class="btn btn-danger btn-block" data-pay="rembourse">${icon('refresh', 'sm')} Rembourser</button>` : ''}
                ${o.statutPaiement === 'attente' && o.statutLivraison === 'a_preparer' ? `<button class="btn btn-ghost btn-block" data-pay="annule" style="color:var(--danger)">Annuler la commande</button>` : ''}
              </div>`)}
            ${panel('Client', `<div class="row"><div class="avatar">${App.initials(c.prenom + ' ' + c.nom)}</div><div><b>${esc(c.prenom)} ${esc(c.nom)}</b><div class="xs muted">${esc(c.email)}<br>${c.tel}</div></div></div><button class="btn btn-sm btn-block" style="margin-top:12px" data-client="${c.id}">Voir la fiche client</button>`)}
          </div>
        </div>`;
    },

    // ================= PRODUITS =================
    produits() {
      const f = F.prod;
      const l = DB.produits.filter(p => (!f.cat || p.cat === f.cat) && (!f.v || p.vendeur === f.v) && (!f.q || (p.nom + p.sku).toLowerCase().includes(f.q.toLowerCase())) &&
        (!f.st || (f.st === 'actif' && p.actif) || (f.st === 'inactif' && !p.actif) || (f.st === 'rupture' && dispo(p) <= 0) || (f.st === 'alerte' && dispo(p) <= p.seuil)));
      return h('Produits', DB.produits.length + ' produits · ' + DB.vendeurs.filter(v => v.statut === 'actif').length + ' vendeurs', `<button class="btn" data-export>${icon('upload', 'sm')} Import CSV</button><a class="btn btn-primary" href="#produit/new">${icon('plus', 'sm')} Ajouter un produit</a>`) +
        panel('', `<div class="filters-bar">
          <input class="input" data-fp="q" placeholder="Nom ou SKU…" value="${esc(f.q)}">
          <select class="select" data-fp="cat"><option value="">Toutes catégories</option>${DB.categories.map(c => `<option value="${c.id}" ${f.cat === c.id ? 'selected' : ''}>${c.nom}</option>`).join('')}</select>
          <select class="select" data-fp="v"><option value="">Tous vendeurs</option>${DB.vendeurs.filter(v => v.statut === 'actif').map(v => `<option value="${v.id}" ${f.v === v.id ? 'selected' : ''}>${esc(v.nom)}</option>`).join('')}</select>
          <select class="select" data-fp="st"><option value="">Tous statuts</option>${[['actif', 'Actifs'], ['inactif', 'Inactifs'], ['alerte', 'Stock en alerte'], ['rupture', 'En rupture']].map(s => `<option value="${s[0]}" ${f.st === s[0] ? 'selected' : ''}>${s[1]}</option>`).join('')}</select>
          ${f.q || f.cat || f.v || f.st ? `<button class="btn btn-sm btn-ghost" data-freset="prod">Effacer</button>` : ''}</div>` +
          table([
            { l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<div><b class="small">${esc(p.nom)}</b><div class="xs muted">${p.sku}</div></div></div>` },
            { l: 'Vendeur', v: p => esc(V(p.vendeur).nom) }, { l: 'Catégorie', v: p => `${C(p.cat).nom.split(' & ')[0]}<div class="xs muted">${esc(p.sous)}</div>` },
            { l: 'Prix', cls: 'right nowrap', v: p => p.promo != null ? `<b style="color:var(--accent)">${fmt(p.promo)}</b><div class="xs muted" style="text-decoration:line-through">${fmt(p.prix)}</div>` : `<b>${fmt(p.prix)}</b>` },
            { l: 'Stock dispo', cls: 'right', v: p => `<b>${dispo(p)}</b> ${pillStock(p)}` },
            { l: 'Actif', v: p => BO.sw(p.actif, `data-toggle-prod="${p.id}" aria-label="Activer le produit"`) },
            { l: '', cls: 'right', v: p => `<a class="btn btn-sm btn-ghost" href="#produit/${p.id}" aria-label="Modifier">${icon('edit', 'sm')}</a>` }
          ], l, { href: p => 'produit/' + p.id, total: 8540 }), '', true);
    },
    produit(id) {
      const isNew = id === 'new';
      const p = isNew ? { id: 'new', nom: '', sku: '', vendeur: '', cat: '', sous: '', prix: '', promo: null, stock: 0, seuil: 5, reserve: 0, desc: '', variantes: null, actif: false, icon: 'box', slug: '' } : P(id);
      if (!p) return h('Produit introuvable', '', '<a class="btn" href="#produits">Retour</a>');
      const cats = DB.categories;
      const vars = p.variantes ? Object.entries(p.variantes) : [];
      return h(isNew ? 'Nouveau produit' : esc(p.nom), isNew ? 'Les produits créés par un vendeur sont soumis à validation.' : `${p.sku} · ${esc(V(p.vendeur).nom)} · ${p.ventes} ventes`,
        `${isNew ? '' : `<a class="btn" href="../produit.html?id=${p.id}" target="_blank">${icon('eye', 'sm')} Voir sur le site</a>`}<button class="btn btn-primary" data-save-prod="${p.id}">${icon('check', 'sm')} Enregistrer</button>`,
        `<a href="#produits">Produits</a>${icon('chevron-right', 'sm')}<span>${isNew ? 'Nouveau' : p.sku}</span>`) +
        `<form id="f-prod" novalidate><div class="bo-grid g-2-1">
          <div class="stack">
            ${panel('Informations générales', `<div class="form-grid two">
              ${field('Nom du produit', 'nom', p.nom, { rule: 'req', cls: 'span-2', attrs: 'maxlength="120"' })}
              ${field('Référence / SKU', 'sku', p.sku, { rule: 'req', hint: 'Unique sur la plateforme' })}
              ${field('Vendeur', 'vendeur', p.vendeur, { type: 'select', rule: 'req', options: [['', 'Choisir…']].concat(DB.vendeurs.filter(v => v.statut === 'actif').map(v => [v.id, v.nom])) })}
              ${field('Catégorie', 'cat', p.cat, { type: 'select', rule: 'req', options: [['', 'Choisir…']].concat(cats.map(c => [c.id, c.nom])) })}
              ${field('Sous-catégorie', 'sous', p.sous, { type: 'select', rule: 'req', options: [['', 'Choisir…']].concat((C(p.cat) || { sous: [] }).sous) })}
              ${field('Description', 'desc', p.desc, { type: 'textarea', rule: 'req', cls: 'span-2' })}</div>`)}
            ${panel('Images', `<div class="upload-zone" data-upload>${icon('image', 'lg')}<div><b>Glissez vos photos ici</b> ou cliquez pour parcourir</div><div class="xs">JPG, PNG ou WebP · 5 Mo max · converties en WebP et redimensionnées automatiquement</div></div>
              <div class="img-grid">${isNew ? '' : [0, 1, 2, 3].map(i => pv(p, 'sm', i)).join('')}</div>`)}
            ${panel('Variantes', `<p class="small muted" style="margin-top:0">Ex. Taille : S, M, L — le client devra choisir avant l’ajout au panier.</p>
              <div id="vars">${(vars.length ? vars : [['', []]]).map(([k, vs]) => `<div class="form-grid two" style="margin-bottom:10px"><div class="field"><label>Option</label><input class="input" name="vk" value="${esc(k)}" placeholder="Taille, Couleur…"></div><div class="field"><label>Valeurs (séparées par des virgules)</label><input class="input" name="vv" value="${esc(vs.join(', '))}" placeholder="S, M, L"></div></div>`).join('')}</div>
              <button type="button" class="btn btn-sm" data-addvar>${icon('plus', 'sm')} Ajouter une option</button>`)}
            ${panel('Référencement (SEO)', `<div class="form-grid">
              ${field('Titre SEO', 'seoT', p.nom ? p.nom + ' | Site E_commerce' : '', { attrs: 'maxlength="70" data-count="70"', hint: '<span data-c="seoT"></span> / 70 caractères' })}
              ${field('Slug (URL)', 'slug', p.slug, { rule: 'req', hint: 'Lettres minuscules, chiffres et tirets uniquement' })}
              ${field('Méta description', 'seoD', p.desc ? p.desc.slice(0, 150) : '', { type: 'textarea', attrs: 'maxlength="160" style="min-height:70px"', hint: '<span data-c="seoD"></span> / 160 caractères' })}
              <div class="seo-preview" id="seo-prev"></div></div>`)}
          </div>
          <div class="stack">
            ${panel('Statut', `<div class="row between"><div><b class="small">Produit visible</b><div class="xs muted">Publié sur le site</div></div>${BO.sw(p.actif, 'name="actif"')}</div>${isNew ? '<div class="alert alert-info" style="margin-top:12px">' + icon('info') + '<span class="small">Un nouveau produit reste masqué tant qu’il n’est pas validé et activé.</span></div>' : ''}`)}
            ${panel('Prix', `<div class="form-grid">
              ${field('Prix de vente (Ar)', 'prix', p.prix, { type: 'number', rule: 'req', attrs: 'min="100" step="100" inputmode="numeric"' })}
              ${field('Prix promotionnel (Ar)', 'promo', p.promo == null ? '' : p.promo, { type: 'number', attrs: 'min="0" step="100" inputmode="numeric"', hint: 'Laisser vide si aucune promotion. Doit être inférieur au prix de vente.' })}
              <div class="form-grid two">${field('Début promo', 'pd', '2026-09-20', { type: 'date' })}${field('Fin promo', 'pf', '2026-10-20', { type: 'date' })}</div></div>`)}
            ${panel('Stock', `<div class="form-grid two">
              ${field('Stock physique', 'stock', p.stock, { type: 'number', rule: 'req', attrs: 'min="0" step="1" inputmode="numeric"' })}
              ${field('Seuil d’alerte', 'seuil', p.seuil, { type: 'number', rule: 'req', attrs: 'min="0" step="1" inputmode="numeric"' })}</div>
              <div class="sum-row small"><span>Réservé (commandes en cours)</span><b>${p.reserve || 0}</b></div><div class="sum-row small"><span>Disponible à la vente</span><b>${isNew ? '—' : dispo(p)}</b></div>
              <p class="xs muted" style="margin:8px 0 0">Les mouvements (entrées, sorties, ajustements) se font depuis le module Stock et sont historisés.</p>`)}
            ${isNew ? '' : panel('Produits associés', `<div class="row wrap" style="gap:6px">${DB.produits.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4).map(x => `<span class="chip" style="min-height:32px;padding:4px 10px;font-size:.78rem">${esc(x.nom.slice(0, 28))}… ${icon('x', 'sm')}</span>`).join('')}</div><button type="button" class="btn btn-sm" style="margin-top:10px">${icon('plus', 'sm')} Associer un produit</button>`)}
          </div>
        </div></form>`;
    },

    categories() {
      return h('Catégories', 'Arborescence du catalogue', `<button class="btn btn-primary" data-cat="new">${icon('plus', 'sm')} Nouvelle catégorie</button>`) +
        panel('', table([
          { l: 'Catégorie', v: c => `<div class="cell-prod"><div style="width:42px">${App.pvCat(c)}</div><div><b>${c.nom}</b><div class="xs muted">/${c.id}</div></div></div>` },
          { l: 'Sous-catégories', v: c => c.sous.map(s => `<span class="badge">${s}</span>`).join(' ') },
          { l: 'Produits', cls: 'right', v: c => DB.produits.filter(p => p.cat === c.id).length },
          { l: 'Statut', v: () => BO.sw(true, 'aria-label="Catégorie active"') },
          { l: '', cls: 'right', v: c => `<button class="btn btn-sm btn-ghost" data-cat="${c.id}">${icon('edit', 'sm')}</button>` }], DB.categories, { foot: false }), '', true);
    },

    promotions() {
      const promoProds = DB.produits.filter(p => p.promo != null);
      return h('Promotions', 'Codes promo et prix promotionnels', `<button class="btn btn-primary" data-promo-new>${icon('plus', 'sm')} Nouveau code promo</button>`) +
        panel('Codes promotionnels', table([
          { l: 'Code', v: p => `<b style="font-family:var(--font-title);letter-spacing:.04em">${p.code}</b>` },
          { l: 'Réduction', v: p => p.type === 'pourcent' ? p.valeur + ' %' : fmt(p.valeur) }, { l: 'Cible', v: p => esc(p.cible) },
          { l: 'Minimum', cls: 'right nowrap', v: p => p.min ? fmt(p.min) : '—' }, { l: 'Période', v: p => `${fmtDate(p.debut)} → ${fmtDate(p.fin)}` },
          { l: 'Utilisations', cls: 'right', v: p => p.utilisations },
          { l: 'Statut', v: p => p.actif && p.fin >= '2026-09-28' ? '<span class="badge badge-success">Actif</span>' : '<span class="badge">Expiré</span>' },
          { l: 'Actif', v: p => BO.sw(p.actif, `data-toggle-promo="${p.code}"`) }], DB.promos, { foot: false }), '', true) +
        `<div style="margin-top:16px">${panel('Produits en promotion (' + promoProds.length + ')', table([
          { l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<b class="small">${esc(p.nom)}</b></div>` }, { l: 'Vendeur', v: p => esc(V(p.vendeur).nom) },
          { l: 'Prix', cls: 'right nowrap', v: p => fmt(p.prix) }, { l: 'Promo', cls: 'right nowrap', v: p => `<b style="color:var(--accent)">${fmt(p.promo)}</b>` }, { l: 'Remise', cls: 'right', v: p => '−' + App.pct(p) + ' %' }], promoProds, { href: p => 'produit/' + p.id, foot: false }), '', true)}</div>`;
    },

    // ================= STOCK =================
    stock() {
      const val = DB.produits.reduce((s, p) => s + p.stock * App.unitPrice(p), 0);
      const reg = store.get('regleStock', 'paiement');
      return h('Gestion du stock', 'Stock physique, réservations et mouvements', `<button class="btn" data-export>${icon('download', 'sm')} Inventaire CSV</button>`) +
        `<div class="kpis">${kpi('Valeur du stock', fmt(val), 'wallet', 'au prix de vente')}${kpi('Unités réservées', DB.produits.reduce((s, p) => s + (p.reserve || 0), 0), 'clock', 'commandes non expédiées')}${kpi('Produits en alerte', alertes().length, 'alert', 'disponible ≤ seuil')}${kpi('Ruptures', DB.produits.filter(p => dispo(p) <= 0).length, 'x', 'commande bloquée')}</div>
        <div class="alert alert-info" style="margin-bottom:16px">${icon('info')}<span><b>Règle active :</b> ${reg === 'paiement' ? 'réservation à la commande, décrémentation après confirmation du paiement' : 'décrémentation immédiate à la commande'}. Toute commande est bloquée si le stock disponible est insuffisant. <a href="#parametres/stock" style="font-weight:700">Modifier</a></span></div>` +
        panel('État du stock', table([
          { l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<div><b class="small">${esc(p.nom)}</b><div class="xs muted">${p.sku} · ${esc(V(p.vendeur).nom)}</div></div></div>` },
          { l: 'Physique', cls: 'right', v: p => p.stock }, { l: 'Réservé', cls: 'right', v: p => p.reserve || 0 }, { l: 'Disponible', cls: 'right', v: p => `<b>${dispo(p)}</b>` },
          { l: 'Seuil', cls: 'right', v: p => p.seuil }, { l: 'État', v: pillStock },
          { l: '', cls: 'right', v: p => `<button class="btn btn-sm" data-mvt="${p.id}">${icon('refresh', 'sm')} Mouvement</button>` }], [...DB.produits].sort((a, b) => (dispo(a) - a.seuil) - (dispo(b) - b.seuil)), { total: 8540 }), '', true) +
        `<div style="margin-top:16px">${panel('Historique des mouvements', table([
          { l: 'Date', v: m => `<span class="nowrap">${fmtDate(m[0])}</span>` }, { l: 'Produit', v: m => esc(P(m[1]).nom) },
          { l: 'Type', v: m => `<span class="badge ${m[2] === 'Entrée' || m[2] === 'Retour' ? 'badge-success' : m[2] === 'Réservation' ? 'badge-info' : 'badge-warning'}">${m[2]}</span>` },
          { l: 'Quantité', cls: 'right', v: m => `<b style="color:var(--${m[3] > 0 ? 'success' : 'danger'})">${m[3] > 0 ? '+' : ''}${m[3]}</b>` }, { l: 'Référence / motif', v: m => esc(m[4]) }, { l: 'Par', v: m => esc(m[5]) }], DB.mouvements), '', true)}</div>`;
    },

    // ================= CLIENTS =================
    clients() {
      const os = orders();
      return h('Clients', DB.clients.length + ' clients (échantillon)', `<button class="btn" data-export>${icon('download', 'sm')} Exporter</button>`) +
        panel('', table([
          { l: 'Client', v: c => `<div class="row"><div class="avatar" style="width:36px;height:36px;font-size:.78rem">${App.initials(c.prenom + ' ' + c.nom)}</div><div><b>${esc(c.prenom)} ${esc(c.nom)}</b><div class="xs muted">${esc(c.email)}</div></div></div>` },
          { l: 'Téléphone', v: c => `<span class="nowrap">${c.tel}</span>` }, { l: 'Ville', v: c => c.ville },
          { l: 'Commandes', cls: 'right', v: c => os.filter(o => o.client === c.id).length },
          { l: 'Total payé', cls: 'right nowrap', v: c => `<b>${fmt(os.filter(o => o.client === c.id && o.statutPaiement === 'paye').reduce((s, o) => s + o.total, 0))}</b>` },
          { l: 'Inscrit le', v: c => fmtDate(c.inscrit) },
          { l: 'Statut', v: c => c.statut === 'actif' ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Bloqué</span>' },
          { l: '', cls: 'right', v: c => `<button class="btn btn-sm" data-client="${c.id}">Fiche</button>` }], DB.clients, { total: 18420 }), '', true);
    },

    // ================= PAIEMENTS =================
    paiements() {
      const os = orders(); const f = F.pay;
      const sum = st => os.filter(o => o.statutPaiement === st).reduce((s, o) => s + o.total, 0);
      const byPay = DB.paiements.map(p => ({ l: p.nom, v: os.filter(o => o.paiement === p.id && o.statutPaiement === 'paye').reduce((s, o) => s + o.total, 0) })).sort((a, b) => b.v - a.v);
      return h('Paiements', 'Transactions, rapprochement et remboursements', `<button class="btn" data-export>${icon('download', 'sm')} Export comptable</button>`) +
        `<div class="kpis">${kpi('Encaissé', fmt(sum('paye')), 'check', os.filter(o => o.statutPaiement === 'paye').length + ' transactions')}${kpi('En attente / initié', fmt(sum('attente') + sum('initie')), 'clock', 'à rapprocher')}${kpi('Échoués', fmt(sum('echoue')), 'x', 'relance client automatique')}${kpi('Remboursés', fmt(sum('rembourse')), 'refresh', 'sur la période')}</div>
        <div class="bo-grid g-2-1">
          ${panel('', `<div class="filters-bar"><select class="select" data-fpay><option value="">Tous les statuts</option>${Object.entries(DB.statutsPaiement).map(([k, s]) => `<option value="${k}" ${f.sp === k ? 'selected' : ''}>${s.l}</option>`).join('')}</select></div>` + table([
            { l: 'Date', v: o => `<span class="nowrap">${fmtDate(o.date)}</span>` }, { l: 'Commande', v: o => `<b>${o.numero}</b>` }, { l: 'Client', v: o => cname(o.client) },
            { l: 'Moyen', v: o => `<span class="row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:${PAY(o.paiement).couleur}"></span>${PAY(o.paiement).nom}</span>` },
            { l: 'Référence', v: o => `<span class="xs muted">${o.refPaiement || '—'}</span>` }, { l: 'Montant', cls: 'right nowrap', v: o => `<b>${fmt(o.total)}</b>` },
            { l: 'Statut', v: o => statusPill('statutsPaiement', o.statutPaiement) }], os.filter(o => !f.sp || o.statutPaiement === f.sp), { href: o => 'commande/' + o.numero }), '', true)}
          ${panel('Encaissements par moyen', BO.hbars(byPay, v => (v / 1000).toFixed(0) + ' k Ar') + `<p class="xs muted" style="margin:14px 0 0">Nouveaux moyens de paiement ajoutables sans modifier le cœur des commandes (couche de paiement modulaire).</p>`)}
        </div>`;
    },

    // ================= LIVRAISONS =================
    livraisons() {
      const os = orders();
      const cols = [['a_preparer', 'À préparer'], ['expediee', 'Expédiée'], ['en_livraison', 'En livraison'], ['livree', 'Livrée'], ['retour', 'Retour']];
      return h('Livraisons', 'Préparation, expédition, suivi et zones tarifaires', `<a class="btn" href="#parametres/livraison">${icon('settings', 'sm')} Règles</a>`) +
        `<div class="kanban">${cols.map(([k, l]) => { const items = os.filter(o => o.statutLivraison === k); return `<div class="kcol"><h4>${l}<span class="badge">${items.length}</span></h4>
          ${items.map(o => `<div class="kcard"><div class="row between"><b>${o.numero.slice(-6)}</b>${statusPill('statutsPaiement', o.statutPaiement)}</div><div class="text-2" style="margin:6px 0">${cname(o.client)} · ${CL(o.client).ville}</div><div class="xs muted">${Z(o.zone).nom} · ${o.lignes.reduce((s, x) => s + x.qte, 0)} art.</div>
            <div class="row between" style="margin-top:8px"><a href="#commande/${o.numero}" class="xs" style="color:var(--primary);font-weight:600">Ouvrir</a>${TRANS_LIV[k][0] && TRANS_LIV[k][0] !== 'annulee' ? `<button class="btn btn-sm btn-soft" data-adv="${o.numero}" data-to="${TRANS_LIV[k][0]}">→ ${DB.statutsLivraison[TRANS_LIV[k][0]].l}</button>` : ''}</div></div>`).join('') || '<p class="xs muted center">Aucune</p>'}</div>`; }).join('')}</div>
        <div style="margin-top:16px">${panel('Zones et tarifs de livraison', `<form id="f-zones">${table([
          { l: 'Zone', v: z => `<b>${z.nom}</b><div class="xs muted">${z.detail}</div>` },
          { l: 'Frais (Ar)', v: z => `<input class="input" style="max-width:140px;min-height:38px" type="number" min="0" step="500" name="frais_${z.id}" value="${z.frais}" inputmode="numeric">` },
          { l: 'Délai', v: z => `<input class="input" style="max-width:160px;min-height:38px" name="delai_${z.id}" value="${esc(z.delai)}">` },
          { l: 'Active', v: z => BO.sw(z.actif, `name="actif_${z.id}"`) }], DB.zones, { foot: false })}</form>
          <div class="table-foot"><button class="btn btn-sm" data-zone-new>${icon('plus', 'sm')} Ajouter une zone</button><button class="btn btn-primary btn-sm" data-save-zones>Enregistrer les tarifs</button></div>`, '<span class="xs muted">Paramétrable sans développement</span>', true)}</div>`;
    },

    // ================= VENDEURS =================
    vendeurs() {
      const pend = DB.vendeurs.filter(v => v.statut === 'en_attente');
      return h('Vendeurs', 'Marketplace multi-vendeurs', `<button class="btn btn-primary" data-invite-vendor>${icon('plus', 'sm')} Inviter un vendeur</button>`) +
        `<div class="kpis">${kpi('Vendeurs actifs', DB.vendeurs.filter(v => v.statut === 'actif').length, 'store', '+ 2 ce mois')}${kpi('Demandes en attente', pend.length, 'clock', 'délai cible : 48 h')}${kpi('Commission moyenne', (DB.vendeurs.reduce((s, v) => s + v.commission, 0) / DB.vendeurs.length).toFixed(1).replace('.', ',') + ' %', 'percent', 'par vente')}${kpi('À reverser', fmt(DB.reversements.filter(r => r.statut === 'a_payer').reduce((s, r) => s + r.brut * (1 - V(r.vendeur).commission / 100), 0)), 'wallet', 'prochain cycle : 1er oct.')}</div>
        ${pend.map(v => `<div class="panel" style="margin-bottom:16px;border-color:#FED7AA"><div class="panel-head" style="background:var(--warning-50)"><h3>${icon('clock', 'sm')} Demande d’ouverture — ${esc(v.nom)}</h3><span class="xs muted">Reçue le 27 sept. 2026</span></div>
          <div class="panel-body"><div class="bo-grid g-1-1"><div class="small"><b>${esc(v.nom)}</b> · ${v.ville} (${v.region})<br>${esc(v.desc)}<br>${v.email} · ${v.tel}<br>NIF ${v.nif} · STAT ${v.stat}</div>
            <div><b class="small">Vérification du dossier</b>${[['CIN du responsable', true], ['Carte fiscale / NIF valide', true], ['Numéro STAT', true], ['Extrait RCS', false], ['Coordonnées de reversement', true]].map(d => `<label class="check" style="margin-top:6px"><input type="checkbox" ${d[1] ? 'checked' : ''}> ${d[0]} ${d[1] ? '' : '<span class="badge badge-danger">Manquant</span>'}</label>`).join('')}</div></div>
            <div class="row wrap" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-vreq="${v.id}">Demander un complément</button><button class="btn btn-danger" data-vrej="${v.id}">Refuser</button><button class="btn btn-primary" data-vok="${v.id}">${icon('check', 'sm')} Approuver</button></div></div></div>`).join('')}` +
        panel('Tous les vendeurs', table([
          { l: 'Vendeur', v: v => `<div class="row" style="--h:${v.hue}"><div class="v-avatar" style="width:38px;height:38px;border-radius:11px;font-size:.8rem;border-width:0">${App.initials(v.nom)}</div><div><b>${esc(v.nom)}</b> ${v.verifie ? `<span class="verified">${icon('shield')}</span>` : ''}<div class="xs muted">${v.ville}</div></div></div>` },
          { l: 'Catégorie', v: v => C(v.cat).nom.split(' & ')[0] }, { l: 'Produits', cls: 'right', v: v => DB.produits.filter(p => p.vendeur === v.id).length },
          { l: 'Ventes', cls: 'right', v: v => fmtN(v.ventes) }, { l: 'Note', cls: 'right', v: v => v.note ? v.note + ' ★' : '—' }, { l: 'Commission', cls: 'right', v: v => v.commission + ' %' },
          { l: 'Statut', v: v => ({ actif: '<span class="badge badge-success">Actif</span>', en_attente: '<span class="badge badge-warning">En attente</span>', suspendu: '<span class="badge badge-danger">Suspendu</span>', refuse: '<span class="badge">Refusé</span>' })[v.statut] }], DB.vendeurs, { href: v => 'vendeur/' + v.id }), '', true);
    },
    vendeur(id) {
      const v = V(id); if (!v) return h('Vendeur introuvable');
      const prods = DB.produits.filter(p => p.vendeur === id);
      return h(esc(v.nom), `${v.ville}, ${v.region} · membre depuis ${v.depuis}`, `<a class="btn" href="../boutique.html?id=${v.id}" target="_blank">${icon('eye', 'sm')} Voir la boutique</a>${v.statut === 'actif' ? `<button class="btn btn-danger" data-vsusp="${v.id}">Suspendre</button>` : v.statut === 'suspendu' ? `<button class="btn btn-primary" data-vok="${v.id}">Réactiver</button>` : ''}`, `<a href="#vendeurs">Vendeurs</a>${icon('chevron-right', 'sm')}<span>${esc(v.nom)}</span>`) +
        `<div class="kpis">${kpi('Ventes totales', fmtN(v.ventes), 'package')}${kpi('Note moyenne', v.note ? v.note + ' / 5' : '—', 'star', v.avis + ' avis')}${kpi('Produits', prods.length, 'box', prods.filter(p => dispo(p) <= p.seuil).length + ' en alerte')}${kpi('Taux de litige', '0,8 %', 'shield', 'objectif < 2 %')}</div>
        <div class="bo-grid g-1-2">
          <div class="stack">${panel('Informations légales', `<table class="spec-table"><tbody><tr><td>E-mail</td><td>${v.email}</td></tr><tr><td>Téléphone</td><td>${v.tel}</td></tr><tr><td>NIF</td><td>${v.nif}</td></tr><tr><td>STAT</td><td>${v.stat}</td></tr><tr><td>Vérifié</td><td>${v.verifie ? 'Oui' : 'Non'}</td></tr></tbody></table>`)}
            ${panel('Commission', `<form id="f-com" novalidate>${field('Taux de commission (%)', 'com', v.commission, { type: 'number', rule: 'req', attrs: 'min="0" max="30" step="0.5"', hint: 'Entre 0 et 30 %. S’applique aux nouvelles commandes uniquement.' })}<button class="btn btn-primary btn-sm" style="margin-top:10px" data-save-com="${v.id}">Enregistrer</button></form>`)}</div>
          <div class="stack">${panel('Produits du vendeur', table([{ l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<b class="small">${esc(p.nom)}</b></div>` }, { l: 'Prix', cls: 'right nowrap', v: p => fmt(App.unitPrice(p)) }, { l: 'Dispo', cls: 'right', v: p => dispo(p) + ' ' + pillStock(p) }], prods, { href: p => 'produit/' + p.id, foot: false }), '', true)}
            ${panel('Reversements', table([{ l: 'Réf.', v: r => r.id }, { l: 'Période', v: r => r.periode }, { l: 'Net', cls: 'right nowrap', v: r => fmt(r.brut * (1 - v.commission / 100)) }, { l: 'Statut', v: r => r.statut === 'paye' ? '<span class="badge badge-success">Payé</span>' : '<span class="badge badge-warning">À payer</span>' }], DB.reversements.filter(r => r.vendeur === id), { foot: false, empty: 'Aucun reversement' }), '', true)}</div>
        </div>`;
    },
    reversements() {
      const rows = DB.reversements.map(r => { const com = Math.round(r.brut * V(r.vendeur).commission / 100); return { ...r, com, net: r.brut - com }; });
      return h('Reversements vendeurs', 'Cycle de 15 jours · ventes livrées moins la commission', `<button class="btn" data-export>${icon('download', 'sm')} Export comptable</button>`) +
        `<div class="kpis">${kpi('À payer', fmt(rows.filter(r => r.statut === 'a_payer').reduce((s, r) => s + r.net, 0)), 'clock', rows.filter(r => r.statut === 'a_payer').length + ' vendeurs')}${kpi('Payé ce mois', fmt(rows.filter(r => r.statut === 'paye').reduce((s, r) => s + r.net, 0)), 'check')}${kpi('Commissions du mois', fmt(rows.reduce((s, r) => s + r.com, 0)), 'percent', 'revenu marketplace')}${kpi('Prochain cycle', '1er oct.', 'refresh', 'période 16–30 sept.')}</div>` +
        panel('', table([
          { l: 'Référence', v: r => `<b>${r.id}</b>` }, { l: 'Vendeur', v: r => esc(V(r.vendeur).nom) }, { l: 'Période', v: r => r.periode },
          { l: 'Ventes brutes', cls: 'right nowrap', v: r => fmt(r.brut) }, { l: 'Commission', cls: 'right nowrap', v: r => '− ' + fmt(r.com) }, { l: 'Net à verser', cls: 'right nowrap', v: r => `<b>${fmt(r.net)}</b>` },
          { l: 'Moyen', v: r => r.moyen }, { l: 'Statut', v: r => r.statut === 'paye' ? `<span class="badge badge-success">Payé le ${fmtDate(r.date)}</span>` : '<span class="badge badge-warning">À payer</span>' },
          { l: '', cls: 'right', v: r => r.statut === 'a_payer' ? `<button class="btn btn-sm btn-primary" data-rv="${r.id}">Marquer payé</button>` : '' }], rows, { foot: false }), '', true);
    },

    // ================= AVIS =================
    avis() {
      const l = DB.avis.filter(a => a.statut === F.avis);
      const tabs = [['en_attente', 'À modérer'], ['publie', 'Publiés'], ['rejete', 'Rejetés']];
      return h('Avis clients', 'Modération avant publication') +
        `<div class="tabs" style="margin-bottom:16px">${tabs.map(t => `<button class="${F.avis === t[0] ? 'on' : ''}" data-avtab="${t[0]}">${t[1]} (${DB.avis.filter(a => a.statut === t[0]).length})</button>`).join('')}</div>` +
        (l.length ? l.map(a => { const p = P(a.produit); const sus = /\d{2}\s?\d{3}|contactez|prix moins/i.test(a.texte) || !a.achat; return `<div class="panel" style="margin-bottom:12px"><div class="panel-body row" style="align-items:flex-start;gap:14px">
          <div style="width:56px;flex:none">${pv(p, 'sm')}</div>
          <div class="grow"><div class="row between wrap"><b class="small">${esc(p.nom)}</b><span class="xs muted">${fmtDate(a.date)}</span></div>
            <div class="row" style="gap:8px;margin:4px 0"><span class="stars">${App.stars(a.note)}</span><span class="small">${esc(a.client)}</span>${a.achat ? '<span class="badge badge-success">Achat vérifié</span>' : '<span class="badge badge-danger">Aucun achat</span>'}${sus ? '<span class="badge badge-danger">⚠ Contenu suspect</span>' : ''}</div>
            <p class="small text-2" style="margin:0">${esc(a.texte)}</p></div>
          ${a.statut === 'en_attente' ? `<div class="row" style="gap:6px;flex:none"><button class="btn btn-sm btn-danger" data-avis="${a.id}" data-to="rejete">Rejeter</button><button class="btn btn-sm btn-primary" data-avis="${a.id}" data-to="publie">Publier</button></div>` : ''}</div></div>`; }).join('') : `<div class="panel denied">${icon('check')}<h3>Rien à modérer</h3></div>`);
    },

    // ================= UTILISATEURS & RÔLES =================
    utilisateurs() {
      const mods = [['dashboard', 'Tableau de bord'], ['commandes', 'Commandes'], ['clients', 'Clients'], ['produits', 'Produits'], ['categories', 'Catégories'], ['promotions', 'Promotions'], ['stock', 'Stock'], ['paiements', 'Paiements'], ['livraisons', 'Livraisons'], ['vendeurs', 'Vendeurs'], ['reversements', 'Reversements'], ['avis', 'Avis'], ['rapports', 'Rapports'], ['utilisateurs', 'Utilisateurs'], ['journal', 'Journal'], ['parametres', 'Paramètres']];
      return h('Utilisateurs & rôles', 'Comptes d’administration et permissions', `<button class="btn btn-primary" data-invite>${icon('plus', 'sm')} Inviter un utilisateur</button>`) +
        panel('', table([
          { l: 'Utilisateur', v: u => `<div class="row"><div class="avatar" style="width:36px;height:36px;font-size:.78rem">${App.initials(u.nom)}</div><div><b>${esc(u.nom)}</b><div class="xs muted">${u.email}</div></div></div>` },
          { l: 'Rôle', v: u => `<span class="badge badge-primary">${DB.roles.find(r => r.id === u.role).nom}</span>` },
          { l: 'Double authentification', v: u => u.mfa ? '<span class="badge badge-success">Activée</span>' : '<span class="badge badge-warning">Non activée</span>' },
          { l: 'Dernier accès', v: u => fmtDate(u.dernier) }, { l: 'Statut', v: u => u.statut === 'actif' ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Suspendu</span>' },
          { l: '', cls: 'right', v: u => `<button class="btn btn-sm btn-ghost" data-user="${u.id}">${icon('edit', 'sm')}</button>` }], DB.utilisateurs, { foot: false }), '', true) +
        `<div style="margin-top:16px">${panel('Matrice des permissions', `<div class="table-wrap"><table class="table perm-table"><thead><tr><th>Module</th>${DB.roles.map(r => `<th style="white-space:normal;min-width:100px">${r.nom}</th>`).join('')}</tr></thead><tbody>
          ${mods.map(m => `<tr><td><b class="small">${m[1]}</b></td>${DB.roles.map(r => `<td>${r.modules.includes('*') || r.modules.includes(m[0]) ? `<span class="perm-yes">${icon('check', 'sm')}</span>` : '<span class="perm-no">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
          <div class="table-foot"><span>Astuce : utilisez le sélecteur « Rôle » en haut de page pour simuler la vue de chaque profil.</span></div>`, '', true)}</div>`;
    },

    // ================= RAPPORTS =================
    rapports() {
      const os = orders().filter(o => o.statutPaiement === 'paye');
      const byZone = DB.zones.map(z => ({ l: z.nom, v: orders().filter(o => o.zone === z.id).length }));
      const byVend = DB.vendeurs.filter(v => v.statut === 'actif').map(v => ({ l: v.nom, v: DB.produits.filter(p => p.vendeur === v.id).reduce((s, p) => s + p.ventes * App.unitPrice(p), 0) / 12 })).sort((a, b) => b.v - a.v);
      const byCat = DB.categories.map(c => ({ l: c.nom, v: DB.produits.filter(p => p.cat === c.id).reduce((s, p) => s + p.ventes, 0) })).sort((a, b) => b.v - a.v);
      const M = v => (v / 1e6).toFixed(1).replace('.', ',') + ' M Ar';
      return h('Rapports & statistiques', 'Pilotage de l’activité', `<select class="select" style="width:auto;min-height:40px"><option>Septembre 2026</option><option>Août 2026</option><option>T3 2026</option><option>Année 2026</option></select><button class="btn" data-export>${icon('download', 'sm')} Excel</button><button class="btn" data-export>${icon('file', 'sm')} PDF</button>`) +
        `<div class="kpis five">${kpi('Chiffre d’affaires', M(DB.ventes30.reduce((s, d) => s + d.ca, 0)), 'wallet', '', 14)}${kpi('Commandes', fmtN(DB.ventes30.reduce((s, d) => s + d.commandes, 0)), 'package', '', 9)}${kpi('Clients actifs', '2 318', 'users', '', 11)}${kpi('Taux de conversion', '2,4 %', 'chart', '', 0.3)}${kpi('Taux d’annulation', '3,1 %', 'x', '', -0.6)}</div>
        ${panel('Évolution du chiffre d’affaires', BO.lineChart('ch-rep', BO.days(30), { label: 'Chiffre d’affaires quotidien' }))}
        <div class="bo-grid g-1-1" style="margin-top:16px">${panel('CA par vendeur', BO.hbars(byVend, M))}${panel('Articles vendus par catégorie', BO.hbars(byCat, fmtN))}</div>
        <div class="bo-grid g-1-1" style="margin-top:16px">${panel('Commandes par zone de livraison', BO.hbars(byZone, v => v + ' cmd'))}${panel('Produits les plus vendus', table([{ l: 'Produit', v: p => `<div class="cell-prod">${pv(p, 'sm')}<b class="small">${esc(p.nom)}</b></div>` }, { l: 'Vendeur', v: p => esc(V(p.vendeur).nom) }, { l: 'Ventes', cls: 'right', v: p => fmtN(p.ventes) }], [...DB.produits].sort((a, b) => b.ventes - a.ventes).slice(0, 6), { href: p => 'produit/' + p.id, foot: false }), '', true)}</div>`;
    },

    journal() {
      const types = [...new Set(DB.journal.map(j => j[2]))];
      const l = DB.journal.filter(j => !F.journal || j[2] === F.journal);
      return h('Journal d’activité', 'Traçabilité des actions sensibles (conservation 12 mois)', `<button class="btn" data-export>${icon('download', 'sm')} Exporter</button>`) +
        panel('', `<div class="filters-bar"><select class="select" data-fj><option value="">Tous les types</option>${types.map(t => `<option ${F.journal === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>` + table([
          { l: 'Date', v: j => `<span class="nowrap">${fmtDate(j[0])}</span>` }, { l: 'Utilisateur', v: j => `<b>${esc(j[1])}</b>` },
          { l: 'Type', v: j => `<span class="badge ${j[2] === 'Sécurité' ? 'badge-danger' : j[2] === 'Paiement' ? 'badge-success' : 'badge-info'}">${j[2]}</span>` },
          { l: 'Action', v: j => esc(j[3]) }, { l: 'Adresse IP', v: j => `<span class="xs muted">${j[4]}</span>` }], l, { total: 12480 }), '', true);
    },

    // ================= PARAMÈTRES =================
    parametres(tab) {
      tab = tab || 'general';
      const tabs = [['general', 'Général'], ['paiements', 'Paiements'], ['stock', 'Stock & commandes'], ['livraison', 'Livraison'], ['notifications', 'Notifications'], ['securite', 'Sécurité'], ['sauvegardes', 'Sauvegardes']];
      const reg = store.get('regleStock', 'paiement');
      const body = {
        general: panel('Informations du site', `<form class="form-grid two" id="f-set" novalidate>${field('Nom du site', 'nom', 'Site E_commerce', { rule: 'req' })}${field('E-mail de contact', 'email', 'contact@site-ecommerce.mg', { rule: 'req email', type: 'email' })}${field('Téléphone', 'tel', '+261 34 00 000 00', { rule: 'req tel' })}${field('WhatsApp', 'wa', '+261 34 00 000 00', { rule: 'tel' })}${field('Devise', 'dev', 'MGA', { type: 'select', options: [['MGA', 'Ariary (MGA)']] })}${field('Fuseau horaire', 'tz', 'Indian/Antananarivo', { type: 'select', options: ['Indian/Antananarivo'] })}${field('Adresse', 'adr', 'Analakely, Antananarivo 101', { cls: 'span-2' })}${field('Titre SEO de la page d’accueil', 'seo', 'Site E_commerce — La marketplace de Madagascar', { cls: 'span-2' })}</form><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" data-save-set>Enregistrer</button></div>`),
        paiements: panel('Moyens de paiement', table([
          { l: 'Moyen', v: p => `<div class="row"><span class="oc-logo" style="width:40px;height:32px;border-radius:8px;display:grid;place-items:center;background:${p.couleur};color:#fff;font-size:.62rem;font-weight:800">${p.logo}</span><div><b>${p.nom}</b><div class="xs muted">${p.detail}</div></div></div>` },
          { l: 'Configuration', v: p => p.mm || p.id === 'carte' ? `<span class="xs muted">Clé API : <code>${p.id.toUpperCase()}_API_KEY</code> (variable d’environnement serveur)</span>` : '<span class="xs muted">Aucune API requise</span>' },
          { l: 'Mode', v: p => p.mm || p.id === 'carte' ? '<span class="badge badge-warning">Test / sandbox</span>' : '—' },
          { l: 'Actif', v: p => BO.sw(p.actif) }], DB.paiements, { foot: false }) + `<div class="table-foot"><span>${icon('lock', 'sm')} Les clés et secrets ne sont jamais saisis ni affichés dans l’interface : ils sont stockés en variables d’environnement.</span></div>`, '', true),
        stock: panel('Règles de stock et de commande', `<div class="stack">
          <label class="option-card ${reg === 'paiement' ? 'selected' : ''}"><input type="radio" name="reg" value="paiement" ${reg === 'paiement' ? 'checked' : ''}><div><b>Réserver à la commande, décrémenter après paiement confirmé</b><div class="small muted">Recommandé pour Mobile Money et virement. La réservation expire après 24 h sans paiement.</div></div></label>
          <label class="option-card ${reg === 'commande' ? 'selected' : ''}"><input type="radio" name="reg" value="commande" ${reg === 'commande' ? 'checked' : ''}><div><b>Décrémenter immédiatement à la commande</b><div class="small muted">Stock remis en vente si la commande est annulée.</div></div></label>
          <div class="form-grid two">${field('Délai d’expiration d’une commande non payée (h)', 'exp', 24, { type: 'number' })}${field('Plafond paiement à la livraison (Ar)', 'cod', 1000000, { type: 'number' })}${field('Délai d’annulation client', 'ann', 'Jusqu’à l’expédition', { type: 'select', options: ['Jusqu’à l’expédition', 'Dans l’heure suivant la commande', 'Jamais (service client uniquement)'] })}${field('Délai de retour (jours)', 'ret', 7, { type: 'number' })}</div>
          <label class="check"><input type="checkbox" checked> Bloquer toute commande dont le stock disponible est insuffisant</label>
          <label class="check"><input type="checkbox"> Activer la gestion multi-dépôts (évolution)</label>
          <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" data-save-reg>Enregistrer</button></div></div>`),
        livraison: panel('Règles de livraison', `<div class="stack"><label class="check"><input type="checkbox" checked> Un seul frais de livraison par commande (colis multi-vendeurs regroupés)</label><label class="check"><input type="checkbox" checked> Retrait au point relais Analakely</label><label class="check"><input type="checkbox"> Livraison offerte au-delà d’un montant</label><label class="check"><input type="checkbox"> Intégration transporteur externe (API — évolution)</label><p class="small muted">Les zones et tarifs se gèrent dans le module <a href="#livraisons" style="color:var(--primary);font-weight:600">Livraisons</a>.</p></div>`),
        notifications: panel('Modèles de notifications', table([
          { l: 'Événement', v: n => `<b>${n[0]}</b><div class="xs muted">${n[1]}</div>` }, { l: 'E-mail', v: n => BO.sw(n[2]) }, { l: 'SMS', v: n => BO.sw(n[3]) }, { l: 'WhatsApp', v: n => BO.sw(n[4]) },
          { l: '', cls: 'right', v: n => `<button class="btn btn-sm btn-ghost" data-tpl="${esc(n[0])}">${icon('edit', 'sm')} Modèle</button>` }], [
          ['Confirmation de commande', 'Client', 1, 1, 0], ['Confirmation de paiement', 'Client', 1, 1, 0], ['Changement de statut', 'Client', 1, 0, 1], ['Expédition / mise en livraison', 'Client', 1, 1, 1], ['Livraison effectuée', 'Client', 1, 1, 0], ['Nouvelle commande', 'Vendeur', 1, 1, 1], ['Alerte stock faible', 'Admin + vendeur', 1, 0, 0], ['Échec de paiement', 'Client', 1, 1, 0]], { foot: false }), '', true),
        securite: panel('Sécurité', `<div class="stack">${[['HTTPS obligatoire (redirection automatique)', true, true], ['Double authentification obligatoire pour les administrateurs', true], ['Blocage 15 min après 5 tentatives de connexion échouées', true], ['Limitation de débit de l’API (anti-abus)', true], ['Déconnexion automatique après 30 min d’inactivité', true], ['Journalisation des actions sensibles', true, true]].map(s => `<div class="row between"><span class="small">${s[0]}</span>${BO.sw(s[1], s[2] ? 'disabled' : '')}</div>`).join('')}
          <div class="alert alert-info">${icon('shield')}<span class="small">Mots de passe hachés (Argon2id / bcrypt). Protection CSRF, validation des entrées côté client et serveur, requêtes paramétrées contre les injections SQL.</span></div></div>`),
        sauvegardes: panel('Sauvegardes & restauration', `<div class="kpis" style="margin-bottom:0">${kpi('Dernière sauvegarde', '28/09 · 03:00', 'check', 'PostgreSQL + fichiers')}${kpi('Fréquence', 'Quotidienne', 'clock', 'rétention 30 jours')}${kpi('Dernier test de restauration', '15/09/2026', 'refresh', 'réussi en 11 min')}${kpi('Stockage', 'Hors site', 'globe', 'chiffré AES-256')}</div>
          <div class="row wrap" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-backup-test>Lancer un test de restauration (staging)</button><button class="btn btn-primary" data-backup>Sauvegarder maintenant</button></div>`) +
          `<div style="margin-top:16px">${panel('Données de démonstration', `<p class="small text-2" style="margin-top:0">Efface ce qui a été enregistré dans ce navigateur pendant la démonstration : panier, commandes passées sur le site, adresses, favoris, rôle simulé.</p><button class="btn btn-danger" data-reset-demo>${icon('refresh', 'sm')} Réinitialiser les données de démonstration</button>`)}</div>`
      }[tab];
      return h('Paramètres', 'Configuration de la plateforme') + `<div class="tabs" style="margin-bottom:16px">${tabs.map(t => `<a href="#parametres/${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</a>`).join('')}</div>` + body;
    }
  };

  // ---------- Interactions ----------
  function setOrderLiv(o, to) {
    if (to === 'expediee' && !['paye'].includes(o.statutPaiement) && o.paiement !== 'cod') {
      modal({ title: 'Expédition impossible', tone: 'danger', body: `<p>Le paiement de <b>${o.numero}</b> n’est pas confirmé (${DB.statutsPaiement[o.statutPaiement].l}). Seules les commandes payées ou en paiement à la livraison peuvent être expédiées.</p>`, actions: [{ label: 'Compris', cls: 'btn-primary' }] });
      return false;
    }
    o.statutLivraison = to;
    o.historique = o.historique.concat([{ date: now(), statut: 'Statut livraison : ' + DB.statutsLivraison[to].l, par: me().nom }]);
    if (to === 'annulee') o.statutPaiement = o.statutPaiement === 'paye' ? 'rembourse' : 'annule';
    saveOrder(o); log('Livraison', o.numero + ' → ' + DB.statutsLivraison[to].l);
    toast(o.numero + ' : ' + DB.statutsLivraison[to].l + ' · client notifié par SMS');
    return true;
  }

  function clientModal(id) {
    const c = CL(id); const os = orders().filter(o => o.client === id);
    modal({ title: esc(c.prenom + ' ' + c.nom), noIcon: true, wide: true,
      body: `<div class="kpis" style="grid-template-columns:repeat(3,1fr)">${kpi('Commandes', os.length, 'package')}${kpi('Total payé', fmt(os.filter(o => o.statutPaiement === 'paye').reduce((s, o) => s + o.total, 0)), 'wallet')}${kpi('Client depuis', fmtDate(c.inscrit), 'user')}</div>
        <p class="small">${esc(c.email)} · ${c.tel} · ${c.ville}</p>${table([{ l: 'Commande', v: o => `<a href="#commande/${o.numero}" data-close style="color:var(--primary);font-weight:600">${o.numero}</a>` }, { l: 'Date', v: o => fmtDate(o.date.split(' ')[0]) }, { l: 'Total', cls: 'right', v: o => fmt(o.total) }, { l: 'Statut', v: o => statusPill('statutsLivraison', o.statutLivraison) }], os, { foot: false })}`,
      actions: [{ label: c.statut === 'actif' ? 'Bloquer le compte' : 'Débloquer', cls: c.statut === 'actif' ? 'btn-danger' : 'btn-primary', onClick() { c.statut = c.statut === 'actif' ? 'bloque' : 'actif'; log('Client', 'Compte ' + c.email + ' : ' + c.statut); BO.refresh(); toast('Compte ' + (c.statut === 'actif' ? 'débloqué' : 'bloqué')); } }, { label: 'Fermer' }] });
  }

  function updateBulk() {
    const n = document.querySelectorAll('[data-sel]:checked').length; const b = document.getElementById('bulk'); if (!b) return;
    b.classList.toggle('show', n > 0); document.getElementById('bulk-n').textContent = n + ' commande(s) sélectionnée(s)';
  }
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.hasAttribute('data-selall')) { document.querySelectorAll('[data-sel]').forEach(c => { c.checked = t.checked; }); updateBulk(); return; }
    if (t.hasAttribute('data-sel')) { updateBulk(); return; }
    if (t.dataset.fc) { F.cmd[t.dataset.fc] = t.value.trim(); BO.refresh(); }
    if (t.dataset.fp) { F.prod[t.dataset.fp] = t.value.trim(); BO.refresh(); }
    if (t.hasAttribute('data-fpay')) { F.pay.sp = t.value; BO.refresh(); }
    if (t.hasAttribute('data-fj')) { F.journal = t.value; BO.refresh(); }
    if (t.dataset.toggleProd) { const p = P(t.dataset.toggleProd); p.actif = t.checked; log('Produit', p.nom + (p.actif ? ' activé' : ' désactivé')); toast(p.nom + (p.actif ? ' publié' : ' masqué du site')); }
    if (t.dataset.togglePromo) { const p = DB.promos.find(x => x.code === t.dataset.togglePromo); p.actif = t.checked; BO.refresh(); }
    if (t.name === 'cat' && t.closest('#f-prod')) { const s = t.form.sous; s.innerHTML = '<option value="">Choisir…</option>' + (C(t.value) || { sous: [] }).sous.map(x => `<option>${x}</option>`).join(''); }
    if (t.name === 'reg') { document.querySelectorAll('[name=reg]').forEach(r => r.closest('.option-card').classList.toggle('selected', r.checked)); }
  });
  document.addEventListener('input', e => {
    const f = e.target.closest('#f-prod'); if (!f) return;
    if (e.target.name === 'nom' && !f.dataset.slugTouched && f.slug) f.slug.value = e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (e.target.name === 'slug') f.dataset.slugTouched = 1;
    seoPreview();
  });
  function seoPreview() {
    const f = document.getElementById('f-prod'); if (!f) return;
    ['seoT', 'seoD'].forEach(n => { const c = document.querySelector(`[data-c="${n}"]`); if (c) c.textContent = f[n].value.length; });
    document.getElementById('seo-prev').innerHTML = `<div class="u">site-ecommerce.mg › produit › ${esc(f.slug.value || '…')}</div><div class="t">${esc(f.seoT.value || f.nom.value || 'Titre du produit')}</div><div class="d">${esc(f.seoD.value || 'Méta description…')}</div>`;
  }

  document.addEventListener('click', e => {
    const q = s => e.target.closest(s);
    if (q('[data-period]')) { F.period = +q('[data-period]').dataset.period; BO.refresh(); }
    if (q('[data-tabsl]')) { F.cmd.sl = q('[data-tabsl]').dataset.tabsl; BO.refresh(); }
    if (q('[data-bulk]')) {
      const act = q('[data-bulk]').dataset.bulk; const nums = [...document.querySelectorAll('[data-sel]:checked')].map(c => c.dataset.sel);
      if (act === 'clear') { document.querySelectorAll('[data-sel], [data-selall]').forEach(c => { c.checked = false; }); updateBulk(); }
      if (act === 'print') toast(nums.length + ' bon(s) de préparation générés (PDF).');
      if (act === 'expediee') {
        const list = nums.map(findOrder);
        const ok = list.filter(o => o.statutLivraison === 'a_preparer' && (o.statutPaiement === 'paye' || o.paiement === 'cod'));
        const ko = list.filter(o => !ok.includes(o));
        confirmBox('Marquer ' + ok.length + ' commande(s) comme expédiée(s) ?',
          (ok.length ? `<p>${ok.map(o => '<b>' + o.numero + '</b>').join(', ')}. Les clients seront notifiés par SMS.</p>` : '<p>Aucune commande éligible.</p>') +
          (ko.length ? `<div class="alert alert-warning">${icon('alert')}<span>${ko.length} commande(s) ignorée(s) : paiement non confirmé ou déjà expédiée (${ko.map(o => o.numero.slice(-6)).join(', ')}).</span></div>` : ''),
          () => { if (!ok.length) return; ok.forEach(o => setOrderLiv(o, 'expediee')); BO.refresh(); });
      }
    }
    if (q('[data-reset-demo]')) confirmBox('Réinitialiser les données de démonstration ?', '<p>Le panier, les commandes passées, les adresses, les favoris et les préférences enregistrés dans ce navigateur seront effacés.</p>', () => { try { Object.keys(localStorage).filter(k => k.startsWith('sec_')).forEach(k => localStorage.removeItem(k)); } catch (err) { /* stockage indisponible */ } toast('Données de démonstration réinitialisées'); setTimeout(() => location.reload(), 600); }, { yes: 'Réinitialiser', yesCls: 'btn-danger', tone: 'danger' });
    if (q('[data-freset]')) { const k = q('[data-freset]').dataset.freset; Object.keys(F[k]).forEach(x => F[k][x] = ''); BO.refresh(); }
    if (q('[data-export]')) toast('Export généré — le fichier sera téléchargé (maquette).');
    if (q('[data-client]')) clientModal(q('[data-client]').dataset.client);

    // Commande : livraison / paiement / note
    if (q('[data-liv]')) { const o = findOrder(location.hash.split('/')[1]); const to = document.getElementById('next-liv').value;
      confirmBox('Passer en « ' + DB.statutsLivraison[to].l + ' » ?', `<p>Commande <b>${o.numero}</b>. Le client sera notifié.</p>`, () => { if (setOrderLiv(o, to)) BO.refresh(); }); }
    if (q('[data-adv]')) { const b = q('[data-adv]'); const o = findOrder(b.dataset.adv); if (setOrderLiv(o, b.dataset.to)) BO.refresh(); }
    if (q('[data-pay]')) {
      const to = q('[data-pay]').dataset.pay; const o = findOrder(location.hash.split('/')[1]);
      if (to === 'paye') modal({ title: 'Confirmer la réception du paiement', tone: 'success', icon: 'check',
        body: `<p>Montant attendu : <b>${fmt(o.total)}</b> (${PAY(o.paiement).nom}).</p><div class="field"><label>Référence de la transaction / du virement <span class="req">*</span></label><input class="input" id="ref"><span class="err">La référence est obligatoire pour le rapprochement.</span></div><div class="field" style="margin-top:10px"><label>Montant reçu (Ar) <span class="req">*</span></label><input class="input" id="mt" type="number" value="${o.total}"><span class="err"></span></div>`,
        actions: [{ label: 'Annuler' }, { label: 'Confirmer', cls: 'btn-primary', onClick(bd) {
          const r = bd.querySelector('#ref'); const m = bd.querySelector('#mt'); let ok = true;
          r.closest('.field').classList.toggle('error', !r.value.trim()); if (!r.value.trim()) ok = false;
          const mf = m.closest('.field'); if (+m.value !== o.total) { mf.classList.add('error'); mf.querySelector('.err').textContent = 'Le montant reçu (' + fmt(+m.value || 0) + ') ne correspond pas au total de la commande. Vérifiez avant de confirmer.'; ok = false; } else mf.classList.remove('error');
          if (!ok) return false;
          o.statutPaiement = 'paye'; o.refPaiement = r.value.trim(); o.historique = o.historique.concat([{ date: now(), statut: 'Paiement confirmé (réf. ' + o.refPaiement + ')', par: me().nom }]);
          saveOrder(o); log('Paiement', o.numero + ' payé, réf. ' + o.refPaiement); BO.refresh(); toast('Paiement confirmé · client et vendeurs notifiés'); } }] });
      if (to === 'rembourse') modal({ title: 'Rembourser la commande', tone: 'danger', icon: 'refresh',
        body: `<div class="field"><label>Montant à rembourser (Ar) <span class="req">*</span></label><input class="input" id="mt" type="number" value="${o.total}" max="${o.total}"><span class="err"></span></div><div class="field" style="margin-top:10px"><label>Motif <span class="req">*</span></label><select class="select" id="mo"><option value="">Choisir…</option><option>Retour produit</option><option>Annulation client</option><option>Produit indisponible</option><option>Geste commercial</option></select><span class="err">Motif obligatoire.</span></div><p class="xs muted">Remboursement via ${PAY(o.paiement).nom}. Action journalisée.</p>`,
        actions: [{ label: 'Annuler' }, { label: 'Rembourser', cls: 'btn-danger', onClick(bd) {
          const m = bd.querySelector('#mt'); const mo = bd.querySelector('#mo'); const mf = m.closest('.field'); let ok = true;
          if (!(+m.value > 0 && +m.value <= o.total)) { mf.classList.add('error'); mf.querySelector('.err').textContent = 'Montant entre 1 et ' + fmt(o.total) + '.'; ok = false; } else mf.classList.remove('error');
          mo.closest('.field').classList.toggle('error', !mo.value); if (!mo.value) ok = false; if (!ok) return false;
          o.statutPaiement = 'rembourse'; o.historique = o.historique.concat([{ date: now(), statut: 'Remboursement ' + fmt(+m.value) + ' (' + mo.value + ')', par: me().nom }]);
          saveOrder(o); log('Paiement', 'Remboursement ' + o.numero + ' : ' + fmt(+m.value)); BO.refresh(); toast('Remboursement enregistré'); } }] });
      if (to === 'echoue' || to === 'annule') confirmBox(to === 'echoue' ? 'Marquer le paiement comme échoué ?' : 'Annuler la commande ?', '<p>Le client sera notifié et le stock réservé sera libéré.</p>', () => {
        o.statutPaiement = to; if (to === 'annule') o.statutLivraison = 'annulee'; o.historique = o.historique.concat([{ date: now(), statut: to === 'echoue' ? 'Paiement échoué' : 'Commande annulée', par: me().nom }]); saveOrder(o); BO.refresh(); }, { yesCls: 'btn-danger', tone: 'danger' });
    }
    if (q('[data-note]')) { const i = document.getElementById('note-int'); if (!i.value.trim()) { toast('Saisissez une note.', 'error'); return; } const o = findOrder(location.hash.split('/')[1]); o.historique = o.historique.concat([{ date: now(), statut: 'Note interne : ' + i.value.trim(), par: me().nom }]); saveOrder(o); BO.refresh(); }
    if (q('[data-notify-client]')) modal({ title: 'Notifier le client', tone: 'info', icon: 'message', body: `<div class="field"><label>Canal</label><select class="select"><option>SMS</option><option>E-mail</option><option>WhatsApp</option></select></div><div class="field" style="margin-top:10px"><label>Message</label><textarea class="textarea">Bonjour, votre commande est en cours de traitement. Merci pour votre confiance ! — Site E_commerce</textarea></div>`, actions: [{ label: 'Annuler' }, { label: 'Envoyer', cls: 'btn-primary', onClick: () => toast('Notification envoyée') }] });

    // Produit
    if (q('[data-addvar]')) document.getElementById('vars').insertAdjacentHTML('beforeend', `<div class="form-grid two" style="margin-bottom:10px"><div class="field"><label>Option</label><input class="input" name="vk" placeholder="Taille, Couleur…"></div><div class="field"><label>Valeurs (séparées par des virgules)</label><input class="input" name="vv" placeholder="S, M, L"></div></div>`);
    if (q('[data-upload]')) toast('Sélection de fichiers (maquette) — conversion WebP et lazy loading en production.');
    if (q('[data-save-prod]')) {
      const f = document.getElementById('f-prod'); const id = q('[data-save-prod]').dataset.saveProd;
      let ok = validate(f);
      const fe = (n, msg) => { const fl = f[n].closest('.field'); fl.classList.add('error'); fl.querySelector('.err').textContent = msg; ok = false; };
      const prix = +f.prix.value, promo = f.promo.value === '' ? null : +f.promo.value, stock = +f.stock.value, seuil = +f.seuil.value;
      if (f.prix.value && (!Number.isInteger(prix) || prix < 100)) fe('prix', 'Prix entier ≥ 100 Ar.');
      if (promo != null && (!Number.isInteger(promo) || promo <= 0 || promo >= prix)) fe('promo', 'Le prix promotionnel doit être un entier positif, strictement inférieur au prix de vente (' + fmt(prix || 0) + ').');
      if (promo != null && f.pd.value && f.pf.value && f.pf.value < f.pd.value) fe('pf', 'La date de fin doit être postérieure au début.');
      if (f.stock.value !== '' && (!Number.isInteger(stock) || stock < 0)) fe('stock', 'Nombre entier positif.');
      if (id !== 'new' && Number.isInteger(stock) && stock < (P(id).reserve || 0)) fe('stock', 'Le stock ne peut pas être inférieur aux unités réservées (' + P(id).reserve + ').');
      if (f.seuil.value !== '' && (!Number.isInteger(seuil) || seuil < 0)) fe('seuil', 'Nombre entier positif.');
      if (f.slug.value && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug.value)) fe('slug', 'Format invalide (ex. vanille-bourbon-100g).');
      if (f.sku.value && DB.produits.some(p => p.sku === f.sku.value.trim() && p.id !== id)) fe('sku', 'Ce SKU existe déjà.');
      const vk = [...f.querySelectorAll('[name=vk]')], vv = [...f.querySelectorAll('[name=vv]')];
      vk.forEach((k, i) => { if (k.value.trim() && !vv[i].value.trim()) { vv[i].closest('.field').classList.add('error'); ok = false; toast('Indiquez les valeurs de l’option « ' + k.value + ' ».', 'error'); } });
      if (!ok) { toast('Corrigez les champs en erreur avant d’enregistrer.', 'error'); return; }
      const d = { nom: f.nom.value.trim(), sku: f.sku.value.trim(), vendeur: f.vendeur.value, cat: f.cat.value, sous: f.sous.value, desc: f.desc.value.trim(), prix, promo, stock, seuil, slug: f.slug.value, actif: f.actif.checked };
      const vars = {}; vk.forEach((k, i) => { if (k.value.trim()) vars[k.value.trim()] = vv[i].value.split(',').map(s => s.trim()).filter(Boolean); });
      d.variantes = Object.keys(vars).length ? vars : null;
      if (id === 'new') { const np = { ...d, id: 'p' + (DB.produits.length + 1), reserve: 0, note: 0, avis: 0, ventes: 0, icon: C(d.cat).icon, badge: 'new' }; DB.produits.push(np); log('Produit', 'Création ' + np.nom); toast('Produit créé'); location.hash = 'produit/' + np.id; }
      else { Object.assign(P(id), d); log('Produit', 'Modification ' + d.nom); toast('Modifications enregistrées'); BO.refresh(); }
    }

    // Catégories & promos
    if (q('[data-cat]')) { const id = q('[data-cat]').dataset.cat; const c = C(id) || { nom: '', id: '', sous: [] };
      modal({ title: id === 'new' ? 'Nouvelle catégorie' : 'Modifier la catégorie', noIcon: true, body: `<form class="form-grid" novalidate>${field('Nom', 'nom', c.nom, { rule: 'req' })}${field('Slug', 'slug', c.id, { rule: 'req' })}${field('Catégorie parente', 'parent', '', { type: 'select', options: [['', 'Aucune (racine)']].concat(DB.categories.map(x => [x.id, x.nom])) })}${field('Sous-catégories', 'sous', c.sous.join(', '), { hint: 'Séparées par des virgules' })}</form>`,
        actions: [{ label: 'Annuler' }, { label: 'Enregistrer', cls: 'btn-primary', onClick(bd) { if (!validate(bd.querySelector('form'))) return false; toast('Catégorie enregistrée'); } }] }); }
    if (q('[data-promo-new]')) modal({ title: 'Nouveau code promo', noIcon: true, wide: true,
      body: `<form class="form-grid two" novalidate>${field('Code', 'code', '', { rule: 'req', attrs: 'style="text-transform:uppercase"', hint: 'Lettres et chiffres, sans espace' })}${field('Type', 'type', 'pourcent', { type: 'select', options: [['pourcent', 'Pourcentage'], ['montant', 'Montant fixe (Ar)']] })}${field('Valeur', 'valeur', '', { type: 'number', rule: 'req' })}${field('Montant minimum (Ar)', 'min', 0, { type: 'number' })}${field('Cible', 'cible', '', { type: 'select', options: [['', 'Tout le site']].concat(DB.categories.map(c => [c.id, 'Catégorie : ' + c.nom])) })}${field('Limite d’utilisations', 'lim', '', { type: 'number', hint: 'Vide = illimité' })}${field('Début', 'debut', '2026-09-28', { type: 'date', rule: 'req' })}${field('Fin', 'fin', '2026-10-31', { type: 'date', rule: 'req' })}</form>`,
      actions: [{ label: 'Annuler' }, { label: 'Créer le code', cls: 'btn-primary', onClick(bd) {
        const f = bd.querySelector('form'); let ok = validate(f); const fe = (n, m) => { const x = f[n].closest('.field'); x.classList.add('error'); x.querySelector('.err').textContent = m; ok = false; };
        const code = f.code.value.trim().toUpperCase(); const v = +f.valeur.value;
        if (code && !/^[A-Z0-9]{4,20}$/.test(code)) fe('code', '4 à 20 lettres ou chiffres.');
        if (code && DB.promos.some(p => p.code === code)) fe('code', 'Ce code existe déjà.');
        if (f.valeur.value && (f.type.value === 'pourcent' ? !(v > 0 && v <= 90) : !(Number.isInteger(v) && v > 0))) fe('valeur', f.type.value === 'pourcent' ? 'Entre 1 et 90 %.' : 'Montant entier positif.');
        if (f.type.value === 'montant' && v >= +f.min.value && +f.min.value > 0) fe('valeur', 'La remise doit être inférieure au montant minimum de commande.');
        if (f.fin.value < f.debut.value) fe('fin', 'La fin doit être après le début.');
        if (!ok) return false;
        DB.promos.unshift({ code, type: f.type.value, valeur: v, min: +f.min.value || 0, cible: f.cible.value ? 'Catégorie : ' + C(f.cible.value).nom : 'Tout le site', cat: f.cible.value || null, debut: f.debut.value, fin: f.fin.value, utilisations: 0, actif: true });
        log('Promotion', 'Création du code ' + code); BO.refresh(); toast('Code ' + code + ' créé'); } }] });

    // Stock
    if (q('[data-mvt]')) { const p = P(q('[data-mvt]').dataset.mvt);
      modal({ title: 'Mouvement de stock', noIcon: true, body: `<p class="small"><b>${esc(p.nom)}</b><br>Physique : ${p.stock} · Réservé : ${p.reserve || 0} · Disponible : <b>${dispo(p)}</b></p><form class="form-grid" novalidate>${field('Type', 'type', 'Entrée', { type: 'select', options: ['Entrée', 'Sortie', 'Ajustement', 'Retour'] })}${field('Quantité', 'qte', '', { type: 'number', rule: 'req', attrs: 'min="1" step="1"', hint: 'Pour un ajustement, indiquez le nouveau stock physique.' })}${field('Référence / motif', 'motif', '', { rule: 'req', hint: 'Ex. bon de réception, inventaire, casse…' })}</form>`,
        actions: [{ label: 'Annuler' }, { label: 'Enregistrer', cls: 'btn-primary', onClick(bd) {
          const f = bd.querySelector('form'); let ok = validate(f); const n = +f.qte.value; const t = f.type.value; const fe = m => { const x = f.qte.closest('.field'); x.classList.add('error'); x.querySelector('.err').textContent = m; ok = false; };
          if (f.qte.value && (!Number.isInteger(n) || n < (t === 'Ajustement' ? 0 : 1))) fe('Nombre entier ' + (t === 'Ajustement' ? '≥ 0' : '≥ 1') + '.');
          if (ok && t === 'Sortie' && n > dispo(p)) fe('Sortie impossible : seulement ' + dispo(p) + ' unité(s) disponible(s) (hors réservations).');
          if (ok && t === 'Ajustement' && n < (p.reserve || 0)) fe('Le stock ne peut pas être inférieur aux réservations (' + p.reserve + ').');
          if (!ok) return false;
          const delta = t === 'Ajustement' ? n - p.stock : t === 'Sortie' ? -n : n; p.stock += delta;
          DB.mouvements.unshift([now(), p.id, t, delta, f.motif.value.trim(), me().nom]); log('Stock', `${t} ${delta > 0 ? '+' : ''}${delta} : ${p.nom}`);
          BO.refresh(); toast('Mouvement enregistré · nouveau disponible : ' + dispo(p)); } }] }); }

    // Livraisons : zones
    if (q('[data-save-zones]')) { const f = document.getElementById('f-zones'); let ok = true;
      DB.zones.forEach(z => { const i = f['frais_' + z.id]; const v = +i.value; const bad = i.value === '' || !Number.isInteger(v) || v < 0; i.style.borderColor = bad ? 'var(--danger)' : ''; if (bad) ok = false; });
      if (!ok) { toast('Frais invalides : montant entier ≥ 0 requis.', 'error'); return; }
      DB.zones.forEach(z => { const nv = +f['frais_' + z.id].value; if (nv !== z.frais) log('Paramètres', `Frais zone « ${z.nom} » : ${fmt(z.frais)} → ${fmt(nv)}`); z.frais = nv; z.delai = f['delai_' + z.id].value; z.actif = f['actif_' + z.id].checked; });
      toast('Tarifs enregistrés · appliqués immédiatement au panier'); BO.refresh(); }
    if (q('[data-zone-new]')) modal({ title: 'Nouvelle zone', noIcon: true, body: `<form class="form-grid" novalidate>${field('Nom', 'nom', '', { rule: 'req' })}${field('Communes / villes couvertes', 'det', '', { rule: 'req' })}${field('Frais (Ar)', 'frais', '', { type: 'number', rule: 'req' })}${field('Délai', 'delai', '', { rule: 'req' })}</form>`, actions: [{ label: 'Annuler' }, { label: 'Créer', cls: 'btn-primary', onClick(bd) { const f = bd.querySelector('form'); if (!validate(f)) return false; DB.zones.push({ id: 'z' + Date.now(), nom: f.nom.value, detail: f.det.value, frais: Math.max(0, Math.round(+f.frais.value)), delai: f.delai.value, actif: true }); BO.refresh(); toast('Zone créée'); } }] });

    // Vendeurs
    if (q('[data-vok]')) { const v = V(q('[data-vok]').dataset.vok); confirmBox('Activer « ' + esc(v.nom) + ' » ?', '<p>Le vendeur pourra publier ses produits (soumis à validation) et recevoir des commandes. Un e-mail de bienvenue lui sera envoyé.</p>', () => { v.statut = 'actif'; v.verifie = true; log('Vendeur', v.nom + ' approuvé'); BO.refresh(); toast(v.nom + ' est maintenant actif'); }); }
    if (q('[data-vrej]')) { const v = V(q('[data-vrej]').dataset.vrej); modal({ title: 'Refuser la demande', tone: 'danger', body: `<div class="field"><label>Motif communiqué au vendeur <span class="req">*</span></label><textarea class="textarea" id="mo"></textarea><span class="err">Motif obligatoire.</span></div>`, actions: [{ label: 'Annuler' }, { label: 'Refuser', cls: 'btn-danger', onClick(bd) { const m = bd.querySelector('#mo'); if (!m.value.trim()) { m.closest('.field').classList.add('error'); return false; } v.statut = 'refuse'; log('Vendeur', v.nom + ' refusé'); BO.refresh(); } }] }); }
    if (q('[data-vreq]')) toast('Demande de complément envoyée (extrait RCS manquant).');
    if (q('[data-vsusp]')) { const v = V(q('[data-vsusp]').dataset.vsusp); confirmBox('Suspendre ' + esc(v.nom) + ' ?', '<p>Ses produits seront masqués. Les commandes en cours restent à honorer.</p>', () => { v.statut = 'suspendu'; log('Vendeur', v.nom + ' suspendu'); BO.refresh(); }, { yesCls: 'btn-danger', tone: 'danger', yes: 'Suspendre' }); }
    if (q('[data-save-com]')) { e.preventDefault(); const v = V(q('[data-save-com]').dataset.saveCom); const f = document.getElementById('f-com'); const n = +f.com.value; const fl = f.com.closest('.field');
      if (f.com.value === '' || !(n >= 0 && n <= 30)) { fl.classList.add('error'); fl.querySelector('.err').textContent = 'Taux entre 0 et 30 %.'; return; }
      log('Vendeur', `Commission ${v.nom} : ${v.commission} % → ${n} %`); v.commission = n; toast('Commission mise à jour'); BO.refresh(); }
    if (q('[data-rv]')) { const r = DB.reversements.find(x => x.id === q('[data-rv]').dataset.rv); const net = Math.round(r.brut * (1 - V(r.vendeur).commission / 100));
      modal({ title: 'Reversement ' + r.id, tone: 'success', icon: 'wallet', body: `<p>${esc(V(r.vendeur).nom)} · net à verser <b>${fmt(net)}</b> par ${r.moyen}.</p><div class="field"><label>Référence du transfert <span class="req">*</span></label><input class="input" id="ref"><span class="err">Référence obligatoire.</span></div>`,
        actions: [{ label: 'Annuler' }, { label: 'Confirmer le paiement', cls: 'btn-primary', onClick(bd) { const i = bd.querySelector('#ref'); if (!i.value.trim()) { i.closest('.field').classList.add('error'); return false; } r.statut = 'paye'; r.date = '2026-09-28'; log('Paiement', 'Reversement ' + r.id + ' payé : ' + fmt(net)); BO.refresh(); toast('Reversement marqué payé · vendeur notifié'); } }] }); }

    // Avis
    if (q('[data-avtab]')) { F.avis = q('[data-avtab]').dataset.avtab; BO.refresh(); }
    if (q('[data-avis]')) { const b = q('[data-avis]'); const a = DB.avis.find(x => x.id === b.dataset.avis); a.statut = b.dataset.to; log('Avis', 'Avis ' + a.id + ' : ' + (a.statut === 'publie' ? 'publié' : 'rejeté')); BO.refresh(); toast(a.statut === 'publie' ? 'Avis publié' : 'Avis rejeté'); }

    // Utilisateurs
    if (q('[data-invite]') || q('[data-user]')) { const u = q('[data-user]') ? DB.utilisateurs.find(x => x.id === q('[data-user]').dataset.user) : { nom: '', email: '', role: 'commandes', statut: 'actif', mfa: true };
      modal({ title: u.id ? 'Modifier ' + esc(u.nom) : 'Inviter un utilisateur', noIcon: true, body: `<form class="form-grid" novalidate>${field('Nom complet', 'nom', u.nom, { rule: 'req' })}${field('E-mail professionnel', 'email', u.email, { rule: 'req email', type: 'email' })}${field('Rôle', 'role', u.role, { type: 'select', options: DB.roles.map(r => [r.id, r.nom + ' — ' + r.acces]) })}<label class="check"><input type="checkbox" name="mfa" ${u.mfa ? 'checked' : ''}> Exiger la double authentification</label>${u.id ? `<label class="check"><input type="checkbox" name="susp" ${u.statut !== 'actif' ? 'checked' : ''}> Compte suspendu</label>` : ''}</form>`,
        actions: [{ label: 'Annuler' }, { label: u.id ? 'Enregistrer' : 'Envoyer l’invitation', cls: 'btn-primary', onClick(bd) {
          const f = bd.querySelector('form'); if (!validate(f)) return false;
          if (u.id === 'u1' && f.role.value !== 'super' && DB.utilisateurs.filter(x => x.role === 'super').length === 1) { toast('Impossible : il doit rester au moins un super administrateur.', 'error'); return false; }
          if (u.id) { Object.assign(u, { nom: f.nom.value, email: f.email.value, role: f.role.value, mfa: f.mfa.checked, statut: f.susp.checked ? 'suspendu' : 'actif' }); log('Utilisateur', 'Modification ' + u.email); }
          else { DB.utilisateurs.push({ id: 'u' + Date.now(), nom: f.nom.value, email: f.email.value, role: f.role.value, mfa: f.mfa.checked, statut: 'actif', dernier: '—' }); log('Utilisateur', 'Invitation ' + f.email.value); }
          BO.refresh(); toast(u.id ? 'Utilisateur mis à jour' : 'Invitation envoyée'); } }] }); }

    // Paramètres
    if (q('[data-save-set]')) { const f = document.getElementById('f-set'); if (validate(f)) toast('Paramètres enregistrés'); }
    if (q('[data-save-reg]')) { const r = document.querySelector('[name=reg]:checked').value; store.set('regleStock', r); log('Paramètres', 'Règle de stock : ' + r); toast('Règle de stock enregistrée'); }
    if (q('[data-tpl]')) modal({ title: 'Modèle — ' + esc(q('[data-tpl]').dataset.tpl), noIcon: true, wide: true, body: `<div class="field"><label>SMS (160 caractères)</label><textarea class="textarea" style="min-height:70px">Site E_commerce : votre commande {numero} de {total} est confirmée. Suivi : {lien}</textarea><span class="hint">Variables : {prenom} {numero} {total} {statut} {lien}</span></div><div class="field" style="margin-top:10px"><label>Objet de l’e-mail</label><input class="input" value="Votre commande {numero} est confirmée"></div>`, actions: [{ label: 'Annuler' }, { label: 'Envoyer un test', onClick: () => { toast('Test envoyé'); return false; } }, { label: 'Enregistrer', cls: 'btn-primary', onClick: () => toast('Modèle enregistré') }] });
    if (q('[data-backup]')) toast('Sauvegarde lancée — notification à la fin.');
    if (q('[data-backup-test]')) toast('Restauration de test lancée sur l’environnement staging.');
  });

  const nOrders = () => orders().filter(o => o.statutLivraison === 'a_preparer' && !['annule', 'echoue'].includes(o.statutPaiement)).length;
  BO.mount({
    key: 'admin', tag: 'Admin', home: '#dashboard', front: '../index.html', defaultRole: 'super', roles: DB.roles,
    searchPh: 'Commande, produit, client…',
    user: { get nom() { return me().nom; }, role: () => DB.roles.find(r => r.id === BO.role).nom },
    sideFoot: `<a class="bo-link" href="../vendeur/index.html">${icon('store')} Espace vendeur (démo)</a><a class="bo-link" href="../index.html">${icon('globe')} Voir le site</a>`,
    notifs: [['warning', 'package', 'Nouvelle commande CMD-2026-001284', 'Il y a 18 min · MVola · 113 500 Ar'], ['danger', 'alert', 'Stock faible : Montre classique', '3 unités, seuil 4'], ['info', 'store', 'Demande vendeur : Toamasina Import', 'Dossier incomplet'], ['primary', 'star', '3 avis à modérer', 'Dont 1 contenu suspect']],
    menu: [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', group: 'Pilotage' }, { id: 'rapports', label: 'Rapports', icon: 'chart', group: 'Pilotage' },
      { id: 'commandes', label: 'Commandes', icon: 'package', group: 'Ventes', count: nOrders }, { id: 'paiements', label: 'Paiements', icon: 'card', group: 'Ventes' },
      { id: 'livraisons', label: 'Livraisons', icon: 'truck', group: 'Ventes' }, { id: 'clients', label: 'Clients', icon: 'users', group: 'Ventes' },
      { id: 'produits', label: 'Produits', icon: 'box', group: 'Catalogue' }, { id: 'categories', label: 'Catégories', icon: 'list', group: 'Catalogue' },
      { id: 'promotions', label: 'Promotions', icon: 'tag', group: 'Catalogue' }, { id: 'stock', label: 'Stock', icon: 'package', group: 'Catalogue', count: () => alertes().length },
      { id: 'avis', label: 'Avis clients', icon: 'star', group: 'Catalogue', count: () => DB.avis.filter(a => a.statut === 'en_attente').length },
      { id: 'vendeurs', label: 'Vendeurs', icon: 'store', group: 'Marketplace', count: () => DB.vendeurs.filter(v => v.statut === 'en_attente').length }, { id: 'reversements', label: 'Reversements', icon: 'wallet', group: 'Marketplace' },
      { id: 'utilisateurs', label: 'Utilisateurs & rôles', icon: 'shield', group: 'Administration' }, { id: 'journal', label: 'Journal d’activité', icon: 'file', group: 'Administration' }, { id: 'parametres', label: 'Paramètres', icon: 'settings', group: 'Administration' }
    ],
    alias: { commande: 'commandes', produit: 'produits', vendeur: 'vendeurs' },
    routes,
    after: {
      dashboard: () => BO.bindLine('ch-ca', BO.days(F.period), fmt),
      rapports: () => BO.bindLine('ch-rep', BO.days(30), fmt),
      produit: () => seoPreview()
    },
    onSearch(q) {
      const o = orders().find(x => x.numero.toLowerCase().includes(q.toLowerCase())); if (o) { location.hash = 'commande/' + o.numero; return; }
      const p = DB.produits.find(x => (x.nom + x.sku).toLowerCase().includes(q.toLowerCase())); if (p) { location.hash = 'produit/' + p.id; return; }
      const c = DB.clients.find(x => (x.prenom + ' ' + x.nom + x.email).toLowerCase().includes(q.toLowerCase())); if (c) { clientModal(c.id); return; }
      toast('Aucun résultat pour « ' + esc(q) + ' »', 'warning');
    }
  });
})();
