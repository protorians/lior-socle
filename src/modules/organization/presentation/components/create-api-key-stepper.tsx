'use client';

import React from 'react';
import {Button} from '@liorian/sdk/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@liorian/sdk/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {KeyRoundIcon, PlusIcon} from 'lucide-react';
import {OrganizationsApiService} from '@liorian/sdk/application/service/organizations-api-service';
import {LegacyInput} from '@liorian/sdk/presentation/ui/legacy-input';
import {FieldGroup} from '@liorian/sdk/presentation/ui/field';
import {QueryClient, useQueryClient} from '@tanstack/react-query';

interface CreateApiKeyFormData {
    expiredAt?: string;
}

export function CreateApiKeyStepper({organizationId}: { organizationId: string }) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateApiKeyFormData>({
        size: 'LG',
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, organizationId)} size="sm" className="gap-2">
            <PlusIcon className="size-4"/>
            Générer une clé
        </Button>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<CreateApiKeyFormData>>,
    queryClient: QueryClient,
    organizationId: string
) {
    const steps: ModalStepperStep<CreateApiKeyFormData>[] = [
        {
            id: 'details',
            required: true,
            title: 'Clé API',
            description: 'Optionnellement, définissez une date d’expiration',
            content: ({updateData, data}) => (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacyInput
                        id="api-key-expiry"
                        label="Date d’expiration"
                        description="Laissez vide pour une clé sans expiration."
                        input={{
                            type: 'date',
                            value: data.expiredAt || '',
                            onChange: e => updateData({expiredAt: e.target.value}),
                        }}
                        icon={<KeyRoundIcon className="size-4 text-muted-foreground/60"/>}
                    />
                </FieldGroup>
            ),
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Confirmez la génération de la clé',
            content: ({data}) => (
                <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4 max-w-lg mx-auto">
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Clé API</div>
                        <p><strong>Expiration :</strong> {data.expiredAt || 'Jamais'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Une paire clé publique / secret sera générée. Conservez le secret en lieu sûr.
                    </p>
                </div>
            ),
        },
    ];

    try {
        await openStepper({
            steps,
            title: 'Générer une clé API',
            initialData: {},
            onEnd: async ({data}) => {
                const created = await OrganizationsApiService.createApiKey(organizationId, {
                    ...(data.expiredAt ? {expiredAt: new Date(data.expiredAt).toISOString()} : {}),
                });
                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || 'Erreur lors de la génération de la clé.');
                }
                toast.success('Clé API générée avec succès');
                await queryClient.invalidateQueries({queryKey: ['organizations', organizationId, 'api-keys']});
            },
        });
    } catch (error) {
        console.error('Create API Key Stepper Error:', error);
        toast.error('Erreur lors de la génération de la clé API.');
    }
}
