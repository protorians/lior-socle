"use client"

import {GlobeIcon, Trash2Icon} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@liorian/sdk/presentation/ui/sheet";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {Separator} from "@liorian/sdk/presentation/ui/separator";
import {StorageMedia} from "@liorian/sdk/presentation/uploading/storage-media";
import {formatFileSize} from "@liorian/sdk/infrastructure/utilities/format.util";
import {MediaLabelService} from "@liorian/sdk/infrastructure/utilities/media-label.service";
import {MediaLibraryInterface} from "@/modules/media-library/domain/cloud.interface";

export interface CloudMediaDetailSheetProps {
    media: MediaLibraryInterface | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete?: (media: MediaLibraryInterface) => void;
}

function formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(date);
}

export function CloudMediaDetailSheet({media, open, onOpenChange, onDelete}: CloudMediaDetailSheetProps) {
    if (!media) return null;

    const extension = media.filename?.split(".").pop() ?? "";
    const section = MediaLabelService.sectionFor({mime: media.type, extension});
    const size = media.metadata?.size ?? 0;

    const info: {label: string; value: string}[] = [
        {label: 'Type', value: media.type || '—'},
        {label: 'Catégorie', value: section},
        {label: 'Taille', value: size > 0 ? formatFileSize(size) : '—'},
        {label: 'Libellé', value: media.label || '—'},
        {label: 'Ajouté le', value: formatDate(media.createdAt)},
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="truncate">{media.filename}</SheetTitle>
                    <SheetDescription>
                        {media.isPublic ? 'Fichier public' : 'Fichier privé'}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4">
                    <div className="overflow-hidden rounded-xl border bg-muted/30">
                        <StorageMedia id={media.id} className="aspect-square"/>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        {media.isPublic && (
                            <Badge variant="secondary" className="gap-1">
                                <GlobeIcon className="size-3"/>
                                Public
                            </Badge>
                        )}
                        {media.isDocument && (
                            <Badge variant="outline">Document</Badge>
                        )}
                    </div>

                    <Separator className="my-4"/>

                    <div className="flex flex-col gap-3">
                        {info.map((item) => (
                            <div key={item.label} className="flex flex-col gap-0.5">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                    {item.label}
                                </span>
                                <span className="break-words text-sm">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {onDelete && (
                    <SheetFooter>
                        <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(media)}
                        >
                            <Trash2Icon/>
                            Supprimer
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
