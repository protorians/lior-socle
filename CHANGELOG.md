# Changelog

## [Unreleased]

## [0.18.1] - 2026-09-12

### Fixed
- **Filtre module des clients** : la valeur du `SelectItem` du filtre de modules n'est plus jamais vide, ce qui évitait un rendu invalide du composant Select du module customer.

## [0.18.0] - 2026-09-09

### Changed
- **Modules externalisés** : les modules applicatifs (accounting, billing, blogging, calendar, crm, customer, ecommerce, messenger, pos-management, project-management, restaurant, stock-management) sont déplacés de `src/modules/` vers `external_modules/`, avec imports relatifs, identifiants `mod.sentients.*` et alias de chemin `@sentients/module-*`.
- **Identifiant des modules** : `modules.config.tsx` et les déclarations de modules utilisent `identifier` à la place de `id`/`domain`.

## [0.17.1] - 2026-09-09

### Changed
- **Page d'accueil** : le spinner de chargement utilise désormais le composant `WaitingActivity` du SDK au lieu d'un spinner manuel.
- **Dashboard** : le nom du module dashboard renommé de « Dashboard » à « Tableau de board ».

## [0.17.0] - 2026-09-09

### Changed
- **Cartographie des modules** : les identifiants et dossiers des modules sont synchronisés avec le backend (refactor cassant).
