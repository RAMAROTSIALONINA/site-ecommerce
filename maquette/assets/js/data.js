/* =========================================================
   Données de démonstration — Site E_commerce (marketplace)
   Toutes les données sont fictives.
   ========================================================= */
window.DB = (function () {
  const categories = [
    { id: 'mode', nom: 'Mode & Accessoires', icon: 'shirt', hue: 340, sous: ['Femme', 'Homme', 'Sacs', 'Montres'] },
    { id: 'tech', nom: 'Téléphones & High-tech', icon: 'phone', hue: 215, sous: ['Smartphones', 'Ordinateurs', 'Audio', 'Accessoires'] },
    { id: 'maison', nom: 'Maison & Cuisine', icon: 'lamp', hue: 28, sous: ['Cuisine', 'Décoration', 'Linge de maison'] },
    { id: 'beaute', nom: 'Beauté & Bien-être', icon: 'sparkles', hue: 290, sous: ['Soins', 'Huiles essentielles', 'Hygiène'] },
    { id: 'epicerie', nom: 'Épicerie fine & Produits locaux', icon: 'leaf', hue: 140, sous: ['Vanille & épices', 'Café & cacao', 'Miel & confitures'] },
    { id: 'artisanat', nom: 'Artisanat malgache', icon: 'gift', hue: 42, sous: ['Raphia', 'Bois', 'Soie & textile'] }
  ];

  const vendeurs = [
    { id: 'v1', nom: 'Tana Mode', slug: 'tana-mode', ville: 'Antananarivo', region: 'Analamanga', hue: 340, note: 4.6, avis: 212, ventes: 1840, depuis: '2024', verifie: true, statut: 'actif', commission: 12, cat: 'mode', tel: '+261 34 00 111 01', email: 'contact@tanamode.mg', nif: '4001234567', stat: '47111 11 2024 0 00123', desc: 'Prêt-à-porter et accessoires sélectionnés, dont une partie confectionnée dans nos ateliers d’Antananarivo.' },
    { id: 'v2', nom: 'Ivandry Digital', slug: 'ivandry-digital', ville: 'Antananarivo', region: 'Analamanga', hue: 215, note: 4.4, avis: 356, ventes: 2410, depuis: '2023', verifie: true, statut: 'actif', commission: 8, cat: 'tech', tel: '+261 32 00 222 02', email: 'ventes@ivandry-digital.mg', nif: '4002345678', stat: '47411 11 2023 0 00456', desc: 'Smartphones, ordinateurs et accessoires garantis. Service après-vente à Ivandry.' },
    { id: 'v3', nom: 'Saveurs de la SAVA', slug: 'saveurs-sava', ville: 'Sambava', region: 'Sava', hue: 140, note: 4.9, avis: 489, ventes: 3120, depuis: '2023', verifie: true, statut: 'actif', commission: 10, cat: 'epicerie', tel: '+261 33 00 333 03', email: 'bonjour@saveurs-sava.mg', nif: '4003456789', stat: '10830 71 2023 0 00789', desc: 'Vanille bourbon, cacao et épices en direct des producteurs de la région SAVA.' },
    { id: 'v4', nom: 'Atelier Raphia d’Ambositra', slug: 'atelier-ambositra', ville: 'Ambositra', region: 'Amoron’i Mania', hue: 42, note: 4.8, avis: 164, ventes: 870, depuis: '2024', verifie: true, statut: 'actif', commission: 10, cat: 'artisanat', tel: '+261 34 00 444 04', email: 'atelier@ambositra-raphia.mg', nif: '4004567890', stat: '13921 51 2024 0 00321', desc: 'Vannerie, marqueterie et soie sauvage réalisées à la main par des artisans d’Ambositra.' },
    { id: 'v5', nom: 'Maison Analakely', slug: 'maison-analakely', ville: 'Antananarivo', region: 'Analamanga', hue: 28, note: 4.3, avis: 98, ventes: 640, depuis: '2025', verifie: true, statut: 'actif', commission: 10, cat: 'maison', tel: '+261 32 00 555 05', email: 'contact@maison-analakely.mg', nif: '4005678901', stat: '47591 11 2025 0 00654', desc: 'Ustensiles de cuisine, linge de maison et décoration pour tous les foyers.' },
    { id: 'v6', nom: 'Ylang Nosy Be', slug: 'ylang-nosy-be', ville: 'Hell-Ville', region: 'Diana', hue: 290, note: 4.7, avis: 231, ventes: 1290, depuis: '2024', verifie: true, statut: 'actif', commission: 12, cat: 'beaute', tel: '+261 33 00 666 06', email: 'hello@ylang-nosybe.mg', nif: '4006789012', stat: '20420 71 2024 0 00987', desc: 'Huiles essentielles et cosmétiques naturels distillés à Nosy Be.' },
    { id: 'v7', nom: 'Toamasina Import', slug: 'toamasina-import', ville: 'Toamasina', region: 'Atsinanana', hue: 190, note: 0, avis: 0, ventes: 0, depuis: '2026', verifie: false, statut: 'en_attente', commission: 10, cat: 'tech', tel: '+261 34 00 777 07', email: 'import@toamasina-import.mg', nif: '4007890123', stat: '46521 31 2026 0 00111', desc: 'Demande d’ouverture de boutique — accessoires téléphonie et électroménager.' }
  ];

  // P = [id, sku, nom, cat, sous, vendeur, prix, promo, stock, seuil, note, avis, icon, variantes, badge, ventes]
  const raw = [
    ['p1', 'TM-RB-001', 'Robe imprimée lamba, coupe évasée', 'mode', 'Femme', 'v1', 45000, 38000, 14, 5, 4.7, 38, 'shirt', { Taille: ['S', 'M', 'L', 'XL'] }, 'promo', 210],
    ['p2', 'TM-CH-014', 'Chemise en lin homme, manches longues', 'mode', 'Homme', 'v1', 38000, null, 22, 5, 4.5, 21, 'shirt', { Taille: ['M', 'L', 'XL'] }, null, 132],
    ['p3', 'TM-SC-007', 'Sac cabas en cuir de zébu', 'mode', 'Sacs', 'v1', 75000, null, 6, 3, 4.8, 17, 'bag', { Couleur: ['Naturel', 'Brun'] }, null, 64],
    ['p4', 'TM-MT-002', 'Montre classique bracelet acier', 'mode', 'Montres', 'v1', 85000, 72000, 3, 4, 4.4, 12, 'watch', null, 'promo', 41],
    ['p5', 'ID-SP-128', 'Smartphone Android 6,6″ — 128 Go, double SIM', 'tech', 'Smartphones', 'v2', 650000, 599000, 9, 5, 4.5, 74, 'phone', { Couleur: ['Noir', 'Bleu nuit'] }, 'promo', 188],
    ['p6', 'ID-PC-512', 'Ordinateur portable 15,6″ — 8 Go / SSD 512 Go', 'tech', 'Ordinateurs', 'v2', 1950000, null, 4, 3, 4.6, 29, 'laptop', null, null, 57],
    ['p7', 'ID-AU-033', 'Écouteurs sans fil Bluetooth, réduction de bruit', 'tech', 'Audio', 'v2', 55000, 45000, 30, 8, 4.3, 112, 'headphones', { Couleur: ['Blanc', 'Noir'] }, 'promo', 402],
    ['p8', 'ID-AC-020', 'Batterie externe 20 000 mAh, charge rapide', 'tech', 'Accessoires', 'v2', 45000, null, 0, 10, 4.2, 58, 'battery', null, null, 311],
    ['p9', 'SS-VA-100', 'Vanille bourbon de la SAVA — gousses 100 g', 'epicerie', 'Vanille & épices', 'v3', 48000, null, 40, 10, 4.9, 146, 'leaf', null, 'best', 690],
    ['p10', 'SS-CF-500', 'Café arabica torréfié des Hautes Terres — 500 g', 'epicerie', 'Café & cacao', 'v3', 18000, null, 55, 15, 4.7, 88, 'coffee', { Mouture: ['Grains', 'Moulu'] }, null, 520],
    ['p11', 'SS-MI-500', 'Miel de litchi — pot de 500 g', 'epicerie', 'Miel & confitures', 'v3', 15000, 12500, 26, 10, 4.8, 64, 'droplet', null, 'promo', 377],
    ['p12', 'SS-CA-250', 'Cacao en poudre du Sambirano — 250 g', 'epicerie', 'Café & cacao', 'v3', 12000, null, 34, 10, 4.6, 41, 'coffee', null, null, 198],
    ['p13', 'SS-PV-050', 'Poivre sauvage voatsiperifery — 50 g', 'epicerie', 'Vanille & épices', 'v3', 14000, null, 18, 8, 4.9, 22, 'leaf', null, 'new', 76],
    ['p14', 'AR-PN-011', 'Panier en raphia tressé main', 'artisanat', 'Raphia', 'v4', 25000, null, 20, 5, 4.8, 33, 'gift', { Couleur: ['Naturel', 'Multicolore'] }, null, 143],
    ['p15', 'AR-CP-004', 'Chapeau en raphia à large bord', 'artisanat', 'Raphia', 'v4', 18000, null, 12, 5, 4.6, 19, 'gift', { Taille: ['M', 'L'] }, null, 88],
    ['p16', 'AR-EC-021', 'Écharpe en soie sauvage (landibe)', 'artisanat', 'Soie & textile', 'v4', 65000, null, 5, 3, 4.9, 14, 'gift', null, 'new', 29],
    ['p17', 'AR-SC-002', 'Sculpture zébu en palissandre', 'artisanat', 'Bois', 'v4', 120000, null, 2, 2, 5.0, 7, 'gift', null, null, 12],
    ['p18', 'MA-MR-003', 'Lot de 3 marmites en aluminium (vilany)', 'maison', 'Cuisine', 'v5', 45000, null, 16, 5, 4.4, 27, 'pot', null, null, 154],
    ['p19', 'MA-LP-008', 'Lampe de table en rabane', 'maison', 'Décoration', 'v5', 35000, null, 9, 4, 4.2, 11, 'lamp', null, null, 46],
    ['p20', 'MA-PL-2P', 'Parure de lit coton 2 places', 'maison', 'Linge de maison', 'v5', 85000, 72000, 7, 4, 4.5, 23, 'bed', { Couleur: ['Blanc', 'Sable', 'Bleu'] }, 'promo', 71],
    ['p21', 'YN-HE-010', 'Huile essentielle d’ylang-ylang — 10 ml', 'beaute', 'Huiles essentielles', 'v6', 18000, null, 45, 10, 4.8, 96, 'droplet', null, 'best', 460],
    ['p22', 'YN-SV-003', 'Savons karité & vanille — lot de 3', 'beaute', 'Hygiène', 'v6', 12000, null, 60, 15, 4.6, 52, 'sparkles', null, null, 305],
    ['p23', 'YN-CR-050', 'Crème visage à la centella (talapetraka) — 50 ml', 'beaute', 'Soins', 'v6', 28000, null, 14, 5, 4.7, 18, 'sparkles', null, 'new', 58],
    ['p24', 'YN-HC-250', 'Huile de coco vierge — 250 ml', 'beaute', 'Soins', 'v6', 10000, 8500, 38, 10, 4.5, 44, 'droplet', null, 'promo', 267]
  ];
  const descs = {
    mode: 'Pièce sélectionnée par notre vendeur partenaire. Matières contrôlées, finitions soignées et guide des tailles disponible.',
    tech: 'Produit neuf, garanti 12 mois par le vendeur. Facture fournie. Compatible avec les réseaux mobiles utilisés à Madagascar.',
    maison: 'Article robuste pensé pour un usage quotidien. Entretien facile.',
    beaute: 'Formule naturelle, produite à Madagascar. Conserver à l’abri de la chaleur et de la lumière.',
    epicerie: 'Produit local issu de filières courtes. Conditionnement hermétique pour préserver les arômes.',
    artisanat: 'Fabriqué à la main par des artisans malgaches. Chaque pièce est unique : de légères variations sont possibles.'
  };
  const produits = raw.map((r, i) => ({
    id: r[0], sku: r[1], nom: r[2], cat: r[3], sous: r[4], vendeur: r[5], prix: r[6], promo: r[7],
    stock: r[8], seuil: r[9], note: r[10], avis: r[11], icon: r[12], variantes: r[13], badge: r[14], ventes: r[15],
    reserve: [0, 1, 0, 2, 1, 0, 3, 0, 4, 2, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 2, 0, 0, 1][i],
    actif: true, desc: descs[r[3]], poids: '—', img: 'assets/img/produits/' + r[0] + '.webp',
    slug: r[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }));

  // Photo représentative de chaque catégorie
  const photoCat = { mode: 'p1', tech: 'p5', maison: 'p19', beaute: 'p21', epicerie: 'p9', artisanat: 'p14' };
  categories.forEach(c => { c.photo = photoCat[c.id]; });

  // Crédits photos — Unsplash (licence Unsplash : usage commercial gratuit, sans attribution obligatoire)
  const credits = {
    p1: 'Sandra Seitamaa', p2: 'Robert Richman', p3: 'Latico Leathers', p4: 'Ђорђе Јовичић', p5: 'Masakaze Kawakami', p6: 'Pakata Goh',
    p7: 'Roger Cai', p8: 'I’M ZION', p9: 'sidath vimukthi', p10: 'Mockup Graphics', p11: 'Mahdi Kordi', p12: 'Pablo Merchán Montes',
    p13: 'Nancy Hughes', p14: 'Annie Spratt', p15: 'Michael Schofield', p16: 'Ra Dragon', p17: 'Ivan Nemchinov', p18: 'Cooker King',
    p19: 'Joel Henry', p20: 'Zulian Firmansyah', p21: 'Harrison Cohen', p22: 'Sincerely Media', p23: 'Giorgio Trovato', p24: 'Katherine Volkovski'
  };

  const zones = [
    { id: 'tana-centre', nom: 'Antananarivo centre', detail: 'Communes urbaines d’Antananarivo Renivohitra', frais: 5000, delai: 'Sous 24 h', actif: true },
    { id: 'tana-peri', nom: 'Périphérie d’Antananarivo', detail: 'Antananarivo Atsimondrano, Avaradrano, Ambohidratrimo', frais: 8000, delai: '24 à 48 h', actif: true },
    { id: 'grandes-villes', nom: 'Grandes villes', detail: 'Toamasina, Antsirabe, Mahajanga, Fianarantsoa, Toliara, Antsiranana', frais: 15000, delai: '2 à 4 jours', actif: true },
    { id: 'autres', nom: 'Autres villes et régions', detail: 'Livraison via transporteur partenaire', frais: 25000, delai: '4 à 7 jours', actif: true },
    { id: 'retrait', nom: 'Retrait au point relais Analakely', detail: 'Lun–Sam, 8 h – 18 h', frais: 0, delai: 'Dès confirmation', actif: true }
  ];

  const regions = ['Alaotra-Mangoro', 'Amoron’i Mania', 'Analamanga', 'Analanjirofo', 'Androy', 'Anosy', 'Atsimo-Andrefana', 'Atsimo-Atsinanana', 'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava', 'Diana', 'Fitovinany', 'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 'Menabe', 'Sava', 'Sofia', 'Vakinankaratra', 'Vatovavy'];

  const paiements = [
    { id: 'cod', nom: 'Paiement à la livraison', detail: 'Espèces ou Mobile Money au livreur', logo: 'COD', couleur: '#475569', actif: true },
    { id: 'mvola', nom: 'MVola', detail: 'Paiement Mobile Money', logo: 'MVola', couleur: '#E30613', actif: true, mm: true, prefixes: ['034', '038'] },
    { id: 'orange', nom: 'Orange Money', detail: 'Paiement Mobile Money', logo: 'OM', couleur: '#FF7900', actif: true, mm: true, prefixes: ['032', '037'] },
    { id: 'airtel', nom: 'Airtel Money', detail: 'Paiement Mobile Money', logo: 'AM', couleur: '#D6001C', actif: true, mm: true, prefixes: ['033'] },
    { id: 'virement', nom: 'Virement bancaire', detail: 'Commande expédiée à réception des fonds', logo: 'VIR', couleur: '#1D4ED8', actif: true },
    { id: 'carte', nom: 'Carte bancaire', detail: 'Visa / Mastercard via prestataire sécurisé', logo: 'CB', couleur: '#0F172A', actif: true }
  ];

  const statutsPaiement = {
    attente: { l: 'En attente', c: 'warning' }, initie: { l: 'Initié', c: 'info' }, paye: { l: 'Payé', c: 'success' },
    echoue: { l: 'Échoué', c: 'danger' }, rembourse: { l: 'Remboursé', c: '' }, annule: { l: 'Annulé', c: 'danger' }
  };
  const statutsLivraison = {
    a_preparer: { l: 'À préparer', c: 'warning' }, expediee: { l: 'Expédiée', c: 'info' }, en_livraison: { l: 'En livraison', c: 'primary' },
    livree: { l: 'Livrée', c: 'success' }, retour: { l: 'Retour', c: 'danger' }, annulee: { l: 'Annulée', c: 'danger' }
  };

  const clients = [
    { id: 'c1', prenom: 'Hery', nom: 'Rakoto', email: 'hery.rakoto@exemple.mg', tel: '+261 34 12 345 67', ville: 'Antananarivo', inscrit: '2025-03-12', statut: 'actif' },
    { id: 'c2', prenom: 'Fanja', nom: 'Randrianarisoa', email: 'fanja.r@exemple.mg', tel: '+261 32 45 678 90', ville: 'Antananarivo', inscrit: '2025-06-02', statut: 'actif' },
    { id: 'c3', prenom: 'Tiana', nom: 'Andriamanjato', email: 'tiana.a@exemple.mg', tel: '+261 33 21 987 65', ville: 'Toamasina', inscrit: '2025-09-18', statut: 'actif' },
    { id: 'c4', prenom: 'Mamy', nom: 'Rabearivelo', email: 'mamy.rabe@exemple.mg', tel: '+261 34 76 543 21', ville: 'Antsirabe', inscrit: '2026-01-07', statut: 'actif' },
    { id: 'c5', prenom: 'Voahangy', nom: 'Razafindrakoto', email: 'voahangy.rz@exemple.mg', tel: '+261 38 11 223 34', ville: 'Mahajanga', inscrit: '2026-02-21', statut: 'actif' },
    { id: 'c6', prenom: 'Njaka', nom: 'Harisoa', email: 'njaka.h@exemple.mg', tel: '+261 32 99 887 76', ville: 'Fianarantsoa', inscrit: '2026-04-10', statut: 'actif' },
    { id: 'c7', prenom: 'Lalao', nom: 'Rasoanaivo', email: 'lalao.rs@exemple.mg', tel: '+261 34 55 443 32', ville: 'Antananarivo', inscrit: '2026-05-30', statut: 'bloque' },
    { id: 'c8', prenom: 'Andry', nom: 'Ravelojaona', email: 'andry.rv@exemple.mg', tel: '+261 33 66 778 89', ville: 'Toliara', inscrit: '2026-08-14', statut: 'actif' }
  ];

  const adresses = [
    { id: 'a1', client: 'c1', libelle: 'Domicile', nom: 'Hery Rakoto', tel: '+261 34 12 345 67', region: 'Analamanga', ville: 'Antananarivo', commune: 'Antananarivo Renivohitra', fokontany: 'Ankadifotsy', adresse: 'Lot IVG 45 bis', repere: 'Portail vert en face de l’épicerie', zone: 'tana-centre', defaut: true },
    { id: 'a2', client: 'c1', libelle: 'Bureau', nom: 'Hery Rakoto', tel: '+261 34 12 345 67', region: 'Analamanga', ville: 'Antananarivo', commune: 'Antananarivo Renivohitra', fokontany: 'Ankorondrano', adresse: 'Immeuble Fitaratra, 3e étage', repere: 'Accueil — demander le service comptable', zone: 'tana-centre', defaut: false }
  ];

  // Commandes : [numero, date, client, lignes[[produit, qte, variante]], zone, paiement, statutPaiement, statutLivraison, codePromo]
  const rawOrders = [
    ['CMD-2026-001284', '2026-09-28 09:42', 'c2', [['p9', 2], ['p11', 1]], 'tana-centre', 'mvola', 'paye', 'a_preparer', null],
    ['CMD-2026-001283', '2026-09-28 08:15', 'c4', [['p5', 1, 'Noir'], ['p7', 1, 'Blanc']], 'grandes-villes', 'orange', 'initie', 'a_preparer', null],
    ['CMD-2026-001282', '2026-09-27 19:03', 'c1', [['p1', 1, 'M'], ['p14', 1, 'Naturel'], ['p21', 2]], 'tana-centre', 'cod', 'attente', 'en_livraison', 'BIENVENUE10'],
    ['CMD-2026-001281', '2026-09-27 16:27', 'c3', [['p10', 3, 'Moulu'], ['p12', 2]], 'grandes-villes', 'airtel', 'paye', 'expediee', null],
    ['CMD-2026-001280', '2026-09-27 11:50', 'c5', [['p20', 1, 'Sable']], 'grandes-villes', 'virement', 'attente', 'a_preparer', null],
    ['CMD-2026-001279', '2026-09-26 18:34', 'c6', [['p6', 1]], 'autres', 'carte', 'echoue', 'annulee', null],
    ['CMD-2026-001278', '2026-09-26 10:12', 'c1', [['p10', 2, 'Grains'], ['p22', 1]], 'tana-centre', 'mvola', 'paye', 'livree', null],
    ['CMD-2026-001277', '2026-09-25 14:48', 'c8', [['p16', 1], ['p15', 1, 'L']], 'autres', 'mvola', 'paye', 'en_livraison', null],
    ['CMD-2026-001276', '2026-09-24 09:20', 'c2', [['p3', 1, 'Brun']], 'retrait', 'orange', 'paye', 'livree', null],
    ['CMD-2026-001275', '2026-09-23 17:05', 'c7', [['p7', 2, 'Noir']], 'tana-peri', 'cod', 'annule', 'retour', null],
    ['CMD-2026-001274', '2026-09-22 12:31', 'c3', [['p24', 3], ['p23', 1]], 'grandes-villes', 'airtel', 'rembourse', 'retour', null],
    ['CMD-2026-001269', '2026-09-12 15:40', 'c1', [['p18', 1], ['p19', 1]], 'tana-centre', 'orange', 'paye', 'livree', null]
  ];

  const promos = [
    { code: 'BIENVENUE10', type: 'pourcent', valeur: 10, min: 0, cible: 'Tout le site', cat: null, debut: '2026-01-01', fin: '2026-12-31', utilisations: 312, actif: true },
    { code: 'TANA5000', type: 'montant', valeur: 5000, min: 50000, cible: 'Tout le site', cat: null, debut: '2026-09-01', fin: '2026-10-31', utilisations: 87, actif: true },
    { code: 'SAVA15', type: 'pourcent', valeur: 15, min: 0, cible: 'Catégorie : Épicerie fine', cat: 'epicerie', debut: '2026-09-15', fin: '2026-10-15', utilisations: 41, actif: true },
    { code: 'RENTREE2026', type: 'pourcent', valeur: 20, min: 100000, cible: 'Catégorie : Téléphones & High-tech', cat: 'tech', debut: '2026-08-01', fin: '2026-09-15', utilisations: 129, actif: false }
  ];

  const avis = [
    { id: 'r1', produit: 'p9', client: 'Fanja R.', note: 5, date: '2026-09-20', texte: 'Gousses très parfumées et bien souples. Livraison rapide à Ankadifotsy. Je recommande !', statut: 'publie', achat: true },
    { id: 'r2', produit: 'p9', client: 'Tiana A.', note: 5, date: '2026-09-11', texte: 'Qualité exceptionnelle, conforme à la description. Emballage soigné.', statut: 'publie', achat: true },
    { id: 'r3', produit: 'p9', client: 'Mamy R.', note: 4, date: '2026-08-29', texte: 'Très bon produit, un peu cher mais la qualité est là.', statut: 'publie', achat: true },
    { id: 'r4', produit: 'p5', client: 'Njaka H.', note: 4, date: '2026-09-18', texte: 'Bon téléphone pour le prix, batterie correcte. Le vendeur a répondu vite à mes questions.', statut: 'publie', achat: true },
    { id: 'r5', produit: 'p5', client: 'Andry R.', note: 5, date: '2026-09-02', texte: 'Livré à Toliara en 5 jours, bien protégé. Parfait.', statut: 'publie', achat: true },
    { id: 'r6', produit: 'p1', client: 'Voahangy R.', note: 5, date: '2026-09-15', texte: 'La coupe est magnifique et le tissu de bonne qualité. Taille normalement.', statut: 'publie', achat: true },
    { id: 'r7', produit: 'p7', client: 'Lalao R.', note: 2, date: '2026-09-24', texte: 'Un des écouteurs grésille. En attente d’un échange avec le vendeur.', statut: 'en_attente', achat: true },
    { id: 'r8', produit: 'p21', client: 'Hery R.', note: 5, date: '2026-09-27', texte: 'Odeur très pure, flacon pratique avec compte-gouttes.', statut: 'en_attente', achat: true },
    { id: 'r9', produit: 'p14', client: 'Anonyme', note: 1, date: '2026-09-26', texte: 'Contactez-moi sur ce numéro pour des prix moins chers !!!', statut: 'en_attente', achat: false }
  ];

  const roles = [
    { id: 'super', nom: 'Super administrateur', acces: 'Tous les modules et paramètres', modules: ['*'] },
    { id: 'produits', nom: 'Gestionnaire produits', acces: 'Produits, catégories, stocks', modules: ['dashboard', 'produits', 'categories', 'promotions', 'stock', 'avis'] },
    { id: 'commandes', nom: 'Gestionnaire commandes', acces: 'Commandes, clients, livraison', modules: ['dashboard', 'commandes', 'clients', 'livraisons'] },
    { id: 'comptable', nom: 'Comptable', acces: 'Paiements, factures, rapports financiers', modules: ['dashboard', 'paiements', 'reversements', 'rapports', 'commandes'] },
    { id: 'livraison', nom: 'Gestionnaire livraison', acces: 'Préparation, expédition et suivi', modules: ['dashboard', 'commandes', 'livraisons'] },
    { id: 'vendeurs', nom: 'Gestionnaire marketplace', acces: 'Vendeurs, commissions, reversements, modération', modules: ['dashboard', 'vendeurs', 'reversements', 'avis', 'produits'] }
  ];
  const utilisateurs = [
    { id: 'u1', nom: 'Rindra Rakotomalala', email: 'rindra@site-ecommerce.mg', role: 'super', dernier: '2026-09-28 08:02', statut: 'actif', mfa: true },
    { id: 'u2', nom: 'Sitraka Andrianina', email: 'sitraka@site-ecommerce.mg', role: 'produits', dernier: '2026-09-28 07:45', statut: 'actif', mfa: true },
    { id: 'u3', nom: 'Onja Ramanantsoa', email: 'onja@site-ecommerce.mg', role: 'commandes', dernier: '2026-09-27 18:20', statut: 'actif', mfa: false },
    { id: 'u4', nom: 'Faly Rakotondrabe', email: 'faly@site-ecommerce.mg', role: 'comptable', dernier: '2026-09-27 16:11', statut: 'actif', mfa: true },
    { id: 'u5', nom: 'Tojo Randriamiarana', email: 'tojo@site-ecommerce.mg', role: 'livraison', dernier: '2026-09-28 06:58', statut: 'actif', mfa: false },
    { id: 'u6', nom: 'Miora Rasolofo', email: 'miora@site-ecommerce.mg', role: 'vendeurs', dernier: '2026-09-25 10:30', statut: 'suspendu', mfa: false }
  ];

  const journal = [
    ['2026-09-28 09:44', 'Onja Ramanantsoa', 'Commande', 'Statut CMD-2026-001284 : paiement confirmé (MVola, réf. MP260928.0942.A81)', '102.16.44.12'],
    ['2026-09-28 09:10', 'Système', 'Stock', 'Alerte seuil : Montre classique bracelet acier (3 ≤ 4)', '—'],
    ['2026-09-28 08:31', 'Sitraka Andrianina', 'Produit', 'Prix modifié : Écouteurs sans fil Bluetooth 55 000 → promo 45 000 Ar', '102.16.44.18'],
    ['2026-09-28 08:02', 'Rindra Rakotomalala', 'Connexion', 'Connexion réussie (double authentification)', '41.188.12.7'],
    ['2026-09-27 22:14', 'Système', 'Sécurité', '5 tentatives de connexion échouées — compte admin@… bloqué 15 min', '197.149.3.90'],
    ['2026-09-27 18:20', 'Onja Ramanantsoa', 'Livraison', 'CMD-2026-001282 remise au livreur (zone Antananarivo centre)', '102.16.44.12'],
    ['2026-09-27 16:40', 'Faly Rakotondrabe', 'Paiement', 'Remboursement CMD-2026-001274 : 68 500 Ar (Airtel Money)', '102.16.44.20'],
    ['2026-09-27 11:02', 'Miora Rasolofo', 'Vendeur', 'Nouvelle demande vendeur : Toamasina Import (dossier incomplet)', '102.16.44.25'],
    ['2026-09-26 18:36', 'Système', 'Paiement', 'Échec transaction carte CMD-2026-001279 (refus émetteur)', '—'],
    ['2026-09-26 09:00', 'Rindra Rakotomalala', 'Paramètres', 'Frais zone « Grandes villes » : 12 000 → 15 000 Ar', '41.188.12.7']
  ];

  const mouvements = [
    ['2026-09-28 09:42', 'p9', 'Réservation', -2, 'CMD-2026-001284', 'Système'],
    ['2026-09-28 08:15', 'p5', 'Réservation', -1, 'CMD-2026-001283', 'Système'],
    ['2026-09-27 15:00', 'p10', 'Entrée', 40, 'Bon de réception BR-0921', 'Saveurs de la SAVA'],
    ['2026-09-27 12:10', 'p8', 'Sortie', -6, 'CMD-2026-001265…1268', 'Système'],
    ['2026-09-26 10:30', 'p10', 'Sortie', -2, 'CMD-2026-001278', 'Système'],
    ['2026-09-25 17:45', 'p7', 'Retour', 2, 'CMD-2026-001275 (retour client)', 'Tojo Randriamiarana'],
    ['2026-09-25 09:00', 'p4', 'Ajustement', -1, 'Inventaire : article endommagé', 'Sitraka Andrianina'],
    ['2026-09-24 14:20', 'p21', 'Entrée', 30, 'Bon de réception BR-0917', 'Ylang Nosy Be']
  ];

  const reversements = [
    { id: 'RV-2026-0391', vendeur: 'v3', periode: '16–30 sept. 2026', brut: 706000, statut: 'a_payer', moyen: 'Virement BOA' },
    { id: 'RV-2026-0390', vendeur: 'v2', periode: '16–30 sept. 2026', brut: 2680000, statut: 'a_payer', moyen: 'Virement BNI' },
    { id: 'RV-2026-0389', vendeur: 'v1', periode: '16–30 sept. 2026', brut: 502000, statut: 'a_payer', moyen: 'MVola' },
    { id: 'RV-2026-0384', vendeur: 'v3', periode: '1–15 sept. 2026', brut: 830000, statut: 'paye', moyen: 'Virement BOA', date: '2026-09-17' },
    { id: 'RV-2026-0383', vendeur: 'v6', periode: '1–15 sept. 2026', brut: 353000, statut: 'paye', moyen: 'Orange Money', date: '2026-09-17' },
    { id: 'RV-2026-0382', vendeur: 'v4', periode: '1–15 sept. 2026', brut: 213000, statut: 'paye', moyen: 'MVola', date: '2026-09-17' }
  ];

  // Ventes des 30 derniers jours (déterministe)
  const ventes30 = Array.from({ length: 30 }, (_, i) => {
    const base = 1450000 + Math.round(Math.sin(i / 3.1) * 380000) + i * 21000 + ((i * 7919) % 5) * 100000;
    const d = new Date(2026, 7, 30 + i);
    return { date: d, ca: base, commandes: Math.round(base / 52000) };
  });

  // ---------- Construction ----------
  const P = id => produits.find(p => p.id === id);
  const prixUnit = p => (p.promo != null ? p.promo : p.prix);
  const commandes = rawOrders.map(o => {
    const lignes = o[3].map(l => { const p = P(l[0]); return { produit: l[0], qte: l[1], variante: l[2] || null, prix: prixUnit(p), vendeur: p.vendeur }; });
    const sousTotal = lignes.reduce((s, l) => s + l.prix * l.qte, 0);
    const zone = zones.find(z => z.id === o[4]);
    let remise = 0;
    if (o[8]) { const pr = promos.find(x => x.code === o[8]); remise = pr.type === 'pourcent' ? Math.round(sousTotal * pr.valeur / 100) : pr.valeur; }
    const frais = zone.frais;
    const hist = [{ date: o[1], statut: 'Commande créée', par: 'Client' }];
    const sp = o[6], sl = o[7];
    if (sp === 'initie') hist.push({ date: o[1], statut: 'Paiement initié', par: 'Système' });
    if (['paye', 'rembourse'].includes(sp)) hist.push({ date: o[1], statut: 'Paiement confirmé', par: 'Système' });
    if (sp === 'echoue') hist.push({ date: o[1], statut: 'Paiement échoué', par: 'Système' });
    if (['expediee', 'en_livraison', 'livree', 'retour'].includes(sl)) hist.push({ date: o[1], statut: 'Commande préparée et expédiée', par: 'Vendeur' });
    if (['en_livraison', 'livree'].includes(sl)) hist.push({ date: o[1], statut: 'Remise au livreur', par: 'Tojo Randriamiarana' });
    if (sl === 'livree') hist.push({ date: o[1], statut: 'Livrée', par: 'Livreur' });
    if (sl === 'retour') hist.push({ date: o[1], statut: 'Retour enregistré', par: 'Tojo Randriamiarana' });
    if (sp === 'rembourse') hist.push({ date: o[1], statut: 'Remboursement effectué', par: 'Faly Rakotondrabe' });
    if (sp === 'annule' || sl === 'annulee') hist.push({ date: o[1], statut: 'Commande annulée', par: 'Système' });
    return {
      numero: o[0], date: o[1], client: o[2], lignes, zone: o[4], paiement: o[5], statutPaiement: sp, statutLivraison: sl,
      codePromo: o[8], sousTotal, remise, frais, total: sousTotal - remise + frais, historique: hist,
      adresse: o[2] === 'c1' ? adresses[0] : null,
      refPaiement: ['paye', 'rembourse'].includes(sp) ? 'MP' + o[1].replace(/\D/g, '').slice(2, 12) : null
    };
  });

  return {
    categories, vendeurs, produits, credits, zones, regions, paiements, statutsPaiement, statutsLivraison,
    clients, adresses, commandes, promos, avis, roles, utilisateurs, journal, mouvements, reversements, ventes30
  };
})();
