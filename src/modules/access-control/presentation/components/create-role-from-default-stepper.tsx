'use client';

import {toast} from 'sonner';
import {useQueryClient} from '@tanstack/react-query';
import {ShieldCheckIcon, Settings2Icon, XIcon, CheckIcon} from 'lucide-react';

import {ModalStepperStep, useModalStepper} from '@liorian/sdk/presentation/modals/components/ModalStepper';
import {LegacyInput} from '@liorian/sdk/presentation/ui/legacy-input';
import {FieldGroup} from '@liorian/sdk/presentation/ui/field';
import {Checkbox} from '@liorian/sdk/presentation/ui/checkbox';
import {Badge} from '@liorian/sdk/presentation/ui/badge';
import {Button} from '@liorian/sdk/presentation/ui/button';
import {cn} from '@liorian/sdk/infrastructure/utilities/utils';
import {getDomainLabel, getRoleLabel} from '@liorian/sdk/infrastructure/utilities/access-label.util';
import {DomainsEnum} from '@liorian/sdk/domain/enums/domains.enum';

import {AccessControlApiService} from '@/modules/access-control/application/service/access-control-api.service';
import {PermissionsCapabilitiesInterface} from '@/modules/access-control/domain/entities/roles.interface';
import {AccessControlRow} from '../components/access-control-columns';

export interface CreateRoleFromDefaultInterface {
    name: string
    color?: string
    level?: number
    permissions: PermissionsCapabilitiesInterface
}

const DEFAULT_LEVEL = 0
const MIN_LEVEL = 0
const MAX_LEVEL = 99.99
const MAX_CUSTOM_LEVEL = 99.98

const CRUD = [
    {key: 'create', label: 'C', title: 'Créer'},
    {key: 'read', label: 'L', title: 'Lire'},
    {key: 'update', label: 'M', title: 'Modifier'},
    {key: 'delete', label: 'S', title: 'Supprimer'},
] as const

const ALL_DOMAINS = Object.values(DomainsEnum)

function buildPermissions(perms: PermissionsCapabilitiesInterface = {}): PermissionsCapabilitiesInterface {
    const result: PermissionsCapabilitiesInterface = {}
    for (const domain of ALL_DOMAINS) {
        result[domain] = {
            create: !!perms[domain]?.create,
            read: !!perms[domain]?.read,
            update: !!perms[domain]?.update,
            delete: !!perms[domain]?.delete,
        }
    }
    return result
}

function countPermissions(perms?: PermissionsCapabilitiesInterface): number {
    if (!perms) return 0
    return Object.values(perms).reduce(
        (acc, cap) => acc +
            (cap.create ? 1 : 0) +
            (cap.read ? 1 : 0) +
            (cap.update ? 1 : 0) +
            (cap.delete ? 1 : 0),
        0
    )
}

function PermissionsStepContent({
    data,
    updateData,
}: {
    data: Partial<CreateRoleFromDefaultInterface>
    updateData: (partial: Partial<CreateRoleFromDefaultInterface>) => void
}) {
    const perms = data.permissions ?? {}

    const setCapability = (domain: string, key: (typeof CRUD)[number]['key'], value: boolean) => {
        updateData({
            permissions: {
                ...perms,
                [domain]: {
                    ...perms[domain],
                    [key]: value,
                },
            },
        })
    }

    const toggleAllForDomain = (domain: string, checked: boolean) => {
        updateData({
            permissions: {
                ...perms,
                [domain]: {create: checked, read: checked, update: checked, delete: checked},
            },
        })
    }

    const hasAny = (domain: string) => {
        const cap = perms[domain]
        return !!(cap?.create || cap?.read || cap?.update || cap?.delete)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                    {countPermissions(perms)} permission(s) accordée(s)
                </p>
                <Badge variant="outline" className="px-1.5">
                    {ALL_DOMAINS.length} domaines
                </Badge>
            </div>
            <div className="max-h-[46dvh] overflow-y-auto pr-1 space-y-1.5">
                {ALL_DOMAINS.map(domain => {
                    const cap = perms[domain]
                    return (
                        <div key={domain} className="rounded-lg border bg-background">
                            <div className="flex items-center justify-between gap-2 px-3 py-2">
                                <div className="flex items-center gap-2 text-left flex-1">
                                    <span
                                        className={cn(
                                            'size-2 rounded-full shrink-0',
                                            hasAny(domain) ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                        )}
                                    />
                                    <span className={cn('text-sm', !hasAny(domain) && 'text-muted-foreground')}>
                                        {getDomainLabel(domain)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-3 mr-1">
                                        {CRUD.map(({key, label, title}) => (
                                            <label key={key} className="flex items-center gap-1.5" title={title}>
                                                <Checkbox
                                                    checked={!!cap?.[key]}
                                                    onCheckedChange={checked => setCapability(domain, key, checked === true)}
                                                />
                                                <span className="text-xs text-muted-foreground">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => toggleAllForDomain(domain, !hasAny(domain))}
                                    >
                                        {hasAny(domain) ? <><XIcon className="size-3"/> Aucun</> : <><CheckIcon className="size-3"/> Tout</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function handleCreateRoleFromDefault(
    role: AccessControlRow,
    organizationId: string | undefined,
    openStepper: ReturnType<typeof useModalStepper<CreateRoleFromDefaultInterface>>,
    queryClient: ReturnType<typeof useQueryClient>,
) {
    const baseLabel = getRoleLabel(role.name)

    const steps: ModalStepperStep<CreateRoleFromDefaultInterface>[] = [
        {
            id: 'informations',
            required: true,
            title: 'Informations',
            description: "Nom, niveau et couleur du rôle",
            content: ({data, updateData}) => (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacyInput
                        id="name"
                        label="Nom du rôle"
                        description="Donnez un nom clair à ce nouveau rôle"
                        input={{
                            required: true,
                            type: "text",
                            placeholder: "Ex: Chef de cuisine",
                            value: data.name || '',
                            onChange: e => updateData({name: e.target.value}),
                        }}
                        icon={<ShieldCheckIcon className="size-4 text-muted-foreground/60"/>}
                    />
                    <LegacyInput
                        id="level"
                        label="Niveau"
                        description={`Niveau hiérarchique (${MIN_LEVEL} à ${MAX_CUSTOM_LEVEL} — ${MAX_LEVEL} réservé à Root)`}
                        input={{
                            type: "number",
                            min: MIN_LEVEL,
                            max: MAX_CUSTOM_LEVEL,
                            step: "0.01",
                            value: data.level ?? DEFAULT_LEVEL,
                            onChange: e => {
                                const parsed = parseFloat(e.target.value)
                                updateData({level: Number.isNaN(parsed) ? undefined : parsed})
                            },
                        }}
                        icon={<Settings2Icon className="size-4 text-muted-foreground/60"/>}
                    />
                    <div>
                        <label htmlFor="color" className="text-sm font-medium mb-1.5 block">
                            Couleur
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative size-9 overflow-hidden rounded-lg border">
                                <input
                                    id="color"
                                    type="color"
                                    value={data.color || '#22c55e'}
                                    onChange={e => updateData({color: e.target.value})}
                                    className="absolute -inset-1 size-12 cursor-pointer"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {data.color ? 'Couleur personnalisée' : 'Couleur par défaut'}
                            </span>
                        </div>
                    </div>
                </FieldGroup>
            )
        },
        {
            id: 'permissions',
            required: true,
            title: 'Permissions',
            description: 'Définissez les droits sur chaque domaine',
            content: ({data, updateData}) => (
                <PermissionsStepContent data={data} updateData={updateData}/>
            )
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Vérifiez avant de créer le rôle',
            content: ({data}) => {
                const perms = data.permissions ?? {}
                const permsCount = countPermissions(perms)
                const enabledDomains = ALL_DOMAINS.filter(d => {
                    const cap = perms[d]
                    return !!(cap?.create || cap?.read || cap?.update || cap?.delete)
                }).length
                return (
                    <div>
                        <div className="flex flex-col gap-y-5 p-4 bg-muted rounded text-sm">
                            <div>
                                <div className="text-lg font-bold border-b pb-1 mb-2">Rôle</div>
                                <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                                <p>
                                    <strong>Niveau :</strong>{' '}
                                    <span className="tabular-nums">{(data.level ?? DEFAULT_LEVEL).toFixed(2)}</span>
                                </p>
                                <p><strong>Permissions :</strong> {permsCount} sur {ALL_DOMAINS.length * 4}</p>
                                <p><strong>Domaines actifs :</strong> {enabledDomains} sur {ALL_DOMAINS.length}</p>
                            </div>
                            {enabledDomains > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_DOMAINS.filter(d => {
                                        const cap = perms[d]
                                        return !!(cap?.create || cap?.read || cap?.update || cap?.delete)
                                    }).map(d => (
                                        <Badge key={d} variant="outline" className="px-1.5">
                                            {getDomainLabel(d)}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        },
    ]

    return openStepper({
        steps,
        title: `Créer un rôle depuis « ${baseLabel} »`,
        initialData: {
            name: `${baseLabel} (copie)`,
            level: role.level && role.level > MAX_CUSTOM_LEVEL ? MAX_CUSTOM_LEVEL : (role.level ?? DEFAULT_LEVEL),
            color: role.color,
            permissions: buildPermissions(role.permissions),
        },
        onEnd: async ({data}) => {
            if (!data.name?.trim()) throw new Error("Le nom du rôle est requis.")
            if (!organizationId) throw new Error("Aucune organisation sélectionnée.")

            const payload = {
                name: data.name.trim(),
                level: Math.min(data.level ?? DEFAULT_LEVEL, MAX_CUSTOM_LEVEL),
                color: data.color || undefined,
                status: true,
                permissions: data.permissions ?? {},
                organizationId,
            }

            const created = await AccessControlApiService.createCustomRole(payload)
            if (!created.data?.data || created.data.error) {
                throw new Error(created.data?.message || "Une erreur est survenue lors de la création du rôle.")
            }

            await queryClient.invalidateQueries({queryKey: ['access-control']})
            toast.success(`Le rôle « ${payload.name} » a été créé avec succès`)
        },
    })
}
