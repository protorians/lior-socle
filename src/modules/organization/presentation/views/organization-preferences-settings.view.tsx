"use client"

import * as React from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth"
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service"
import {SettingsLayout} from "../../../../../library/modules/pos-management/presentation/components/settings-layout"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card"
import {Button} from "@liorian/sdk/presentation/ui/button"
import {Input} from "@liorian/sdk/presentation/ui/input"
import {Label} from "@liorian/sdk/presentation/ui/label"
import {toast} from "sonner"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@liorian/sdk/presentation/ui/alert-dialog"
import {PlusIcon, PencilIcon, Trash2Icon, KeyIcon} from "lucide-react"
import {Activity} from "@liorian/sdk/presentation/components/activity"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@liorian/sdk/presentation/ui/dialog"

interface OrganizationPreference {
    id: string
    label?: string | null
    value: string
    status?: boolean
}

export function OrganizationPreferencesSettingsView() {
    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const orgId = currentOrganization?.id

    const {data: preferences, isLoading} = useQuery<OrganizationPreference[]>({
        queryKey: ['organizations', orgId, 'preferences'],
        enabled: !!orgId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getPreferenceByOrgId(orgId!)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingPref, setEditingPref] = React.useState<OrganizationPreference | null>(null)
    const [prefLabel, setPrefLabel] = React.useState('')
    const [prefValue, setPrefValue] = React.useState('')

    const createMutation = useMutation({
        mutationFn: async () => {
            return OrganizationsApiService.createPreference({
                organization_id: orgId,
                label: prefLabel,
                value: prefValue,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'preferences']})
            toast.success("Préférence enregistrée")
            setDialogOpen(false)
            resetForm()
        },
        onError: () => toast.error("Erreur lors de l'enregistrement"),
    })

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editingPref) return
            return OrganizationsApiService.updatePreference(editingPref.id, {
                label: prefLabel,
                value: prefValue,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'preferences']})
            toast.success("Préférence mise à jour")
            setDialogOpen(false)
            resetForm()
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return OrganizationsApiService.deletePreference(id)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'preferences']})
            toast.success("Préférence supprimée")
        },
        onError: () => toast.error("Erreur lors de la suppression"),
    })

    function resetForm() {
        setPrefLabel('')
        setPrefValue('')
        setEditingPref(null)
    }

    function openCreate() {
        resetForm()
        setDialogOpen(true)
    }

    function openEdit(pref: OrganizationPreference) {
        setEditingPref(pref)
        setPrefLabel(pref.label ?? '')
        setPrefValue(pref.value)
        setDialogOpen(true)
    }

    function handleSubmit() {
        if (!prefLabel.trim() || !prefValue.trim()) return
        if (editingPref) {
            updateMutation.mutate()
        } else {
            createMutation.mutate()
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="flex flex-col gap-6">
            <SettingsLayout.Header
                title="Préférences"
                description="Clés-valeurs de configuration de l'organisation"
                actions={
                    <Button onClick={openCreate} size="sm">
                        <PlusIcon className="size-4 mr-2"/>
                        Ajouter
                    </Button>
                }
            />

            <SettingsLayout.Section>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyIcon className="size-4"/>
                            Préférences
                        </CardTitle>
                        <CardDescription>
                            {preferences?.length ?? 0} préférence(s) configurée(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Activity.Loader size={24}/>
                            </div>
                        ) : !preferences?.length ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <KeyIcon className="size-8 mb-2 opacity-50"/>
                                <span className="text-sm">Aucune préférence configurée</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {preferences.map(pref => (
                                    <div
                                        key={pref.id}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium font-mono truncate">
                                                {pref.label ?? '—'}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {pref.value}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => openEdit(pref)}
                                            >
                                                <PencilIcon className="size-3.5"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 text-destructive">
                                                        <Trash2Icon className="size-3.5"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Supprimer cette préférence ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            La clé « {pref.label} » sera définitivement supprimée.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteMutation.mutate(pref.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Supprimer
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </SettingsLayout.Section>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPref ? 'Modifier la préférence' : 'Nouvelle préférence'}</DialogTitle>
                        <DialogDescription>
                            {editingPref ? 'Modifiez la clé et la valeur' : 'Ajoutez une nouvelle clé de configuration'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="pref-label">Clé</Label>
                            <Input
                                id="pref-label"
                                value={prefLabel}
                                onChange={e => setPrefLabel(e.target.value)}
                                placeholder="mon-parametre"
                                disabled={!!editingPref}
                                className="font-mono"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="pref-value">Valeur</Label>
                            <Input
                                id="pref-value"
                                value={prefValue}
                                onChange={e => setPrefValue(e.target.value)}
                                placeholder="valeur"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !prefLabel.trim() || !prefValue.trim()}
                        >
                            {isPending && <Activity.Loader size={16}/>}
                            {editingPref ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
