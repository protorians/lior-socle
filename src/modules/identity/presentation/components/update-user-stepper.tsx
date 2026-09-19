'use client';

import React, {Fragment} from 'react';
import {ModalStepperStep, useModalStepper} from '@liorian/sdk/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {
    PencilIcon,
    UserIcon,
    MailIcon,
    LockIcon,
    MapPinIcon,
    FlagIcon
} from "lucide-react";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {CreateUserInterface} from "@/modules/identity/domain/users.interface";
import {UserGenderEnum} from "@/modules/identity/domain/enums/user-gender.enum";
import {LegacyBirthDateInput} from "@liorian/sdk/presentation/ui/legacy-birth-date-input";
import {LegacyInput} from "@liorian/sdk/presentation/ui/legacy-input";
import {FieldGroup} from "@liorian/sdk/presentation/ui/field";
import {Textarea} from "@liorian/sdk/presentation/ui/textarea";
import {LegacyPhoneInput} from "@liorian/sdk/presentation/ui/legacy-phone-input";
import {LegacyGenderInput} from "@liorian/sdk/presentation/ui/legacy-gender-input";
import {LegacyCountryInput} from "@liorian/sdk/presentation/ui/legacy-country-input";
import {DropdownMenuItem} from "@liorian/sdk/presentation/ui/dropdown-menu";
import {UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {OrganizationInterface} from "@liorian/sdk/domain/entities/organization.interface";
import {toInitialCreateUserData} from "@/modules/identity/infrastructure/utilities/user-data.util";
import {MediaUploadStep} from "@/modules/identity/presentation/components/media-upload-step";


interface UpdateUserStepperProps {
    user: UserInterface;
    children: React.ReactNode;
}

export const getUpdateUserSteps = (
    user: UserInterface,
    currentOrganization: OrganizationInterface | null,
    updateDataRef: { current: (data: Partial<CreateUserInterface>) => void }
): ModalStepperStep<CreateUserInterface>[] => [
    {
        id: 'contact',
        required: true,
        title: 'Contact',
        description: 'Coordonnées de l\'utilisateur',
        validation: async (data, updateData) => {
            const response = await UsersApiService.findByContact({
                email: data.email,
                phone: data.phone,
                username: data.username,
                prefix: data.prefix,
            });
            if (response.data?.data && response.data.data.id !== user.id) {
                const found = response.data.data;
                updateData({
                    first_names: found.userData?.firstname || '',
                    last_name: found.userData?.lastname || '',
                    gender: found.userData?.gender as UserGenderEnum || undefined,
                    birthDate: found.userData?.birthDate
                        ? new Date(found.userData.birthDate).toISOString().split('T')[0]
                        : '',
                    country: found.userData?.country || '',
                    city: found.userData?.city || '',
                    address: found.userData?.address || '',
                });
                return {step: 'confirmation', lockNavigation: true};
            }
        },
        content: ({updateData, data}) => {
            updateDataRef.current = updateData;
            return (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <LegacyInput
                        id="email"
                        label="Email"
                        description="Adresse e-mail pour les notifications et la réinitialisation du mot de passe."
                        input={{
                            required: true,
                            type: "email",
                            placeholder: "jean.dupont@exemple.com",
                            value: data.email || '',
                            onChange: e => updateData({email: e.target.value}),
                        }}
                        icon={<MailIcon className="size-4 text-muted-foreground/60"/>}
                    />
                    <LegacyPhoneInput
                        id="phone"
                        label="Téléphone"
                        onCountryChange={e => updateData({prefix: e.dialCode})}
                        input={{
                            type: "tel",
                            placeholder: "07 00 00 00 00",
                            value: data.phone,
                            onChange: e => updateData({phone: e.target.value}),
                        }}
                    />
                    <LegacyInput
                        id="username"
                        label="Nom d'utilisateur"
                        description="Identifiant unique pour la connexion. Minuscules, sans espaces ni caractères spéciaux."
                        input={{
                            required: true,
                            type: "text",
                            placeholder: "jdupont",
                            value: data.username || '',
                            onChange: e => updateData({username: e.target.value}),
                        }}
                        icon={<UserIcon className="size-4 text-muted-foreground/60"/>}
                    />
                </FieldGroup>
            )
        }
    },
    {
        id: 'security',
        title: 'Sécurité',
        description: 'Changer le mot de passe (optionnel)',
        content: ({updateData, data}) => {
            updateDataRef.current = updateData;
            return (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LegacyInput
                            id="password"
                            label="Nouveau mot de passe"
                            description="8 caractères minimum, avec au moins un chiffre et une majuscule. Laissez vide pour conserver l'actuel."
                            input={{
                                required: false,
                                type: "password",
                                placeholder: "********",
                                value: data.password || '',
                                onChange: e => updateData({password: e.target.value}),
                            }}
                            icon={<LockIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="password_confirmation"
                            label="Confirmation"
                            description="Retapez le nouveau mot de passe pour confirmer."
                            input={{
                                required: false,
                                type: "password",
                                placeholder: "********",
                                value: data.password_confirmation || '',
                                onChange: e => updateData({password_confirmation: e.target.value}),
                            }}
                            icon={<LockIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </div>
                </FieldGroup>
            )
        }
    },
    {
        id: 'identity',
        required: true,
        title: 'Identité',
        description: 'Informations personnelles de l\'utilisateur',
        content: ({updateData, data}) => {
            updateDataRef.current = updateData;
            return (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <div className="grid grid-cols-1 gap-4">
                        <div className={"col-span-1"}>
                            <LegacyInput
                                id="first_names"
                                label="Prénoms"
                                description="Les prénoms tels qu'ils apparaîtront sur le profil utilisateur."
                                input={{
                                    type: "text",
                                    placeholder: "Jean",
                                    required: true,
                                    value: data.first_names || '',
                                    onChange: e => updateData({first_names: e.target.value}),
                                }}
                                icon={<UserIcon className="size-4 text-muted-foreground/60"/>}
                            />
                        </div>
                        <div className={"col-span-1"}>
                            <LegacyInput
                                id="last_name"
                                label="Nom de famille"
                                description="Le nom de famille de l'utilisateur."
                                input={{
                                    type: "text",
                                    placeholder: "Dupont",
                                    required: true,
                                    value: data.last_name || '',
                                    onChange: e => updateData({last_name: e.target.value}),
                                }}
                                icon={<UserIcon className="size-4 text-muted-foreground/60"/>}
                            />
                        </div>
                        <div className={"col-span-1"}>
                            <LegacyGenderInput
                                value={data.gender || ''}
                                onValueChange={(value) => updateData({gender: value as UserGenderEnum})}
                            />
                        </div>
                        <div className={"col-span-1"}>
                            <LegacyBirthDateInput
                                input={{
                                    required: true,
                                    value: data.birthDate || '',
                                    onChange: e => updateData({birthDate: e.target.value}),
                                }}
                            />
                        </div>
                    </div>
                </FieldGroup>
            )
        }
    },
    {
        id: 'contact_address',
        title: 'Contact & Adresse',
        description: 'Nationalité et localisation',
        content: ({updateData, data}) => {
            updateDataRef.current = updateData;
            return (
                <FieldGroup className="gap-4 max-w-lg mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LegacyCountryInput
                            id="country"
                            label="Nationnalité"
                            description="Le pays d'origine de l'utilisateur."
                            value={data.country}
                            onCountryChange={e => updateData({country: e.code})}
                            icon={<FlagIcon className="size-4 text-muted-foreground/60"/>}
                        />
                        <LegacyInput
                            id="city"
                            label="Ville"
                            description="La ville de résidence de l'utilisateur."
                            input={{
                                type: "text",
                                placeholder: "Paris",
                                value: data.city || '',
                                onChange: e => updateData({city: e.target.value}),
                            }}
                            icon={<MapPinIcon className="size-4 text-muted-foreground/60"/>}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Adresse</label>
                        <Textarea
                            value={data.address || ''}
                            onChange={(e) => updateData({address: e.target.value})}
                            placeholder="123 Rue de Rivoli"
                            rows={2}
                        />
                    </div>
                </FieldGroup>
            )
        }
    },
    {
        id: 'media',
        title: 'Documents',
        description: 'Avatar et pièce d\'identité (optionnel)',
        content: ({data, updateData}) => {
            updateDataRef.current = updateData;
            return (
                <MediaUploadStep data={data} updateData={updateData}/>
            )
        }
    },
    {
        id: 'confirmation',
        title: 'Confirmation',
        description: 'Vérifiez les informations avant la modification',
        content: ({data}) => (
            <div className={''}>
                <div className="flex flex-col gap-y-6 p-4 bg-muted rounded text-sm space-y-4">
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Contact</div>
                        <p><strong>Email :</strong> {data.email || 'N/A'}</p>
                        <p><strong>Téléphone :</strong> {data.phone || 'N/A'}</p>
                        <p><strong>Nom d'utilisateur :</strong> {data.username || 'N/A'}</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Sécurité</div>
                        <p><strong>Mot de passe :</strong> {data.password ? '•'.repeat(8) : 'Non modifié'}</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Identité</div>
                        <p><strong>Prénoms :</strong> {data.first_names || 'N/A'}</p>
                        <p><strong>Nom :</strong> {data.last_name || 'N/A'}</p>
                        <p><strong>Genre :</strong> {data.gender || 'N/A'}</p>
                        <p><strong>Date de naissance :</strong> {data.birthDate || 'N/A'}</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Contact & Adresse</div>
                        <p><strong>Nationalité :</strong> {data.country || 'N/A'}</p>
                        <p><strong>Ville :</strong> {data.city || 'N/A'}</p>
                        <p><strong>Adresse :</strong> {data.address || 'N/A'}</p>
                    </div>
                    <div>
                        <div className="text-lg font-bold border-b pb-1 mb-2">Documents</div>
                        <p><strong>Avatar :</strong> {data.avatar ? 'Téléversé' : 'Non fourni'}</p>
                        <p><strong>Recto :</strong> {data.idRecto ? 'Téléversé' : 'Non fourni'}</p>
                        <p><strong>Verso :</strong> {data.idVerso ? 'Téléversé' : 'Non fourni'}</p>
                        <p><strong>Selfie :</strong> {data.selfie ? 'Téléversé' : 'Non fourni'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                        <p><strong>Organisation :</strong> {currentOrganization?.name || 'N/A'}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Les modifications seront appliquées à l'utilisateur
                    dans l'organisation <strong>{currentOrganization?.name}</strong>.
                </p>
            </div>
        )
    }
];

export const handleUpdateUser = async (
    user: UserInterface,
    currentOrganization: OrganizationInterface | null,
    queryClient: QueryClient,
    openStepper: ReturnType<typeof useModalStepper<CreateUserInterface>>
) => {
    const updateDataRef = {current: (data: Partial<CreateUserInterface>) => {}};
    const steps = getUpdateUserSteps(user, currentOrganization, updateDataRef);

    try {
        await openStepper({
            steps,
            title: "Modification de l'utilisateur",
            initialData: toInitialCreateUserData(user),
            onEnd: async ({data}) => {
                if (!user?.id) {
                    throw new Error("Utilisateur non identifié. Impossible de modifier l'utilisateur.");
                }

                const payload: Partial<CreateUserInterface> = {...(data as CreateUserInterface)};
                if (!payload.password) {
                    delete payload.password;
                    delete payload.password_confirmation;
                }

                const updated = await UsersApiService.update(user.id, payload);

                if (!updated.data?.data || updated.data.error) {
                    throw new Error(updated.data?.message || "Une erreur est survenue lors de la modification de l'utilisateur.");
                }

                await queryClient.invalidateQueries({queryKey: ['users', 'activities', 'table']});
                toast.success(`Utilisateur ${data.first_names || ''} ${data.last_name || ''} modifié avec succès dans l'organisation ${currentOrganization?.name}`);
            }
        });
    } catch (error) {
        console.error('Stepper Error:', error);
        toast.error("Une erreur est survenue lors de la modification de l'utilisateur.");
    }
};

export function UpdateUserStepper({user, children}: UpdateUserStepperProps) {
    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateUserInterface>({
        size: 'XXL'
    });

    return (
        <div onClick={() => handleUpdateUser(user, currentOrganization || null, queryClient, openStepper)}>
            {children}
        </div>
    );
}
