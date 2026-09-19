'use client';

import React, {Fragment} from 'react';
import {Button} from '@liorian/sdk/presentation/ui/button';
import {ModalStepperStep, useModalStepper} from '@liorian/sdk/presentation/modals/components/ModalStepper';
import {toast} from 'sonner';
import {
    PlusIcon,
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
import {MediaUploadStep} from "@/modules/identity/presentation/components/media-upload-step";


export function CreateUserStepper() {
    const {currentOrganization} = useAuth();
    const openStepper = useModalStepper<CreateUserInterface>({
        size: 'XXL'
    });

    const handleOpenStepper = async () => {
        const steps: ModalStepperStep<CreateUserInterface>[] = [
            {
                id: 'contact',
                required: true,
                title: 'Contact',
                description: 'Coordonnées de l\'utilisateur',
                validation: async (data, updateData) => {
                    const response = await UsersApiService.findByContact({
                        email: data.email,
                        phone: data.phone,
                        prefix: data.prefix,
                        username: data.username,
                    });
                    if (response.data?.data) {
                        const user = response.data.data;
                        updateData({
                            first_names: user.userData?.firstname || '',
                            last_name: user.userData?.lastname || '',
                            gender: user.userData?.gender as UserGenderEnum || undefined,
                            birthDate: user.userData?.birthDate
                                ? new Date(user.userData.birthDate).toISOString().split('T')[0]
                                : '',
                            country: user.userData?.country || '',
                            city: user.userData?.city || '',
                            address: user.userData?.address || '',
                        });
                        return {step: 'confirmation', lockNavigation: true};
                    }
                },
                content: ({updateData, data}) => (
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
            },
            {
                id: 'security',
                required: true,
                title: 'Sécurité',
                description: 'Mot de passe de connexion',
                content: ({updateData, data}) => (
                    <FieldGroup className="gap-4 max-w-lg mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LegacyInput
                                id="password"
                                label="Mot de passe"
                                description="8 caractères minimum, avec au moins un chiffre et une majuscule."
                                input={{
                                    required: true,
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
                                description="Retapez le mot de passe pour confirmer."
                                input={{
                                    required: true,
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
            },
            {
                id: 'identity',
                required: true,
                title: 'Identité',
                description: 'Informations personnelles de l\'utilisateur',
                content: ({updateData, data}) => (
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
            },
            {
                id: 'contact_address',
                title: 'Contact & Adresse',
                description: 'Nationalité et localisation',
                content: ({updateData, data}) => (
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
            },
            {
                id: 'media',
                title: 'Documents',
                description: 'Avatar et pièce d\'identité (optionnel)',
                content: ({data, updateData}) => (
                    <MediaUploadStep data={data} updateData={updateData}/>
                )
            },
            {
                id: 'confirmation',
                title: 'Confirmation',
                description: 'Vérifiez les informations avant la création',
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
                                <p><strong>Mot de passe :</strong> {'•'.repeat(8)}</p>
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
                            L'utilisateur sera créé et rattaché à
                            l'organisation <strong>{currentOrganization?.name}</strong>.
                        </p>
                    </div>
                )
            },
        ];

        try {
            await openStepper({
                steps,
                title: "Assistant de Création d'utilisateur",
                initialData: {},
                onEnd: async ({data}) => {
                    if (!currentOrganization?.id) {
                        throw new Error("Organisation non identifiée. Impossible de créer l'utilisateur.");
                    }

                    const created = await UsersApiService.create({
                        ...(data as CreateUserInterface),
                        organizationId: currentOrganization.id
                    });

                    if (!created.data?.data || created.data.error) {
                        throw new Error(created.data?.message || "Une erreur est survenue lors de la création de l'utilisateur.");
                    }

                    toast.success(`Utilisateur ${data.first_names || ''} ${data.last_name || ''} créé avec succès dans l'organisation ${currentOrganization.name}`);
                }
            });
        } catch (error) {
            console.error('Stepper Error:', error);
            toast.error("Une erreur est survenue lors de la création de l'utilisateur.");
        }
    };

    return (
        <Fragment>
            <Button onClick={handleOpenStepper} variant="default" size="lg">
                <PlusIcon/>
                Ajouter un utilisateur
            </Button>
        </Fragment>
    );
}
