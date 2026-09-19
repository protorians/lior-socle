"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Switch} from "@liorian/sdk/presentation/ui/switch";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {AccessControlApiService} from "@/modules/access-control/application/service/access-control-api.service";
import {
    PermissionCapabilityInterface,
    PermissionsCapabilitiesInterface,
    RoleInterface,
    UserInterface,
} from "@liorian/sdk/domain/entities/user.interface";
import {OrganizationInterface} from "@liorian/sdk/domain/entities/organization.interface";
import {toast} from "sonner";
import {useQueryClient} from "@tanstack/react-query";
import {KeyRoundIcon, LoaderIcon, SaveIcon, ShieldIcon} from "lucide-react";
import {getDomainLabel, getRoleLabel} from "@liorian/sdk/infrastructure/utilities/access-label.util";

type CapabilityKey = "read" | "create" | "update" | "delete";

const CAPABILITY_LABELS: {key: CapabilityKey; label: string}[] = [
    {key: "read", label: "Lecture"},
    {key: "create", label: "Création"},
    {key: "update", label: "Modification"},
    {key: "delete", label: "Suppression"},
];

export interface UserRolesAccessModalProps {
    user: UserInterface;
    organization: OrganizationInterface | null;
    close: () => void;
}

interface RoleSelectionState {
    enabled: boolean;
    permissions: PermissionsCapabilitiesInterface;
}

const extractRoles = (response: any): RoleInterface[] => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const clonePermissions = (permissions?: PermissionsCapabilitiesInterface): PermissionsCapabilitiesInterface =>
    JSON.parse(JSON.stringify(permissions || {}));

const getRoleKey = (role: RoleInterface): string => role.id ?? role.name;

/** Tri hiérarchique : niveaux décroissants (Root en premier, visiteur en dernier) */
const sortRolesByLevel = (roles: RoleInterface[]): RoleInterface[] =>
    [...roles].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));

const formatRoleLevel = (role: RoleInterface): string =>
    (role.level ?? 0).toFixed(2);

const permissionsChanged = (a: PermissionsCapabilitiesInterface, b: PermissionsCapabilitiesInterface): boolean => {
    const domains = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const domain of domains) {
        const capsA = a[domain];
        const capsB = b[domain];
        for (const capability of CAPABILITY_LABELS) {
            if (!!capsA?.[capability.key] !== !!capsB?.[capability.key]) return true;
        }
    }
    return false;
};

export function UserRolesAccessModal({user, organization, close}: UserRolesAccessModalProps) {
    const queryClient = useQueryClient();

    const [roles, setRoles] = useState<RoleInterface[]>([]);
    const [selection, setSelection] = useState<Record<string, RoleSelectionState>>({});
    const [initialAssignedIds, setInitialAssignedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!user.id || !organization?.id) {
                setLoading(false);
                return;
            }

            try {
                const [rolesRes, userRolesRes] = await Promise.all([
                    AccessControlApiService.getRolesByOrg(organization.id),
                    AccessControlApiService.getUserRolesInOrg(user.id, organization.id),
                ]);

                const allRoles = extractRoles(rolesRes);
                const userRoles = extractRoles(userRolesRes);
                const assignedIds = new Set(userRoles.filter(role => role.id).map(role => role.id as string));

                const nextSelection: Record<string, RoleSelectionState> = {};
                for (const role of allRoles) {
                    nextSelection[getRoleKey(role)] = {
                        enabled: assignedIds.has(getRoleKey(role)),
                        permissions: clonePermissions(role.permissions),
                    };
                }

                if (!active) return;

                setRoles(sortRolesByLevel(allRoles));
                setInitialAssignedIds(assignedIds);
                setSelection(nextSelection);
            } catch (error) {
                toast.error("Impossible de charger les rôles et permissions de l'organisation");
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [user.id, organization?.id]);

    const toggleRole = (roleId: string, enabled: boolean) => {
        setSelection(prev => ({
            ...prev,
            [roleId]: {...prev[roleId], enabled},
        }));
    };

    const toggleCapability = (roleId: string, domain: string, capability: CapabilityKey) => {
        setSelection(prev => {
            const current = prev[roleId];
            if (!current) return prev;

            const permissions = clonePermissions(current.permissions);
            const domainCaps: PermissionCapabilityInterface = {
                read: !!permissions[domain]?.read,
                create: !!permissions[domain]?.create,
                update: !!permissions[domain]?.update,
                delete: !!permissions[domain]?.delete,
            };
            domainCaps[capability] = !domainCaps[capability];
            permissions[domain] = domainCaps;

            return {...prev, [roleId]: {...current, permissions}};
        });
    };

    const handleSave = async () => {
        if (!user.id || !organization?.id) {
            toast.warning("Aucune organisation sélectionnée");
            return;
        }

        setSaving(true);
        try {
            for (const role of roles) {
                const roleKey = getRoleKey(role);
                const state = selection[roleKey];
                if (!state) continue;

                const wasAssigned = initialAssignedIds.has(roleKey);
                const isAssigned = state.enabled;

                if (isAssigned && !wasAssigned) {
                    await AccessControlApiService.assignRole({
                        userId: user.id,
                        organizationId: organization.id,
                        roleId: role.id ?? role.name,
                        permissions: state.permissions,
                    });
                } else if (!isAssigned && wasAssigned) {
                    await AccessControlApiService.removeAssignment({
                        userId: user.id,
                        organizationId: organization.id,
                        roleId: role.id ?? role.name,
                    });
                } else if (isAssigned && wasAssigned && permissionsChanged(state.permissions, role.permissions || {})) {
                    await AccessControlApiService.assignRole({
                        userId: user.id,
                        organizationId: organization.id,
                        roleId: role.id ?? role.name,
                        permissions: state.permissions,
                    });
                }
            }

            toast.success("Les rôles et accès ont été mis à jour avec succès");
            await queryClient.invalidateQueries({queryKey: ['users', 'activities', 'table']});
            close();
        } catch (error) {
            toast.error("Une erreur est survenue lors de la mise à jour des rôles et accès");
        } finally {
            setSaving(false);
        }
    };

    const totalEnabled = Object.values(selection).filter(state => state?.enabled).length;

    return (
        <div className="flex flex-col w-full h-full max-h-[60dvh]">
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
                        <LoaderIcon className="size-8 animate-spin"/>
                        <span className="text-sm">Chargement des rôles et permissions...</span>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
                        <KeyRoundIcon className="size-8 text-muted-foreground/30 mb-2"/>
                        <span className="text-sm text-muted-foreground italic">
                            Aucun rôle n'est configuré dans cette organisation
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {roles.map(role => {
                            const roleKey = getRoleKey(role);
                            const state = selection[roleKey] || {
                                enabled: false,
                                permissions: clonePermissions(role.permissions),
                            };
                            const domainEntries = Object.entries(state.permissions || {}).filter(
                                ([, caps]) => caps?.read || caps?.create || caps?.update || caps?.delete
                            );

                            return (
                                <div
                                    key={roleKey}
                                    className="border border-border/60 rounded-lg overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/30">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ShieldIcon className="size-4 text-primary shrink-0"/>
                                            <span className="text-sm font-semibold truncate">{getRoleLabel(role.name)}</span>
                                            <Badge
                                                variant="outline"
                                                className="px-1.5 text-muted-foreground tabular-nums shrink-0"
                                                title={`Niveau hiérarchique : ${formatRoleLevel(role)}`}
                                            >
                                                {formatRoleLevel(role)}
                                            </Badge>
                                        </div>
                                        <Switch
                                            checked={!!state.enabled}
                                            onCheckedChange={(checked) => toggleRole(roleKey, !!checked)}
                                        />
                                    </div>

                                    {state.enabled && (
                                        <div className="divide-y divide-border/50">
                                            {domainEntries.length === 0 && (
                                                <div className="px-4 py-3 text-xs text-muted-foreground italic">
                                                    Aucune permission définie pour ce rôle
                                                </div>
                                            )}
                                            {domainEntries.map(([domain, caps]) => (
                                                <div
                                                    key={domain}
                                                    className="flex items-center justify-between gap-4 px-4 py-3"
                                                >
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        {getDomainLabel(domain)}
                                                    </Badge>
                                                    <div className="flex items-center gap-4">
                                                        {CAPABILITY_LABELS.map(({key, label}) => (
                                                            <label
                                                                key={key}
                                                                className="flex flex-col items-center gap-1 cursor-pointer"
                                                            >
                                                                <span className="text-[10px] text-muted-foreground uppercase leading-none">
                                                                    {label}
                                                                </span>
                                                                <Switch
                                                                    size="sm"
                                                                    checked={!!caps?.[key]}
                                                                    onCheckedChange={() =>
                                                                        toggleCapability(roleKey, domain, key)
                                                                    }
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                    {loading ? "" : `${totalEnabled} rôle${totalEnabled > 1 ? "s" : ""} activé${totalEnabled > 1 ? "s" : ""}`}
                </span>
                <div className="flex gap-2">
                    <Button variant="ghost" size="lg" onClick={close} disabled={saving} className="rounded-sm!">
                        Annuler
                    </Button>
                    <Button size="lg" onClick={handleSave} disabled={saving || loading} className="rounded-sm!">
                        {saving ? <LoaderIcon className="animate-spin"/> : <SaveIcon/>}
                        Enregistrer
                    </Button>
                </div>
            </div>
        </div>
    );
}
