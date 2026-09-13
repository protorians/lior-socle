'use client';

import React, {useEffect, useRef} from 'react';
import {Button, buttonVariants} from '@sentients/sdk/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@sentients/sdk/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {Building2Icon, PencilIcon, PlusIcon} from 'lucide-react';
import {VariantProps} from 'class-variance-authority';
import {OrganizationsApiService} from '@sentients/sdk/application/service/organizations-api-service';
import {LegacyInput} from '@sentients/sdk/presentation/ui/legacy-input';
import {FieldGroup} from '@sentients/sdk/presentation/ui/field';
import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {
    MODULE_ICONS,
    MODULE_LABELS,
    MODULE_OPTIONS,
    ModuleEnum,
} from '@sentients/sdk/domain/enums/module.enum';
import {
    CreateOrganizationPayload,
    OrganizationInterface,
} from '@sentients/sdk/domain/entities/organization.interface';
import {DynamicIcon} from '@sentients/sdk/presentation/components/dynamic-icon';
import {Badge} from '@sentients/sdk/presentation/ui/badge';
import {cn} from '@sentients/sdk/infrastructure/utilities/utils';

type OrganizationFormData = CreateOrganizationPayload & { enabledModules: ModuleEnum[] };

export interface CreateOrganizationStepperProps {
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    label?: string;
    className?: string;
}

export function CreateOrganizationStepper({variant = 'default', size = 'lg', label, className}: CreateOrganizationStepperProps) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<OrganizationFormData>({
        size: 'LG',
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, null)} variant={variant} size={size} className={className}>
            <PlusIcon/>
            {label ?? 'Nouvelle organisation'}
        </Button>
    );
}

export function EditOrganizationStepper({organization, autoOpen}: { organization: OrganizationInterface; autoOpen?: boolean }) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<OrganizationFormData>({
        size: 'LG',
    });

    const hasOpened = useRef(false);

    useEffect(() => {
        if (autoOpen && !hasOpened.current) {
            hasOpened.current = true;
            handleOpen(openStepper, queryClient, organization);
        }
    }, [autoOpen, organization]);

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, organization)} variant="outline" size="sm" className="gap-2">
            <PencilIcon className="size-4"/>
            Modifier
        </Button>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<OrganizationFormData>>,
    queryClient: QueryClient,
    editing: OrganizationInterface | null
) {
    const isEditing = !!editing;
    const initialData: Partial<OrganizationFormData> = editing
        ? {
            name: editing.name,
            description: editing.description ?? '',
            enabledModules: (editing.enabledModules as ModuleEnum[]) ?? [],
        }
        : {name: '', description: '', enabledModules: []};

    const steps: ModalStepperStep<OrganizationFormData>[] = [
        {
            id: 'details',
            required: true,
            title: 'Informations',
            description: 'Nom et description de l’organisation',
            content: ({updateData, data}) => (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacyInput
                        id="org-name"
                        label="Nom"
                        description="Nom affiché de l’organisation."
                        input={{
                            required: true,
                            type: 'text',
                            placeholder: 'Sentient Core',
                            value: data.name || '',
                            onChange: e => updateData({name: e.target.value}),
                        }}
                        icon={<Building2Icon className="size-4 text-muted-foreground/60"/>}
                    />
                    <LegacyInput
                        id="org-description"
                        label="Description"
                        description="Brève description de l’organisation."
                        input={{
                            type: 'text',
                            placeholder: 'Organisation principale du système',
                            value: data.description || '',
                            onChange: e => updateData({description: e.target.value}),
                        }}
                    />
                </FieldGroup>
            ),
        },
        {
            id: 'modules',
            title: 'Modules',
            description: 'Activez les fonctionnalités de l’organisation',
            content: ({updateData, data}) => {
                const selected = data.enabledModules ?? [];
                const toggle = (module: ModuleEnum) => {
                    const next = selected.includes(module)
                        ? selected.filter(m => m !== module)
                        : [...selected, module];
                    updateData({enabledModules: next});
                };
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MODULE_OPTIONS.map((option) => {
                            const active = selected.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggle(option.value)}
                                    className={cn(
                                        'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                                        active
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border hover:bg-muted/40'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'size-9 rounded-lg flex items-center justify-center shrink-0',
                                            active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        <DynamicIcon name={option.icon} className="size-4"/>
                                    </span>
                                    <span className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm font-medium leading-tight">{option.label}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-2">{option.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Vérifiez les informations avant enregistrement',
            content: ({data}) => {
                const modules = data.enabledModules ?? [];
                return (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Organisation</div>
                            <p><strong>Nom :</strong> {data.name || 'N/A'}</p>
                            <p><strong>Description :</strong> {data.description || '—'}</p>
                            <p><strong>Modules :</strong> {modules.length}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {modules.map(m => (
                                    <Badge key={m} variant="secondary" className="gap-1">
                                        <DynamicIcon name={MODULE_ICONS[m]} className="size-3"/>
                                        {MODULE_LABELS[m] ?? m}
                                    </Badge>
                                ))}
                                {modules.length === 0 && <span className="text-muted-foreground">Aucun module</span>}
                            </div>
                        </div>
                    </div>
                );
            },
        },
    ];

    try {
        await openStepper({
            steps,
            title: isEditing ? 'Modifier l’organisation' : 'Nouvelle organisation',
            initialData,
            onEnd: async ({data}) => {
                if (isEditing && editing?.id) {
                    const updated = await OrganizationsApiService.updateOrganization(editing.id, {
                        name: data.name,
                        description: data.description,
                        enabledModules: data.enabledModules,
                    });
                    if (!updated.data?.data || updated.data.error) {
                        throw new Error(updated.data?.message || 'Erreur lors de la mise à jour.');
                    }
                    toast.success(`Organisation « ${data.name} » modifiée avec succès`);
                } else {
                    const created = await OrganizationsApiService.create({
                        name: data.name,
                        description: data.description,
                        enabledModules: data.enabledModules,
                    });
                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || 'Erreur lors de la création.');
                    }
                    toast.success(`Organisation « ${data.name} » créée avec succès`);
                }
                await queryClient.invalidateQueries({queryKey: ['organizations']});
            },
        });
    } catch (error) {
        console.error('Organization Stepper Error:', error);
        toast.error('Erreur lors de l’enregistrement de l’organisation.');
    }
}
