/* =========================================================
   Gabarit Front-Office : en-tête, navigation, pied de page
   ========================================================= */
(function () {
  const { icon, Cart, C, esc } = App;
  const page = document.body.dataset.page || '';

  function header() {
    const cats = DB.categories;
    const q = App.qs('q') || '';
    const cat = App.qs('cat') || '';
    const search = `<form class="search-box" action="catalogue.html" role="search">
        <select name="cat" aria-label="Catégorie"><option value="">Toutes catégories</option>${cats.map(c => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${c.nom}</option>`).join('')}</select>
        <input name="q" type="search" placeholder="Rechercher un produit, une marque, une boutique…" value="${esc(q)}" aria-label="Rechercher">
        <button type="submit" aria-label="Lancer la recherche">${icon('search')}</button></form>`;
    const mSearch = `<form class="search-box" action="catalogue.html" role="search"><input name="q" type="search" placeholder="Rechercher sur Site E_commerce" value="${esc(q)}" aria-label="Rechercher"><button type="submit" aria-label="Rechercher">${icon('search')}</button></form>`;
    const logged = App.User.logged();
    return `
    <div class="topbar"><div class="container">
      <span>${icon('truck', 'sm')} Livraison dans toute l’île — 24 h à Antananarivo</span>
      <span class="tb-more">${icon('phone', 'sm')} Paiement MVola, Orange Money, Airtel Money</span>
      <span class="tb-more"><a href="vendre.html">Vendre sur Site E_commerce</a> · <a href="contact.html">Aide & contact</a> · <a href="admin/index.html">Espace admin</a></span>
    </div></div>
    <header class="site-header">
      <div class="container">
        <div class="hdr-main">
          <button class="hdr-action hdr-burger" data-drawer="menu" aria-label="Ouvrir le menu">${icon('menu')}</button>
          <a class="logo" href="index.html" aria-label="Site E_commerce — accueil"><span class="logo-mark">${icon('bag')}</span><span>Site E_commerce<small>La marketplace de Madagascar</small></span></a>
          <div class="hdr-search">${search}</div>
          <nav class="hdr-actions" aria-label="Raccourcis">
            <a class="hdr-action" href="compte.html#favoris" aria-label="Favoris">${icon('heart')}<span class="lbl">Favoris</span></a>
            <a class="hdr-action" href="${logged ? 'compte.html' : 'connexion.html'}" aria-label="Mon compte">${icon('user')}<span class="lbl">${logged ? 'Bonjour, ' + esc(App.User.get().prenom) : 'Se connecter'}</span></a>
            <a class="hdr-action" href="panier.html" aria-label="Panier">${icon('cart')}<span class="lbl">Panier</span><span class="count" data-cart-count>0</span></a>
          </nav>
        </div>
        <div class="hdr-mobile-search">${mSearch}</div>
      </div>
      <nav class="hdr-nav" aria-label="Catégories"><div class="container">
        <a class="nav-all" href="catalogue.html">${icon('grid', 'sm')} Toutes les catégories</a>
        ${cats.map(c => `<a href="catalogue.html?cat=${c.id}" class="${cat === c.id ? 'active' : ''}">${c.nom.split(' & ')[0].replace('Épicerie fine', 'Épicerie')}</a>`).join('')}
        <a class="nav-promo ${page === 'promo' ? 'active' : ''}" href="catalogue.html?promo=1">${icon('percent', 'sm')} Promotions</a>
        <a class="nav-right ${page === 'boutiques' ? 'active' : ''}" href="boutiques.html">${icon('store', 'sm')} Boutiques</a>
      </div></nav>
    </header>
    <div class="drawer-backdrop" data-drawer-close></div>
    <aside class="drawer" id="drawer-menu" aria-label="Menu">
      <div class="drawer-head"><a class="logo" href="index.html"><span class="logo-mark">${icon('bag')}</span>Site E_commerce</a><button class="btn btn-ghost btn-icon" data-drawer-close aria-label="Fermer">${icon('x')}</button></div>
      <div class="drawer-body">
        <a class="drawer-link" href="index.html">${icon('home')} Accueil</a>
        <a class="drawer-link" href="catalogue.html?promo=1" style="color:var(--accent)">${icon('percent')} Promotions</a>
        <a class="drawer-link" href="boutiques.html">${icon('store')} Toutes les boutiques</a>
        <div class="drawer-title">Catégories</div>
        ${cats.map(c => `<a class="drawer-link" href="catalogue.html?cat=${c.id}">${icon(c.icon)} ${c.nom}</a>`).join('')}
        <div class="drawer-sep"></div>
        <a class="drawer-link" href="compte.html">${icon('user')} Mon compte</a>
        <a class="drawer-link" href="compte.html#commandes">${icon('package')} Mes commandes</a>
        <a class="drawer-link" href="vendre.html">${icon('wallet')} Vendre sur Site E_commerce</a>
        <a class="drawer-link" href="contact.html">${icon('message')} Aide & contact</a>
        <div class="drawer-sep"></div>
        <a class="drawer-link" href="vendeur/index.html">${icon('store')} Espace vendeur</a>
        <a class="drawer-link" href="admin/index.html">${icon('lock')} Back-office admin</a>
      </div>
    </aside>`;
  }

  function footer() {
    return `<footer class="site-footer">
      <div class="ft-trust"><div class="container">
        <div class="it">${icon('truck')}<div><b>Livraison partout à Madagascar</b><span>Tarifs par zone, affichés avant paiement</span></div></div>
        <div class="it">${icon('phone')}<div><b>Paiement Mobile Money</b><span>MVola, Orange Money, Airtel Money</span></div></div>
        <div class="it">${icon('shield')}<div><b>Vendeurs vérifiés</b><span>NIF / STAT contrôlés par nos équipes</span></div></div>
        <div class="it">${icon('refresh')}<div><b>Retours sous 7 jours</b><span>Selon la politique de retour</span></div></div>
      </div></div>
      <div class="container">
        <div class="ft-cols">
          <div class="ft-brand">
            <a class="logo" href="index.html"><span class="logo-mark">${icon('bag')}</span>Site E_commerce</a>
            <p style="color:#94A3B8;font-size:.86rem;max-width:320px">La marketplace qui réunit les meilleurs vendeurs de Madagascar : mode, high-tech, maison, produits locaux et artisanat.</p>
            <div class="row" style="gap:8px;color:#94A3B8;font-size:.85rem">${icon('call', 'sm')} +261 34 00 000 00</div>
            <div class="row" style="gap:8px;color:#94A3B8;font-size:.85rem;margin-top:6px">${icon('mail', 'sm')} contact@site-ecommerce.mg</div>
          </div>
          <div><h4>Acheter</h4><ul>
            <li><a href="catalogue.html">Toutes les catégories</a></li><li><a href="catalogue.html?promo=1">Promotions</a></li>
            <li><a href="boutiques.html">Boutiques</a></li><li><a href="compte.html#favoris">Mes favoris</a></li></ul></div>
          <div><h4>Mon compte</h4><ul>
            <li><a href="compte.html">Tableau de bord</a></li><li><a href="compte.html#commandes">Mes commandes</a></li>
            <li><a href="compte.html#adresses">Mes adresses</a></li><li><a href="connexion.html">Connexion / inscription</a></li></ul></div>
          <div><h4>Informations</h4><ul>
            <li><a href="a-propos.html">À propos</a></li><li><a href="infos.html#livraison">Livraison & retours</a></li>
            <li><a href="infos.html#cgv">Conditions générales de vente</a></li><li><a href="infos.html#confidentialite">Confidentialité</a></li><li><a href="contact.html">Contact</a></li></ul></div>
          <div><h4>Vendre avec nous</h4><ul>
            <li><a href="vendre.html">Ouvrir ma boutique</a></li><li><a href="vendeur/index.html">Espace vendeur</a></li></ul>
            <h4 style="margin-top:18px">Moyens de paiement</h4>
            <div class="pay-logos"><span class="pay-logo" style="background:#E30613">MVola</span><span class="pay-logo" style="background:#FF7900">Orange Money</span><span class="pay-logo" style="background:#D6001C">Airtel Money</span><span class="pay-logo">Visa</span><span class="pay-logo">Mastercard</span><span class="pay-logo">Virement</span></div>
          </div>
        </div>
      </div>
      <div class="ft-bottom"><div class="container"><span>© 2026 Site E_commerce — Tous droits réservés. Prix en Ariary (MGA), TVA incluse selon le régime du vendeur.</span><span>Maquette UX/UI — version 1.0</span></div></div>
    </footer>`;
  }

  function bottomNav() {
    const is = p => (page === p ? 'active' : '');
    return `<nav class="bottom-nav" aria-label="Navigation principale">
      <a href="index.html" class="${is('home')}">${icon('home')}Accueil</a>
      <button data-drawer="menu" class="${is('catalogue')}">${icon('grid')}Catégories</button>
      <a href="catalogue.html?focus=1" class="${is('search')}">${icon('search')}Recherche</a>
      <a href="panier.html" class="${is('panier')}">${icon('cart')}Panier<span class="count" data-cart-count>0</span></a>
      <a href="compte.html" class="${is('compte')}">${icon('user')}Compte</a>
    </nav>
    <div class="mock-flag no-print">Maquette · <a href="sommaire.html">Sommaire des écrans</a></div>`;
  }

  function updateCount() {
    const n = Cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = n; el.style.display = n ? '' : 'none'; });
  }

  const h = document.getElementById('app-header'); if (h) h.outerHTML = header();
  const f = document.getElementById('app-footer'); if (f) f.outerHTML = footer() + bottomNav();
  updateCount();
  document.addEventListener('cart:change', updateCount);

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-drawer]');
    if (o) { document.getElementById('drawer-' + o.dataset.drawer).classList.add('open'); document.body.classList.add('drawer-open'); }
    if (e.target.closest('[data-drawer-close]')) { document.body.classList.remove('drawer-open'); document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open')); }
  });
  if (App.qs('focus')) { const i = document.querySelector('.hdr-mobile-search input'); if (i && innerWidth < 768) i.focus(); }
})();
