# grist-widgets

Custom widgets for Grist.

## fiche-eleve-pHARe-Montaigne

Fiche de suivi par élève pour la table `T2026_2027` (dispositif pHARe, collège Montaigne).

En-tête avec le logo du collège et le logo du programme pHARe (images hébergées dans `assets/`).
Le corps affiche les champs de la ligne sélectionnée, regroupés par section : identité, repérage,
entretiens, communication, suivi et actions.

**Utilisation dans Grist** : ajouter une page/widget lié à la table `T2026_2027`, choisir le type
**Custom URL**, et pointer vers `fiche-eleve-pHARe-Montaigne/index.html` (servi via GitHub Pages ou
un serveur local).

## Déploiement (GitHub Pages)

Le déploiement passe par une GitHub Action (`.github/workflows/deploy-pages.yml`) déclenchée à chaque
push sur `main` : elle inscrit dans le footer du widget un numéro de version (le nombre de commits du
repo, `git rev-list --count HEAD`), puis publie le repo tel quel sur GitHub Pages.

À faire une seule fois côté GitHub : Settings → Pages → Build and deployment → Source, choisir
**GitHub Actions** (et non "Deploy from a branch"). L'URL du widget reste
`https://rthoyer.github.io/grist-widgets/fiche-eleve-pHARe-Montaigne/index.html`.
