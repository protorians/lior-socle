"use client"

import {DownloadIcon, EyeIcon, GlobeIcon, Trash2Icon} from "lucide-react";
import {MediaLibraryInterface} from "@/modules/media-library/domain/cloud.interface";
import {CloudMediaIcon} from "@/modules/media-library/presentation/components/cloud-media-icon";
import {formatFileSize} from "@sentients/sdk/infrastructure/utilities/format.util";
import {MediaLabelService} from "@sentients/sdk/infrastructure/utilities/media-label.service";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";

export interface CloudMediaCardProps {
    media: MediaLibraryInterface;
    onSelect?: (media: MediaLibraryInterface) => void;
    onDownload?: (media: MediaLibraryInterface) => void;
    onDelete?: (media: MediaLibraryInterface) => void;
}

function sectionOf(media: MediaLibraryInterface) {
    const extension = media.filename?.split(".").pop() ?? "";
    return MediaLabelService.sectionFor({mime: media.type, extension});
}

export function CloudMediaCard({media, onSelect, onDownload, onDelete}: CloudMediaCardProps) {
    const section = sectionOf(media);
    const isImage = section === "image";
    const size = media.metadata?.size ?? 0;

    const preview = isImage && media.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={media.url}
            alt={media.filename}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
    ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/40">
            <CloudMediaIcon mime={media.type} filename={media.filename} className="size-10 text-muted-foreground"/>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{section}</span>
        </div>
    );

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md",
                onSelect && "cursor-pointer",
            )}
            onClick={() => onSelect?.(media)}
        >
            <div className="relative aspect-square overflow-hidden">
                {preview}
                {media.isPublic && (
                    <Badge variant="secondary" className="absolute left-2 top-2 gap-1 text-[10px]">
                        <GlobeIcon className="size-3"/>
                        Public
                    </Badge>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {onSelect && (
                        <Button
                            variant="secondary"
                            size="icon-sm"
                            className="bg-background/90 backdrop-blur"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(media);
                            }}
                            aria-label="Aperçu"
                        >
                            <EyeIcon className="size-4"/>
                        </Button>
                    )}
                    {onDownload && (
                        <Button
                            variant="secondary"
                            size="icon-sm"
                            className="bg-background/90 backdrop-blur"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(media);
                            }}
                            aria-label="Télécharger"
                        >
                            <DownloadIcon className="size-4"/>
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="secondary"
                            size="icon-sm"
                            className="bg-background/90 text-destructive backdrop-blur hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(media);
                            }}
                            aria-label="Supprimer"
                        >
                            <Trash2Icon className="size-4"/>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1 p-3">
                <span className="truncate text-sm font-medium" title={media.filename}>
                    {media.filename}
                </span>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{media.type}</span>
                    {size > 0 && <span className="shrink-0 tabular-nums">{formatFileSize(size)}</span>}
                </div>
            </div>
        </div>
    );
}
