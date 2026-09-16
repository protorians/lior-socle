# Sentient Socle

Interface de gestion (manager) de la plateforme **Sentient**. Elle permet d'administrer des organisations, leurs utilisateurs, accès, médiathèque, notifications et modules métiers, sur le web comme en application de bureau (Tauri).

Périmètre du projet : le code applicatif sous `src/`. Les modules métiers livrés séparément sont dans `external_modules/` (voir plus bas).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict).
- **Tailwind CSS 4** + design system `@sentients/sdk`.
- Données : `@tanstack/react-query` + `@tanstack/react-table`.
- État : `zustand`.
- Desktop & mobile : **Tauri 2** (export statique).
- UI (textes, libellés, erreurs) en **français**.

## Architecture

Application modulaire : chaque fonctionnalité métier est un module à 4 couches sous `src/modules/<module>/`.

```
<module>/
  application/      # services API, cas d'utilisation
  domain/           # interfaces, enums, payloads
  infrastructure/   # adapters, routines, stores, utilitaires
  presentation/     # components/, views/ (*.view.tsx), widgets/ (*.widget.tsx)
  index.tsx         # déclaration du module (ModuleDeclarationInterface)
```

- Enregistrement des modules : `src/modules.ts` (`ModulesDefinition`).
- Navigation : pilotée par le store `useModuleStore` (`@sentients/sdk/infrastructure/stores/module.store`) à partir des modules activés.
- Routes publiques : déclarées dans `src/bootstrapper.ts` (`/intl`), authentification gérée par les providers du SDK (`AuthProvider`, `AuthGuard`, routes `/auth/*`).

### Modules internes (`src/modules/`)

| Module | Rôle |
|---|---|
| `dashboard` | Tableau de bord personnalisable |
| `organization` | Organisations : membres, API keys, thèmes, types de documents, préférences |
| `identity` | Utilisateurs |
| `access-control` | Rôles, permissions, audit |
| `notification` | Notifications |
| `media-library` | Médiathèque (cloud) |
| `user-activity` | Journal d'activité des utilisateurs |
| `account` | Compte utilisateur : profil, sécurité, notifications |
| `modules-management` | Store de modules : explorateur, installation, réglages |
| `auth` | Authentification SSO (routes `/auth/*`) |

### Modules externalisés (`external_modules/`)

Modules métiers fournis à part, branchés via des alias `@sentients/module-*` et le store de modules : `accounting`, `billing`, `blogging`, `calendar`, `crm`, `customer`, `ecommerce`, `messenger`, `pos-management`, `project-management`, `restaurant`, `stock-management`.

## Démarrage

Prérequis : Node ≥ 22, **Bun**, [mkcert](https://github.com/FiloSottile/mkcert).

Application servie sur `https://localhost:5010` (HTTPS de dev via mkcert).

## Configuration `.env`

Le fichier de configuration de l'application vit dans `frontend/sentient-socle/.env` (non versionné — `.env` est ignoré par git). Les variables `NEXT_PUBLIC_*` y sont définies localement et exposées au navigateur.

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| `NEXT_PUBLIC_ENCRYPTION_KEY` | Clé de chiffrement locale de l'application | — |
| `NEXT_PUBLIC_CORE_API_HOST` | Hôte de l'API | `https://localhost:5711/api` |
| `NEXT_PUBLIC_CORE_SOCKET_HOST` | Hôte WebSocket | `wss://localhost:5010` |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout des appels API (ms) | `30000` |
| `NEXT_PUBLIC_AUTH_HOST` | Hôte d'authentification SSO | `https://localhost:5050` |
| `NEXT_PUBLIC_AUTH_CLIENT_ID` | Client OAuth de l'app (défaut SDK : `sentient-socle`) | `sentient-socle` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique Web Push (VAPID) — générer via `npx web-push generate-vapid-keys` | — |
| `NEXT_PUBLIC_APP_SLUG`, `NEXT_PUBLIC_APP_NAME` | Identité de l'application | `app.sentient.manager`, `Sentient` |
| `NEXT_PUBLIC_APP_HOST` | Hôte public de l'application | `https://localhost:5010` |
| `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_APP_VERSION_NUMBER` | Version affichée | `0.0.1`, `1` |
| `NEXT_PUBLIC_UI_REFRESH_TIMEOUT`, `NEXT_PUBLIC_APP_REFRESH_UI` | Cadence de rafraîchissement de l'UI (ms) | `30000` |
| `NEXT_PUBLIC_AUTH_CHECK_SESSION_TIMEOUT` | Fréquence de vérification de session (ms) | `60000` |
| `NEXT_PUBLIC_UI_ACTIVITY_TRACKER_TIMEOUT` | Timeout du tracker d'activité UI (ms) | `300000` |

## Scripts (`bun`)

| Script | Description |
|---|---|
| `dev` | Dev server Next.js (port 5010, HTTPS) |
| `build` | Build Next.js — export statique (`out/`) |
| `build:tauri` | Build statique pré-Tauri |
| `test` / `test:watch` | Tests unitaires (Vitest + Testing Library) |
| `test:e2e` | Tests de bout en bout (Playwright) |
| `tauri:dev` | Application desktop Tauri en développement |
| `tauri:build` | Compilation de l'application desktop (installeurs) |
| `version:sync` | Synchronisation de la version du package |

## Desktop & mobile (Tauri)

Le build Tauri repose sur l'**export statique** Next.js (`output: 'export'`, dossier `out/`), généré par `scripts/build-tauri.ts` puis servi par Tauri via son protocole `tauri://localhost`.

- Desktop : `bun run tauri:dev` (charge `http://localhost:5010`) ; `bun run tauri:build` (installeurs DMG/MSI/deb/rpm).
- Mobile : `bun tauri android init` / `bun tauri ios init`.
- Configuration : `src-tauri/tauri.conf.json` (`frontendDist: ../out`), CSP et permissions IPC restreintes (`src-tauri/capabilities/*`) — accès shell/réseau/fichiers non accordés par défaut.
- L'API est atteinte **directement** (pas de proxy). En mobile ou sur un appareil distant, `localhost` pointe vers l'appareil : renseigner l'IP de la machine de dev dans `NEXT_PUBLIC_CORE_API_HOST` et la CSP correspondante.

## Tests

- Unitaires : Vitest + Testing Library (`src/setupTests.ts`, tests dans `src/**/__tests__/`).
- E2E : Playwright (`playwright.config.ts`, specs dans `e2e/`).

## Conventions

- **Sélection de fichiers** : tout choix de fichier passe par `MediaPickerDialog` (`src/core/presentation/components/media-picker-dialog.tsx`), jamais un input fichier direct. Voir `docs/conventions/media-picker.md`.
- **Libellés d'upload** : format `<module>:<section>[.<type>]`, tout en minuscules, la section étant déduite du MIME par `MediaLabelService.sectionFor()`.

  Interface :

  ```typescript
  export interface MediaUploadOptions {
      section?: string;
      module?: string;
      type?: string;
      isDocument?: boolean; // Si document, sinon détection automatique
  }
  ```

  | Appel | Libellé généré |
  |---|---|
  | `resolve('blogging', {type: 'image/png'})` | `blogging:image` |
  | `resolve('blogging', {type: 'image/png'}, 'cover')` | `blogging:image.cover` |
  | `resolve('identity', {type: 'application/pdf'}, 'user')` | `identity:document.user` |
  | `resolve('restaurant', {type: 'video/mp4'})` | `restaurant:video` |
  | `build('crm', 'document')` | `crm:document` |

  Les flux `POST /storages/upload` et `PUT /storages/:id` exposent `module` (obligatoire pour la génération automatique) et `type` (optionnel). Un `label` explicite transmis par le client reste prioritaire.

- **Lecteur multimédia** : `MediaPlayer` unifié du SDK (audio, vidéo, note vocale). Voir `docs/conventions/media-player.md`.
- **Commits** : commits logiques par domaine/objectif ; le format est défini dans le skill `sentient-commit`. Après changement de code, exécuter `bun run version:sync`.
- **Documentation** : toute ajout ou modification de fonctionnalité doit maintenir `docs/` à jour.

## Documentation complémentaire

- Conventions : `docs/conventions/*.md`
- Historique des versions : `CHANGELOG.md`