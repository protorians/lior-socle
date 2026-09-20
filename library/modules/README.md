# Modules Externes

Ce dossier est destiné à recevoir les modules dynamiques externes.

## Structure d'un module
Un module doit suivre la structure standard du projet :
- `application/` : Services et cas d'utilisation
- `domain/` : Entités et interfaces
- `infrastructure/` : Adaptateurs et stores
- `presentation/` : Composants UI et vues

## Installation
1. Copiez votre module dans ce dossier.
2. Rendez-vous sur la page `/store` du dashboard.
3. Cliquez sur "Installer un module".
4. Remplissez les informations (ID, Nom, URL, Icône).
5. Activez le module pour le voir apparaître dans la barre latérale.

## Routing
N'oubliez pas d'ajouter les routes correspondantes dans `src/app/` si le module nécessite de nouvelles pages.
