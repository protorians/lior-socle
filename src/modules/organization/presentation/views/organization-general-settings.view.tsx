"use client"

import * as React from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {OrganizationInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {SettingsLayout} from "../../../../../external_modules/pos-management/presentation/components/settings-layout"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {Input} from "@sentients/sdk/presentation/ui/input"
import {Switch} from "@sentients/sdk/presentation/ui/switch"
import {Label} from "@sentients/sdk/presentation/ui/label"
import {toast} from "sonner"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@sentients/sdk/presentation/ui/alert-dialog"
import {Building2Icon, Trash2Icon} from "lucide-react"
import {useRouter} from "next/navigation"
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";

export function OrganizationGeneralSettingsView() {
    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const router = useRouter()

    const orgId = currentOrganization?.id

    const {data: organization, isLoading} = useQuery<OrganizationInterface | null>({
        queryKey: ['organizations', orgId],
        enabled: !!orgId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getById(orgId!)
            return response.data?.data ?? null
        },
    })

    const [name, setName] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [status, setStatus] = React.useState(true)

    React.useEffect(() => {
        if (organization) {
            setName(organization.name ?? '')
            setDescription(organization.description ?? '')
            setStatus(organization.status !== false)
        }
    }, [organization])

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!orgId) return
            return OrganizationsApiService.updateOrganization(orgId, {
                name,
                description,
                status,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations']})
            toast.success("Paramètres enregistrés avec succès")
        },
        onError: () => {
            toast.error("Erreur lors de l'enregistrement des paramètres")
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!orgId) return
            return OrganizationsApiService.deleteOrganization(orgId)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations']})
            toast.success("Organisation supprimée")
            router.push('/organization')
        },
        onError: () => {
            toast.error("Erreur lors de la suppression")
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40dvh]">
                <WaitingActivity size={24} />
            </div>
        )
    }

    if (!organization) {
        return (
            <div className="flex items-center justify-center min-h-[40dvh] text-muted-foreground">
                Organisation introuvable
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <SettingsLayout.Header
                title="Général"
                description="Paramètres généraux de l'organisation"
                actions={
                    <Button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending || !name.trim()}
                    >
                        {updateMutation.isPending && <WaitingActivity size={16}/>}
                        Enregistrer
                    </Button>
                }
            />

            <SettingsLayout.Section>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2Icon className="size-4"/>
                            Informations
                        </CardTitle>
                        <CardDescription>
                            Nom et description de l'organisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="org-name">Nom</Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Nom de l'organisation"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="org-description">Description</Label>
                            <Input
                                id="org-description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description de l'organisation"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statut</CardTitle>
                        <CardDescription>
                            Activer ou désactiver l'organisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Switch
                                id="org-status"
                                checked={status}
                                onCheckedChange={setStatus}
                            />
                            <Label htmlFor="org-status" className="text-sm">
                                {status ? "Organisation active" : "Organisation inactive"}
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zone de danger</CardTitle>
                        <CardDescription>
                            Actions irréversibles sur l'organisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2Icon className="size-4 mr-2"/>
                                    Supprimer l'organisation
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette organisation ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes les données de l'organisation seront supprimées.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteMutation.mutate()}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </SettingsLayout.Section>
        </div>
    )
}
