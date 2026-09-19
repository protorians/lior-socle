# Changelog

## [Unreleased]

## [0.22.0] - 2026-09-18

### Changed
- **Renommage du manager sous la marque Liorian** : le manager et son package sont renommés `@liorian/socle` (dossier `frontend/liorian-socle`) ; toutes les références internes (scripts, CI, imports SDK, identifiants de modules `mod.liorian.*`) sont mises à jour.

## [0.21.0] - 2026-09-18

### Changed
- **Renommage du manager** : `frontend/sentient-socle` devient `frontend/liorian-socle` et le package `@sentients/socle` devient `@liorian/socle` ; toutes les références internes (scripts, CI, imports SDK) sont mises à jour.

## [0.20.1] - 2026-09-16

### Removed
- **Tests obsolètes du module auth** : suppression des fichiers `login-form.test.tsx` et `register-form.test.tsx` (reliquats de l'ancien manager, non maintenus et en décalage avec les composants et le SDK actuels).

## [0.20.0] - 2026-09-16

### Changed
- **Repointage vers le catalogue public** : `use-module-catalog` et les vues/widgets `modules-management` consomment désormais `StorefrontApiService` (`/catalog/modules`) et `CatalogModuleInterface` à la place de `ModuleStoreApiService`/`ModuleStoreCatalogItemInterface` ; la fusion des fiches catalogue dans les modules déclarés se fait sur l'identifiant canonique.

## [0.19.3] - 2026-09-16

### Changed
- **Manifest `hello-world`** : le module externe référence désormais le JSON Schema des manifestes (`$schema`) vers `@liorian/sdk/schemas/module.schema.json` pour bénéficier de la validation au sein de l'IDE et de l'outillage.

## [0.19.2] - 2026-09-16

### Changed
- **Métadonnées de modules dans les manifestes** : les informations `requirements`, `optionalRequirements`, `dependencies` et `devDependencies` sont retirées des déclarations de modules (`index.tsx`) et centralisées dans le `manifest.json` de chaque module ; ajout des manifestes manquants pour les modules du socle (`src/modules/*`) et complétion des manifestes des modules externes (`optionalRequirements`, `devDependencies`).

## [0.19.1] - 2026-09-15

### Changed
- **Migration des vues vers `View` et `Activity`** : toutes les vues applicatives, layouts de modules et fichiers du socle migrés vers la nouvelle disposition composée `View` (`View.Wrapper`, `View.Helmet`, `View.Frame`, `View.Status`) et `Activity` (`Activity.Container`, `Activity.Loader`) du SDK ; suppression des anciens composants locaux `Wrapper`/`Footer` du thème katon et ajout des fil d'ariane (`AutoBreadcrumb`) dans la barre de statut.

## [0.19.0] - 2026-09-14

### Added
- **Providers de layout dynamiques** : nouveau composant `ModulesLayoutProviders` rend les providers de layout déclarés par les modules (`providers.layout`) à la place de l'ancienne déclaration statique dans `layout.tsx`.
- **Module d'exemple `hello-world`** : module de démonstration complet (manifeste, service, routine, widget, provider de layout) servant d'exemple d'onboarding pour les développeurs de modules.
- **Agrégateur de modules externes** : `external_modules/index.tsx` centralise l'enregistrement des modules applicatifs (accounting, billing, blogging, calendar, crm, customer, ecommerce, hello-world, messenger, pos-management, project-management, restaurant, stock-management), consommé par un registre unique dans `modules.ts`.

### Changed
- **Renommage Manager → Socle** : le package `frontend/liorian-manager` (`@protorians/liorian-manager`) devient `frontend/liorian-socle` (`@liorian/socle`) — scripts racine, seed OAuth de `liorian-api-core`, cibles Tauri (Android/iOS) et références transverses alignées sur le nouveau nom.
- **Configuration des modules** : suppression de la liste statique `modules.config.tsx` et du délai d'enregistrement (`setTimeout`) ; la navigation (start menu, liste des modules) est désormais dérivée du store de modules (modules activés/désactivés).
- **Store UI** : `ModuleStoreHeader` consolidé (icône, titre, description et recherche intégrés) réutilisé par les vues explorateur et « Mes modules » ; boutons de synchronisation/publication temporairement désactivés.

## [0.18.1] - 2026-09-12

### Fixed
- **Filtre module des clients** : la valeur du `SelectItem` du filtre de modules n'est plus jamais vide, ce qui évitait un rendu invalide du composant Select du module customer.

## [0.18.0] - 2026-09-09

### Changed
- **Modules externalisés** : les modules applicatifs (accounting, billing, blogging, calendar, crm, customer, ecommerce, messenger, pos-management, project-management, restaurant, stock-management) sont déplacés de `src/modules/` vers `external_modules/`, avec imports relatifs, identifiants `mod.liorian.*` et alias de chemin `@liorian/module-*`.
- **Identifiant des modules** : `modules.config.tsx` et les déclarations de modules utilisent `identifier` à la place de `id`/`domain`.

## [0.17.1] - 2026-09-09

### Changed
- **Page d'accueil** : le spinner de chargement utilise désormais le composant `WaitingActivity` du SDK au lieu d'un spinner manuel.
- **Dashboard** : le nom du module dashboard renommé de « Dashboard » à « Tableau de board ».

## [0.17.0] - 2026-09-09

### Changed
- **Cartographie des modules** : les identifiants et dossiers des modules sont synchronisés avec le backend (refactor cassant).
