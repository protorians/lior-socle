/** Permissions CRUD d'un utilisateur ou rôle sur un domaine donné. */
export interface PermissionCapabilityInterface {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

/** Tableau de permissions indexé par domaine. */
export type PermissionsCapabilitiesInterface = Record<string, PermissionCapabilityInterface>;

/** Entité rôle telle que retournée par l'API access-control. */
export interface RoleInterface {
    id?: string;
    name: string;
    color?: string;
    /** Niveau hiérarchique : 0.00 (visiteur) à 99.99 (Root) */
    level?: number;
    permissions?: PermissionsCapabilitiesInterface;
    status?: boolean;
    deletedAt?: Date | string | null;
    organizationId?: string;
}

export interface RolesSummaryMetadataInterface{
    name: string;
    color: string;
    description?: string;
    /** Niveau hiérarchique : 0.00 (visiteur) à 99.99 (Root) */
    level?: number;
}

export interface RolesSummaryStatsInterface{
    totalDomains: number;
    creatable: number;
    readable: number;
    updatable: number;
    deletable: number;
    fullAccess: number;
    blocked: number;
}

export interface RolesSummaryInterface{
    metadata: RolesSummaryMetadataInterface;
    stats: RolesSummaryStatsInterface;
}

export type RolesSummaryType = {
    [Role: string]: RolesSummaryInterface
}


