'use client';

import React from 'react';
import {Button} from '@sentients/sdk/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@sentients/sdk/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {UserPlusIcon} from 'lucide-react';
import {OrganizationsApiService} from '@sentients/sdk/application/service/organizations-api-service';
import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {UserInterface} from '@sentients/sdk/domain/entities/user.interface';
import {getFullName} from '@/modules/identity/infrastructure/utilities/users-name.util';

interface AddMemberFormData {
    userId?: string;
}

function displayName(user?: UserInterface): string {
    if (!user) return 'N/A';
    const full = getFullName(user);
    return full !== 'N/A' ? full : user.username || user.email || 'Utilisateur';
}

export function AddMemberStepper({organizationId, users}: { organizationId: string; users: UserInterface[] }) {
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<AddMemberFormData>({
        size: 'LG',
    });

    return (
        <Button onClick={() => handleOpen(openStepper, queryClient, organizationId, users)} size="sm" className="gap-2">
            <UserPlusIcon className="size-4"/>
            Ajouter un membre
        </Button>
    );
}

async function handleOpen(
    openStepper: ReturnType<typeof useModalStepper<AddMemberFormData>>,
    queryClient: QueryClient,
    organizationId: string,
    users: UserInterface[]
) {
    const steps: ModalStepperStep<AddMemberFormData>[] = [
        {
            id: 'member',
            required: true,
            title: 'Membre',
            description: 'Sélectionnez un utilisateur à ajouter',
            content: ({updateData, data}) => (
                <div className="flex flex-col gap-1.5 max-w-lg mx-auto">
                    <label className="text-sm font-medium">Utilisateur</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={data.userId || ''}
                        onChange={e => updateData({userId: e.target.value || undefined})}
                        required
                    >
                        <option value="">Sélectionner un utilisateur…</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {displayName(user)} {user.email ? `(${user.email})` : ''}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-muted-foreground">
                        L’utilisateur aura accès à l’organisation et à ses modules activés.
                    </span>
                </div>
            ),
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Confirmez l’ajout du membre',
            content: ({data}) => {
                const selected = users.find(u => u.id === data.userId);
                return (
                    <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4 max-w-lg mx-auto">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Membre</div>
                            <p><strong>Utilisateur :</strong> {displayName(selected)}</p>
                            <p><strong>Email :</strong> {selected?.email || 'N/A'}</p>
                        </div>
                    </div>
                );
            },
        },
    ];

    try {
        await openStepper({
            steps,
            title: 'Ajouter un membre',
            initialData: {},
            onEnd: async ({data}) => {
                if (!data.userId) throw new Error('Veuillez sélectionner un utilisateur.');
                const created = await OrganizationsApiService.addMember(organizationId, {userId: data.userId});
                if (!created.data?.data || created.data.error) {
                    throw new Error(created.data?.message || 'Erreur lors de l’ajout du membre.');
                }
                toast.success('Membre ajouté avec succès');
                await queryClient.invalidateQueries({queryKey: ['organizations', organizationId, 'members']});
            },
        });
    } catch (error) {
        console.error('Add Member Stepper Error:', error);
        toast.error('Erreur lors de l’ajout du membre.');
    }
}
