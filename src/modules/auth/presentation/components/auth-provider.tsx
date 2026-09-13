"use client"

// Le système d'authentification est factorisé dans le SDK (`@sentients/sdk`)
// et partagé entre toutes les applications consommatrices (manager, connect, …).
// Ce fichier ne fait que ré-exporter l'implémentation canonique.
export {AuthProvider} from "@sentients/sdk/infrastructure/providers/auth.provider";
export type {AuthProviderProps} from "@sentients/sdk/infrastructure/providers/auth.provider";