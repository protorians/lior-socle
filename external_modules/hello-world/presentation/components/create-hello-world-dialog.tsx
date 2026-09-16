"use client";

import React from 'react';
import {Button} from '@sentients/sdk/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@sentients/sdk/presentation/modals/components/ModalStepper';
import {LegacyInput} from '@sentients/sdk/presentation/ui/legacy-input';
import {LegacySelectInput} from '@sentients/sdk/presentation/ui/legacy-select-input';
import {FieldGroup} from '@sentients/sdk/presentation/ui/field';
import {Textarea} from '@sentients/sdk/presentation/ui/textarea';
import {toast} from 'sonner';
import {MessageCircleIcon, PlusIcon, SendIcon, UserIcon} from 'lucide-react';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@sentients/sdk/infrastructure/hooks/use-auth';
import {HelloWorldApiService} from '../../application/service/hello-world-api-service';
import {CreateHelloWorldInterface, HelloWorldInterface} from '../../domain/hello-world.interface';
import {HelloWorldStatus} from '../../domain/enums/hello-world-status.enum';

const STATUS_OPTIONS: { value: HelloWorldStatus; label: string }[] = [
    {value: HelloWorldStatus.DRAFT, label: 'Brouillon'},
    {value: HelloWorldStatus.PUBLISHED, label: 'Publié'},
    {value: HelloWorldStatus.ARCHIVED, label: 'Archivé'},
];

export function CreateHelloWorldDialog() {
    const {currentOrganization} = useAuth();
    const openStepper = useModalStepper<CreateHelloWorldInterface>({size: 'XL'});

    const handleOpenStepper = async () => {
        const steps: ModalStepperStep<CreateHelloWorldInterface>[] = [
            {
                id: 'content',
                required: true,
                title: 'Contenu',
                description: 'Titre, message et auteur de la salutation',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacyInput
                            id="title"
                            label="Titre"
                            description="Ex. : Salutation du bonjour"
                            input={{
                                required: true,
                                type: "text",
                                placeholder: "Bonjour le monde !",
                                value: data.title || '',
                                onChange: e => updateData({title: e.target.value}),
                            }}
                            icon={<MessageCircleIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <Textarea
                                value={data.message || ''}
                                onChange={(e) => updateData({message: e.target.value})}
                                placeholder={"Hello, world ! Ce module est un exemple d'onboarding."}
                                rows={4}
                            />
                        </div>
                        <LegacyInput
                            id="author"
                            label="Auteur"
                            input={{
                                type: "text",
                                placeholder: "Jean Dupont",
                                value: data.author || '',
                                onChange: e => updateData({author: e.target.value}),
                            }}
                            icon={<UserIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'status',
                required: true,
                title: 'Statut',
                description: 'État initial de la salutation',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <LegacySelectInput
                            id="status"
                            label="Statut"
                            placeholder="Sélectionner"
                            required
                            value={data.status || HelloWorldStatus.DRAFT}
                            onValueChange={(value) => updateData({status: value as HelloWorldStatus})}
                            options={STATUS_OPTIONS}
                            icon={<SendIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </FieldGroup>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez les informations avant la création',
                content: ({data}) => (
                    <div className="flex flex-col gap-y-4 p-4 bg-muted rounded text-sm">
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Salutation</div>
                            <p><strong>Titre :</strong> {data.title || 'N/A'}</p>
                            <p><strong>Message :</strong> {data.message || 'N/A'}</p>
                            <p><strong>Auteur :</strong> {data.author || 'N/A'}</p>
                        </div>
                        <div>
                            <div className="text-lg font-bold border-b pb-1 mb-2">Statut</div>
                            <p>
                                {STATUS_OPTIONS.find(option => option.value === (data.status || HelloWorldStatus.DRAFT))?.label ?? data.status}
                            </p>
                        </div>
                        <div className="mt-2 pt-3 border-t border-border">
                            <p><strong>Organisation :</strong> {currentOrganization?.name || 'N/A'}</p>
                        </div>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: "Créer une salutation",
                initialData: {status: HelloWorldStatus.DRAFT},
                onEnd: async ({data}) => {
                    const created = await HelloWorldApiService.create({
                        title: data.title || 'Hello World',
                        message: data.message || '',
                        author: data.author,
                        status: data.status || HelloWorldStatus.DRAFT,
                    });
                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Une erreur est survenue lors de la création.");
                    }
                    toast.success("Salutation créée avec succès");
                }
            });
        } catch (error) {
            console.error('Create Hello World Error:', error);
            toast.error("Une erreur est survenue lors de la création.");
        }
    };

    return (
        <Button onClick={handleOpenStepper} variant="default" size="lg">
            <PlusIcon/>
            Ajouter une salutation
        </Button>
    );
}

export async function handleEditHelloWorld(item: HelloWorldInterface, queryClient: any) {
    const openStepper = useModalStepper<CreateHelloWorldInterface>({size: 'XL'});
    const toast = (await import('sonner')).toast;

    const steps: ModalStepperStep<CreateHelloWorldInterface>[] = [
        {
            id: 'content',
            required: true,
            title: 'Contenu',
            description: 'Titre, message et auteur de la salutation',
            content: ({updateData, data}) => (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacyInput
                        id="title"
                        label="Titre"
                        input={{
                            required: true,
                            type: "text",
                            value: data.title || '',
                            onChange: e => updateData({title: e.target.value}),
                        }}
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <Textarea
                            value={data.message || ''}
                            onChange={(e) => updateData({message: e.target.value})}
                            rows={4}
                        />
                    </div>
                    <LegacyInput
                        id="author"
                        label="Auteur"
                        input={{
                            type: "text",
                            value: data.author || '',
                            onChange: e => updateData({author: e.target.value}),
                        }}
                    />
                </FieldGroup>
            )
        },
        {
            id: 'status',
            required: true,
            title: 'Statut',
            description: 'État de la salutation',
            content: ({updateData, data}) => (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacySelectInput
                        id="status"
                        label="Statut"
                        placeholder="Sélectionner"
                        required
                        value={(data.status || item.status) as HelloWorldStatus}
                        onValueChange={(value) => updateData({status: value as HelloWorldStatus})}
                        options={STATUS_OPTIONS}
                    />
                </FieldGroup>
            )
        },
    ];

    try {
        await openStepper({
            steps,
            title: "Modifier la salutation",
            initialData: {
                title: item.title,
                message: item.message,
                author: item.author || undefined,
                status: item.status,
            },
            onEnd: async ({data}) => {
                const updated = await HelloWorldApiService.update(item.id, {
                    title: data.title || item.title,
                    message: data.message,
                    author: data.author,
                    status: data.status || item.status,
                });
                if (!updated.data?.data || updated.data.error) {
                    throw new Error(updated.data?.message || "Une erreur est survenue lors de la modification.");
                }
                toast.success("Salutation modifiée avec succès");
                queryClient.invalidateQueries({queryKey: ['hello-world']});
            }
        });
    } catch (error) {
        console.error('Edit Hello World Error:', error);
        toast.error("Une erreur est survenue lors de la modification.");
    }
}