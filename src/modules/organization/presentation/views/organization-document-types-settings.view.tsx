"use client"

import * as React from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth"
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service"
import {SettingsLayout} from "../../../../../external_modules/pos-management/presentation/components/settings-layout"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card"
import {Button} from "@liorian/sdk/presentation/ui/button"
import {Input} from "@liorian/sdk/presentation/ui/input"
import {Label} from "@liorian/sdk/presentation/ui/label"
import {toast} from "sonner"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@liorian/sdk/presentation/ui/alert-dialog"
import {PlusIcon, PencilIcon, Trash2Icon, FileTextIcon} from "lucide-react"
import {Activity} from "@liorian/sdk/presentation/components/activity"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@liorian/sdk/presentation/ui/dialog"

interface DocumentType {
    id: string
    slug: string
    name: string
    description?: string | null
}

export function OrganizationDocumentTypesSettingsView() {
    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const orgId = currentOrganization?.id

    const {data: documentTypes, isLoading} = useQuery<DocumentType[]>({
        queryKey: ['organizations', orgId, 'document-types'],
        enabled: !!orgId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getDocumentTypesByOrg(orgId!)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingType, setEditingType] = React.useState<DocumentType | null>(null)
    const [typeName, setTypeName] = React.useState('')
    const [typeSlug, setTypeSlug] = React.useState('')
    const [typeDescription, setTypeDescription] = React.useState('')

    const createMutation = useMutation({
        mutationFn: async () => {
            return OrganizationsApiService.createDocumentType({
                organizationId: orgId,
                name: typeName,
                slug: typeSlug,
                description: typeDescription || undefined,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'document-types']})
            toast.success("Type de document créé")
            setDialogOpen(false)
            resetForm()
        },
        onError: () => toast.error("Erreur lors de la création"),
    })

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editingType) return
            return OrganizationsApiService.updateDocumentType(editingType.id, {
                name: typeName,
                slug: typeSlug,
                description: typeDescription || undefined,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'document-types']})
            toast.success("Type de document mis à jour")
            setDialogOpen(false)
            resetForm()
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return OrganizationsApiService.deleteDocumentType(id)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'document-types']})
            toast.success("Type de document supprimé")
        },
        onError: () => toast.error("Erreur lors de la suppression"),
    })

    function resetForm() {
        setTypeName('')
        setTypeSlug('')
        setTypeDescription('')
        setEditingType(null)
    }

    function openCreate() {
        resetForm()
        setDialogOpen(true)
    }

    function openEdit(dt: DocumentType) {
        setEditingType(dt)
        setTypeName(dt.name)
        setTypeSlug(dt.slug)
        setTypeDescription(dt.description ?? '')
        setDialogOpen(true)
    }

    function handleNameChange(value: string) {
        setTypeName(value)
        if (!editingType) {
            setTypeSlug(value
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            )
        }
    }

    function handleSubmit() {
        if (!typeName.trim() || !typeSlug.trim()) return
        if (editingType) {
            updateMutation.mutate()
        } else {
            createMutation.mutate()
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="flex flex-col gap-6">
            <SettingsLayout.Header
                title="Types de documents"
                description="Gérez les types de documents de l'organisation"
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
                            <FileTextIcon className="size-4"/>
                            Types de documents
                        </CardTitle>
                        <CardDescription>
                            {documentTypes?.length ?? 0} type(s) de document(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Activity.Loader size={24}/>
                            </div>
                        ) : !documentTypes?.length ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileTextIcon className="size-8 mb-2 opacity-50"/>
                                <span className="text-sm">Aucun type de document</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {documentTypes.map(dt => (
                                    <div
                                        key={dt.id}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{dt.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono truncate">
                                                {dt.slug}
                                                {dt.description && ` — ${dt.description}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => openEdit(dt)}
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
                                                        <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Le type « {dt.name} » sera définitivement supprimé.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteMutation.mutate(dt.id)}
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
                        <DialogTitle>{editingType ? 'Modifier le type' : 'Nouveau type de document'}</DialogTitle>
                        <DialogDescription>
                            {editingType ? 'Modifiez les informations du type' : 'Ajoutez un nouveau type de document'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dt-name">Nom</Label>
                            <Input
                                id="dt-name"
                                value={typeName}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Facture"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dt-slug">Slug</Label>
                            <Input
                                id="dt-slug"
                                value={typeSlug}
                                onChange={e => setTypeSlug(e.target.value)}
                                placeholder="facture"
                                className="font-mono"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dt-description">Description</Label>
                            <Input
                                id="dt-description"
                                value={typeDescription}
                                onChange={e => setTypeDescription(e.target.value)}
                                placeholder="Description optionnelle"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !typeName.trim() || !typeSlug.trim()}
                        >
                            {isPending && <Activity.Loader size={16}/>}
                            {editingType ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
