"use client"

import React from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {Trash2} from "lucide-react";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {authUserConnectedStore} from "@liorian/sdk/infrastructure/stores/auth-user-connected.store";
import {AuthUserService} from "@liorian/sdk/application/service/auth-user.service";
import {useUploadStore} from "@liorian/sdk/infrastructure/stores/upload.store";
import type {MediaStorageInterface} from "@liorian/sdk/domain/entities/media";
import {StorageMedia} from "@liorian/sdk/presentation/uploading/storage-media";
import {Progress} from "@liorian/sdk/presentation/ui/progress";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {SettingsLayout} from "../../../../../library/modules/pos-management/presentation/components/settings-layout";
import {Input} from "@liorian/sdk/presentation/ui/input";
import {Label} from "@liorian/sdk/presentation/ui/label";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card";
import {Avatar, AvatarFallback} from "@liorian/sdk/presentation/ui/avatar";
import {Activity} from "@liorian/sdk/presentation/components/activity";

export function AccountSettingsView() {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const {setCurrentUser} = authUserConnectedStore();
    
    const [formData, setFormData] = React.useState({
        firstname: user?.userData?.firstname || "",
        lastname: user?.userData?.lastname || "",
        email: user?.email || "",
        username: user?.username || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const updateProfileMutation = useMutation({
        mutationFn: async (payload: typeof formData) => {
            if (!user?.id) throw new Error("Utilisateur non trouvé");
            const response = await UsersApiService.update(user.id, {
                first_names: payload.firstname,
                last_name: payload.lastname,
                username: payload.username,
            });
            return response.data;
        },
        onSuccess: async (data, payload) => {
            const serverUser = data?.data;
            const updatedUser = {
                ...user!,
                username: serverUser?.username ?? payload.username,
                userData: {
                    ...user!.userData,
                    firstname: serverUser?.userData?.firstname ?? payload.firstname,
                    lastname: serverUser?.userData?.lastname ?? payload.lastname,
                },
            };

            await persistUser(updatedUser);

            toast.success("Profil mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour du profil");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const uploadFile = useUploadStore((state) => state.uploadFile);
    const [avatarPreview, setAvatarPreview] = React.useState<string>();
    const [avatarProgress, setAvatarProgress] = React.useState(0);
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = React.useState(false);

    React.useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const persistUser = async (updated: NonNullable<typeof user>) => {
        await AuthUserService.setUser(updated);
        setCurrentUser(updated);
        queryClient.invalidateQueries({queryKey: ['users', updated.id]});
    };

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const userId = user?.id;
        e.target.value = "";
        if (!file || !userId) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Veuillez sélectionner une image");
            return;
        }

        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
        setIsUploadingAvatar(true);
        setAvatarProgress(0);

        try {
            const media = (await uploadFile(
                file,
                {module: "user", type: "avatar"},
                (event) => {
                    if (event.total) setAvatarProgress((event.loaded / event.total) * 100);
                }
            )) as MediaStorageInterface | undefined;
            if (!media?.id) throw new Error("Réponse invalide du serveur");

            await UsersApiService.update(userId, {avatar: media});
            await persistUser({...user!, avatar: media});

            setAvatarPreview(undefined);
            toast.success("Photo de profil mise à jour");
        } catch (error: any) {
            setAvatarPreview(undefined);
            toast.error(error?.response?.data?.message || error?.message || "Erreur lors du téléversement de l'avatar");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        const userId = user?.id;
        if (!userId) return;
        setIsRemovingAvatar(true);
        try {
            await UsersApiService.update(userId, {avatar: null});
            await persistUser({...user!, avatar: undefined});
            toast.success("Photo de profil retirée");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erreur lors de la suppression de l'avatar");
        } finally {
            setIsRemovingAvatar(false);
        }
    };

    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Mon compte"
                description="Gérez vos informations personnelles et les paramètres de votre compte."
            />
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                        <CardDescription>
                            Ces informations seront affichées sur votre profil.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 overflow-hidden">
                                    {avatarPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={avatarPreview} alt={user?.username} className="size-full object-cover"/>
                                    ) : user?.avatar?.id ? (
                                        <StorageMedia id={user.avatar.id} className="size-full"/>
                                    ) : (
                                        <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarSelect}
                                        />
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingAvatar || isRemovingAvatar}
                                        >
                                            {isUploadingAvatar ? (
                                                <>
                                                    <Activity.Loader size={16}/>
                                                    Téléversement...
                                                </>
                                            ) : user?.avatar?.id ? "Changer l'avatar" : "Ajouter un avatar"}
                                        </Button>
                                        {user?.avatar?.id && (
                                            <Button
                                                variant="ghost"
                                                type="button"
                                                size="icon"
                                                aria-label="Retirer la photo de profil"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={handleRemoveAvatar}
                                                disabled={isUploadingAvatar || isRemovingAvatar}
                                            >
                                                {isRemovingAvatar ? <Activity.Loader size={16}/> : <Trash2 className="size-4"/>}
                                            </Button>
                                        )}
                                    </div>
                                    {isUploadingAvatar && (
                                        <div className="flex items-center gap-2 w-48">
                                            <Progress value={avatarProgress} className="h-1.5 flex-1"/>
                                            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                                                {Math.round(avatarProgress)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">Prénom</Label>
                                    <Input 
                                        id="firstname" 
                                        name="firstname"
                                        value={formData.firstname} 
                                        onChange={handleChange}
                                        placeholder="Votre prénom" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Nom</Label>
                                    <Input 
                                        id="lastname" 
                                        name="lastname"
                                        value={formData.lastname} 
                                        onChange={handleChange}
                                        placeholder="Votre nom" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Nom d'utilisateur</Label>
                                    <Input 
                                        id="username" 
                                        name="username"
                                        value={formData.username} 
                                        onChange={handleChange}
                                        placeholder="Nom d'utilisateur" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        name="email"
                                        type="email"
                                        value={formData.email} 
                                        onChange={handleChange}
                                        placeholder="votre@email.com" 
                                        disabled
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        L'adresse email ne peut pas être modifiée ici.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button type="submit" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? (
                                        <>
                                            <Activity.Loader size={16} />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        "Enregistrer les modifications"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout.Section>
    );
}
