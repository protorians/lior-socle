"use client"

// Le système d'authentification est factorisé dans le SDK (`@liorian/sdk`)
// et partagé entre toutes les applications consommatrices (manager, connect, …).
// Ce fichier ne fait que ré-exporter l'implémentation canonique.
export {AuthProvider} from "@liorian/sdk/infrastructure/providers/auth.provider";
export type {AuthProviderProps} from "@liorian/sdk/infrastructure/providers/auth.provider";