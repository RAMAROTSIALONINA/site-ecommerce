# Site E_commerce — Maquette marketplace Madagascar

Maquette UX/UI complète et navigable de la plateforme e-commerce décrite dans le
[cahier des charges](Cahier_des_charges_Site_Ecommerce_Madagascar.pdf) (version 1.0, 28/09/2026),
étendue en **marketplace multi-vendeurs**.

> Toutes les données (produits, vendeurs, clients, commandes) sont **fictives**.
> Les paiements Mobile Money et carte sont **simulés**.

## Accès

- **Sommaire de tous les écrans** : `maquette/sommaire.html`
- **Site client** : `maquette/index.html`
- **Back-office administration** : `maquette/admin/index.html`
- **Espace vendeur** : `maquette/vendeur/index.html`

En ligne (GitHub Pages) : `https://ramarotsialonina.github.io/site-ecommerce/`

En local : ouvrir `maquette/index.html` dans un navigateur, ou lancer
`python -m http.server 8765 --directory maquette` puis ouvrir http://localhost:8765.

## Contenu

| Espace | Écrans |
|---|---|
| Front-Office (mobile-first) | Accueil, catalogue / catégories / recherche / promotions, fiche produit, panier groupé par vendeur, checkout 4 étapes (adresse avec fokontany et repère, zone de livraison, paiement MVola / Orange Money / Airtel Money / carte / virement / à la livraison), connexion / inscription / code SMS, compte client (commandes, suivi, paiements, adresses, favoris, avis, profil), facture PDF, boutiques, page boutique, devenir vendeur, CGV, confidentialité, livraison & retours, à propos, contact |
| Back-Office admin | Tableau de bord, commandes (détail, sous-commandes, statuts, remboursement), paiements, livraisons (kanban + zones tarifaires), clients, produits (fiche complète avec variantes et SEO), catégories, promotions, stock (réservations, mouvements), avis (modération), vendeurs (validation, commission), reversements, utilisateurs & rôles (matrice de permissions, simulation par rôle), rapports, journal d’activité, paramètres |
| Espace vendeur | Tableau de bord, sous-commandes et préparation, produits (soumis à validation), stock, revenus & reversements, avis, paramètres boutique |

## Charte

Fond clair et translucide (verre dépoli), couleur primaire `#0F766E`, accent promotion `#EA580C`,
typographies Plus Jakarta Sans et Inter. Points de rupture : < 768 px, 768–1199 px, ≥ 1200 px.

## Technique

HTML / CSS / JavaScript sans dépendance ni build. Les données de démonstration sont dans
`maquette/assets/js/data.js` ; le panier, les commandes passées et les favoris sont conservés
dans le `localStorage` du navigateur (bouton « Réinitialiser » dans le sommaire).
