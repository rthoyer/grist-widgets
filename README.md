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

## offre-data-besoins

Liste des besoins du document « Offre data », regroupés par méta-catégorie (tables `Besoin`,
`Categories`, `Meta_categorie`). Fond blanc, bloc-marque « Gouvernement » en haut à gauche,
titre = nom du document Grist (si l'API REST l'autorise), police Marianne. Le titre est modifiable :
double-clic dessus (ou « Ouvrir la configuration » du widget), puis Entrée ; il est stocké dans les options du widget. Dans chaque
méta-catégorie, les besoins sont listés sur une colonne et regroupés par catégorie (ordre des tables) ;
les besoins sans catégorie sont listés dans « Autres besoins ».

**Utilisation dans Grist** : ajouter un widget **Custom URL** pointant vers `offre-data-besoins/index.html`,
le lier de préférence à la table `Besoin` (il se rafraîchit à chaque modification de cette table), et
autoriser l'accès complet au document.

## offre-data-slide

Une « slide » 16:9 par méta-catégorie : bloc-marque en haut à gauche, titre de la méta-catégorie, besoins
regroupés par catégorie sur une colonne (police réduite pour que tout tienne, colonnes seulement en dernier recours). La
méta-catégorie se choisit dans la liste déroulante, avec les boutons ‹ › ou les flèches du clavier.
Imprimable (une page au format slide).

**Utilisation dans Grist** : widget **Custom URL** vers `offre-data-slide/index.html`, accès complet au
document. S'il est lié à la table `Meta_categorie`, la slide suit la ligne sélectionnée.

**Édition en place** (les deux widgets) : double-clic sur un texte (titre ou nom de méta-catégorie, catégorie,
besoin), puis Entrée pour enregistrer directement dans la table Grist correspondante, Échap pour annuler.

Les deux widgets partagent `shared/` : la police Marianne et le bloc-marque extraits du
[DSFR](https://github.com/GouvernementFR/dsfr) (`shared/dsfr/`), et le chargement des données (`shared/offre-data.js`).

## Déploiement (GitHub Pages)

Le déploiement passe par une GitHub Action (`.github/workflows/deploy-pages.yml`) déclenchée à chaque
push sur `main` : elle inscrit dans le footer de chaque widget un numéro de version (le nombre de
commits du repo, `git rev-list --count HEAD`), puis publie le repo tel quel sur GitHub Pages.
