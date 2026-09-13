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

## fiche-projet-ecole-ouverte

Fiche de suivi par projet pour la table `Projets` (dispositif École ouverte, collège Montaigne).

En-tête avec le logo du collège, l'intitulé de l'action, l'année scolaire / session (résolues depuis
la table liée `Sessions`) et le cadre de l'action (badge EPI / Projet de classe). Le corps reprend les
rubriques de la fiche projet papier : classes concernées / effectif / encadrants, lien avec le projet
d'établissement, parcours éducatifs, modalités, calendrier, besoins matériels, évaluation, et budget
prévisionnel (montant global + détail).

**Utilisation dans Grist** : ajouter une page/widget lié à la table `Projets`, choisir le type
**Custom URL**, pointer vers `fiche-projet-ecole-ouverte/index.html`, et autoriser l'accès complet au
document (nécessaire pour résoudre les références vers la table `Sessions`).

## Déploiement (GitHub Pages)

Le déploiement passe par une GitHub Action (`.github/workflows/deploy-pages.yml`) déclenchée à chaque
push sur `main` : elle inscrit dans le footer de chaque widget un numéro de version (le nombre de
commits du repo, `git rev-list --count HEAD`), puis publie le repo tel quel sur GitHub Pages.
