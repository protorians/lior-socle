"use client"

import * as React from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {ModuleStoreApiService} from "@sentients/sdk/application/service/module-store-api.service";
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth";
import {ModuleStoreCatalogItemInterface} from "@sentients/sdk/domain/entities/module-activation.interface";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@sentients/sdk/presentation/ui/dialog";
import {Input} from "@sentients/sdk/presentation/ui/input";
import {Label} from "@sentients/sdk/presentation/ui/label";
import {Separator} from "@sentients/sdk/presentation/ui/separator";
import {Switch} from "@sentients/sdk/presentation/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@sentients/sdk/presentation/ui/select";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";
import {ImageIcon, Trash2Icon} from "lucide-react";
import {MediaPickerDialog, PickedMediaInterface} from "@/core/presentation/components/media-picker-dialog";
import {cn} from "@sentients/sdk";

interface ModuleStorePublishDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Fiche produit existante : mode édition (sinon création). */
    catalogItem?: ModuleStoreCatalogItemInterface | null;
}

const SUPER_ADMIN_MIN_LEVEL = 90;

function MediaField({
    label,
    hint,
    media,
    onPick,
    onClear,
}: {
    label: string;
    hint: string;
    media: PickedMediaInterface | null;
    onPick: () => void;
    onClear: () => void;
}) {
    const previewUrl = media?.url ?? null;
    const isImage = media ? media.type.startsWith("image/") : false;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onPick}>
                    <ImageIcon className="size-3.5"/>
                    Choisir une image
                </Button>
            </div>

            {media ? (
                <div className="relative overflow-hidden rounded-lg border bg-muted/30">
                    {previewUrl && isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt={media.filename} className="size-full object-cover"/>
                    ) : (
                        <div className="flex h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="size-5"/>
                            <span className="truncate max-w-[70%]">{media.filename}</span>
                        </div>
                    )}
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute right-2 top-2"
                        onClick={onClear}
                        title="Retirer"
                    >
                        <Trash2Icon className="size-3.5"/>
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onPick}
                    className={cn(
                        "flex h-16 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary",
                    )}
                >
                    <ImageIcon className="size-4"/>
                    {hint}
                </button>
            )}
        </div>
    );
}

/**
 * Éditeur de fiche produit d'un module (publique via le store) :
 * nom, description, URL, icône image, bannière et visibilité.
 * Mode création (Publier) ou édition (Éditer la fiche).
 */
export function ModuleStorePublishDialog({open, onOpenChange, catalogItem}: ModuleStorePublishDialogProps) {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const isEdit = !!catalogItem;

    const [name, setName] = React.useState("");
    const [url, setUrl] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [icon, setIcon] = React.useState("");
    const [identifier, setIdentifier] = React.useState("");
    const [type, setType] = React.useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
    const [isEnabled, setIsEnabled] = React.useState(true);
    const [isDefault, setIsDefault] = React.useState(false);
    const [logo, setLogo] = React.useState<PickedMediaInterface | null>(null);
    const [banner, setBanner] = React.useState<PickedMediaInterface | null>(null);
    const [pickerFor, setPickerFor] = React.useState<"logo" | "banner" | null>(null);

    React.useEffect(() => {
        if (!open) return;
        setName(catalogItem?.name ?? "");
        setUrl(catalogItem?.url ?? "");
        setDescription(catalogItem?.description ?? "");
        setIcon(catalogItem?.icon ?? "");
        setIdentifier(catalogItem?.identifier ?? "");
        setType(catalogItem?.type ?? "INTERNAL");
        setIsEnabled(catalogItem?.isEnabled ?? true);
        setIsDefault(catalogItem?.isDefault ?? false);
        setLogo(catalogItem?.logoId ? {id: catalogItem.logoId, filename: "Icône actuelle", type: "image/", url: catalogItem.logoUrl} : null);
        setBanner(catalogItem?.bannerId ? {id: catalogItem.bannerId, filename: "Bannière actuelle", type: "image/", url: catalogItem.bannerUrl} : null);
    }, [open, catalogItem]);

    const canSubmit = name.trim().length > 0 && url.trim().length > 0 && (isEdit || identifier.trim().length > 0);

    const mutation = useMutation({
        mutationFn: async () => {
            const auditId = user?.auditId;
            if (!auditId) throw new Error("Identifiant de piste d'audit introuvable");

            const basePayload = {
                name: name.trim(),
                url: url.trim(),
                description: description.trim() || undefined,
                icon: icon.trim() || undefined,
                type,
                isEnabled,
                isDefault,
                logoId: logo?.id ?? null,
                bannerId: banner?.id ?? null,
                auditId,
            };

            if (isEdit && catalogItem) {
                await ModuleStoreApiService.updateCatalogModule(catalogItem.id, basePayload);
            } else {
                await ModuleStoreApiService.createCatalogModule({
                    ...basePayload,
                    identifier: identifier.trim(),
                });
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["module-catalog"]});
            await queryClient.invalidateQueries({queryKey: ["module-activation"]});
            toast.success(isEdit ? "Fiche produit mise à jour" : "Module publié dans le store");
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement de la fiche produit");
        },
    });

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Éditer la fiche produit" : "Publier un module"}</DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? "Modifiez les informations et les images (icône & bannière) de la fiche produit."
                                : "Définissez la fiche produit du module : informations, icône et bannière."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Nom du module</Label>
                                    <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex : Caisse, Inventaire…"/>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>URL d'accès</Label>
                                    <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/caisse"/>
                                </div>
                            </div>

                            {!isEdit && (
                                <div className="flex flex-col gap-1.5">
                                    <Label>Identifiant technique</Label>
                                    <Input
                                        value={identifier}
                                        onChange={(event) => setIdentifier(event.target.value)}
                                        placeholder="mod.sentients.inventory"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Identifiant unique utilisé pour lier la fiche produit au module déclaré localement.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <Label>Description</Label>
                                <Input
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Décrivez la fonctionnalité du module…"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Type</Label>
                                    <Select value={type} onValueChange={(value) => setType(value as "INTERNAL" | "EXTERNAL")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INTERNAL">Interne</SelectItem>
                                            <SelectItem value="EXTERNAL">Externe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>Badge d'icône</Label>
                                    <Input value={icon} onChange={(event) => setIcon(event.target.value)} placeholder="Ex : store, users, settings…"/>
                                </div>
                            </div>
                        </div>

                        <Separator/>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <MediaField
                                label="Icône (logo)"
                                hint="Choisir l'image d'icône"
                                media={logo}
                                onPick={() => setPickerFor("logo")}
                                onClear={() => setLogo(null)}
                            />
                            <MediaField
                                label="Bannière"
                                hint="Choisir l'image de bannière"
                                media={banner}
                                onPick={() => setPickerFor("banner")}
                                onClear={() => setBanner(null)}
                            />
                        </div>

                        <Separator/>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <Label>Actif</Label>
                                    <p className="text-xs text-muted-foreground">Le module est visible dans le store.</p>
                                </div>
                                <Switch checked={isEnabled} onCheckedChange={setIsEnabled}/>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <Label>Par défaut</Label>
                                    <p className="text-xs text-muted-foreground">Non désactivable et non déplaçable.</p>
                                </div>
                                <Switch checked={isDefault} onCheckedChange={setIsDefault}/>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                            Annuler
                        </Button>
                        <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
                            {mutation.isPending ? <WaitingActivity size={14}/> : isEdit ? "Enregistrer" : "Publier le module"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {pickerFor && (
                <MediaPickerDialog
                    open={!!pickerFor}
                    onOpenChange={(next) => !next && setPickerFor(null)}
                    title={pickerFor === "logo" ? "Icône du module" : "Bannière du module"}
                    description="Choisissez une image de la bibliothèque ou téléversez-en une nouvelle."
                    onSelected={(media) => {
                        const picked = media[0] ?? null;
                        if (pickerFor === "logo") setLogo(picked);
                        else setBanner(picked);
                        setPickerFor(null);
                    }}
                />
            )}
        </>
    );
}

export const moduleStorePublishSuperAdminLevel = SUPER_ADMIN_MIN_LEVEL;