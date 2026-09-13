"use client"

import * as React from "react";
import {useQuery} from "@tanstack/react-query";
import {cn} from "@sentients/sdk";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@sentients/sdk/presentation/ui/dialog";
import {MusicIcon, PaperclipIcon, PlayIcon, UploadIcon} from "lucide-react";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";
import {StorageApiService} from "@sentients/sdk/application/service/storage-api-service";
import {FetchResponseInterface} from "@sentients/sdk/domain/typing/response";

// ---------------------------------------------------------------------------
// Types & service
// ---------------------------------------------------------------------------

/** Média sélectionnable : provenant de la bibliothèque ou d'un téléversement. */
export interface PickedMediaInterface {
    id: string;
    filename: string;
    type: string;
    size?: number | null;
    url?: string | null;
}

interface MediaListResultInterface {
    data: {
        id: string;
        filename: string;
        type: string;
        metadata?: Record<string, any> | null;
        url?: string | null;
        createdAt?: string;
    }[];
    meta: {total?: number; page?: number; limit?: number; totalPages?: number};
}

class MediaLibraryService extends StorageApiService {
    static async list(options?: {limit?: number; page?: number; type?: string}) {
        return await this.get<FetchResponseInterface<MediaListResultInterface>>(
            "/storages/",
            options?.type ? {...options, type: options.type} : options,
        );
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export type MediaCategory = "image" | "video" | "audio" | "document";

const CATEGORY_FILTERS: {key: MediaCategory | "all"; label: string; prefix?: string}[] = [
    {key: "all", label: "Tous"},
    {key: "image", label: "Images", prefix: "image/"},
    {key: "video", label: "Vidéos", prefix: "video/"},
    {key: "audio", label: "Audios", prefix: "audio/"},
    {key: "document", label: "Documents", prefix: "application/"},
];

function mediaCategory(type: string): MediaCategory {
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    return "document";
}

function mediaName(media: {filename: string; metadata?: Record<string, any> | null}): string {
    return media.metadata?.originalName ?? media.filename ?? "fichier";
}

function mediaSize(media: {metadata?: Record<string, any> | null}): number | null {
    return media.metadata?.size ?? null;
}

function formatSize(bytes?: number | null): string | null {
    if (!bytes) return null;
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} Mo`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${bytes} o`;
}

const PAGE_SIZE = 24;

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export interface MediaPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    /** Adaptateur de téléversement du module appelant (label module côté API). Par défaut : upload générique. */
    uploadFile?: (file: File, onProgress?: (percent: number) => void) => Promise<PickedMediaInterface>;
    /** Appelé avec les médias choisis (bibliothèque et/ou téléversés). */
    onSelected: (media: PickedMediaInterface[]) => void;
}

/**
 Sélecteur de médias réutilisable — CONVENTION PROJET :
 toute sélection de fichier passe par cette modal (bibliothèque de l'organisation +
 téléversement), jamais par un bouton qui ouvre directement l'explorateur de fichiers.
 Voir manager/docs/conventions/media-picker.md.
 */
export function MediaPickerDialog({
    open,
    onOpenChange,
    title = "Sélectionner un fichier",
    description = "Choisissez un fichier déjà téléversé ou ajoutez-en un nouveau.",
    uploadFile,
    onSelected,
}: MediaPickerDialogProps) {
    const [tab, setTab] = React.useState<"library" | "upload">("library");
    const [category, setCategory] = React.useState<(typeof CATEGORY_FILTERS)[number]>(CATEGORY_FILTERS[0]);
    const [page, setPage] = React.useState(1);
    const [selected, setSelected] = React.useState<Map<string, PickedMediaInterface>>(new Map());
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [uploads, setUploads] = React.useState<{name: string; progress: number; error?: string}[]>([]);
    const [dragOver, setDragOver] = React.useState(false);

    const {data, isLoading} = useQuery({
        queryKey: ["media-picker", category.key, page],
        queryFn: async () => {
            const response = await MediaLibraryService.list({
                limit: PAGE_SIZE,
                page,
                ...(category.prefix ? {type: category.prefix} : {}),
            });
            const body = response.data?.data;
            return {
                items: Array.isArray(body?.data) ? body.data : [],
                meta: body?.meta ?? {},
            };
        },
        enabled: open && tab === "library",
    });

    React.useEffect(() => {
        if (!open) {
            setSelected(new Map());
            setUploads([]);
            setPage(1);
            setTab("library");
        }
    }, [open]);

    const items = data?.items ?? [];
    const totalPages = Math.max(data?.meta?.totalPages ?? 1, 1);

    const toggle = (media: PickedMediaInterface) => {
        setSelected((previous) => {
            const next = new Map(previous);
            if (next.has(media.id)) next.delete(media.id);
            else next.set(media.id, media);
            return next;
        });
    };

    const confirmSelection = () => {
        if (selected.size === 0) return;
        onSelected([...selected.values()]);
        onOpenChange(false);
    };

    const startUpload = (files: FileList | File[] | null) => {
        const list = files ? Array.from(files) : [];
        if (list.length === 0) return;
        for (const file of list) {
            setUploads((previous) => [...previous, {name: file.name, progress: 0}]);
            const uploader = uploadFile
                ? uploadFile(file, (percent) => setUploads((previous) => previous.map((entry) => entry.name === file.name && !entry.error ? {...entry, progress: percent} : entry)))
                : StorageApiService.uploadFile(file, {}, (event: any) => {
                    if (event.total) setUploads((previous) => previous.map((entry) => entry.name === file.name && !entry.error ? {...entry, progress: Math.round((event.loaded / event.total) * 100)} : entry));
                }) as unknown as Promise<PickedMediaInterface>;
            uploader.then((uploaded) => {
                setUploads((previous) => previous.filter((entry) => entry.name !== file.name));
                setSelected((previous) => new Map(previous).set(uploaded.id, uploaded));
            }).catch((error: any) => {
                const message = error?.response?.data?.message || error?.message || "Échec du téléversement";
                setUploads((previous) => previous.map((entry) => entry.name === file.name ? {...entry, error: message} : entry));
            });
        }
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogHeader className="border-b px-4 py-3">
                    <DialogTitle className="text-base">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>

                    {/* Onglets */}
                    <div className="mt-2 flex gap-1">
                        <Button
                            size="sm"
                            variant={tab === "library" ? "default" : "outline"}
                            className="h-7"
                            onClick={() => setTab("library")}
                        >
                            Bibliothèque
                        </Button>
                        <Button
                            size="sm"
                            variant={tab === "upload" ? "default" : "outline"}
                            className="h-7"
                            onClick={() => setTab("upload")}
                        >
                            <UploadIcon className="size-3.5"/>
                            Téléverser
                        </Button>
                    </div>
                </DialogHeader>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => startUpload(event.target.files)}
                />

                {/* Corps */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                    {tab === "library" ? (
                        <>
                            {/* Filtres par catégorie */}
                            <div className="mb-3 flex flex-wrap gap-1">
                                {CATEGORY_FILTERS.map((filter) => (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={() => {
                                            setCategory(filter);
                                            setPage(1);
                                        }}
                                        className={cn(
                                            "rounded-full border px-2.5 py-0.5 text-xs transition",
                                            filter.key === category.key
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "hover:bg-muted",
                                        )}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                                    <WaitingActivity size={16}/>
                                    Chargement…
                                </div>
                            ) : items.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">Aucun fichier dans la bibliothèque.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {items.map((media) => {
                                        const kind = mediaCategory(media.type);
                                        const isSelected = selected.has(media.id);
                                        const name = mediaName(media);
                                        return (
                                            <button
                                                key={media.id}
                                                type="button"
                                                title={name}
                                                onClick={() => toggle({id: media.id, filename: name, type: media.type, size: mediaSize(media), url: media.url ?? null})}
                                                className={cn(
                                                    "group relative flex aspect-square flex-col overflow-hidden rounded-lg border transition",
                                                    isSelected && "ring-2 ring-primary border-primary",
                                                )}
                                            >
                                                {kind === "image" && media.url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={media.url} alt={name} loading="lazy" className="size-full object-cover"/>
                                                ) : kind === "video" && media.url ? (
                                                    <>
                                                        <video src={media.url} preload="metadata" muted playsInline className="size-full object-cover"/>
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <PlayIcon className="size-5 text-white drop-shadow"/>
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="flex size-full items-center justify-center bg-muted/50">
                                                        <PaperclipIcon className="size-6 opacity-50"/>
                                                    </span>
                                                )}
                                                <span className="absolute inset-x-0 bottom-0 truncate bg-background/85 px-1.5 py-0.5 text-left text-[10px] font-medium backdrop-blur-sm">
                                                    {kind === "audio" ? <MusicIcon className="mr-1 inline size-3 align-[-2px]"/> : null}
                                                    {name}
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                                        ✓
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Zone de téléversement */
                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDragOver(false);
                                startUpload(event.dataTransfer.files);
                            }}
                            className={cn(
                                "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition",
                                dragOver ? "border-primary bg-primary/5" : "border-border",
                            )}
                        >
                            <UploadIcon className="size-8 opacity-50"/>
                            <p className="text-sm text-muted-foreground">Glissez vos fichiers ici</p>
                            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                                Choisir des fichiers
                            </Button>

                            {uploads.length > 0 && (
                                <div className="w-full space-y-1.5 pt-2 text-left">
                                    {uploads.map((upload) => (
                                        <div key={upload.name} className={cn("rounded-md border px-2 py-1.5", upload.error && "border-red-300")}>
                                            <p className="truncate text-[11px] font-medium">{upload.name}</p>
                                            {upload.error ? (
                                                <p className="text-[10px] text-red-500">{upload.error}</p>
                                            ) : (
                                                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-primary transition-all" style={{width: `${upload.progress}%`}}/>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pied : pagination + confirmation */}
                <div className="flex items-center gap-2 border-t px-4 py-2.5">
                    {tab === "library" && totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                                Précédent
                            </Button>
                            <span className="px-1 text-xs text-muted-foreground">{page} / {totalPages}</span>
                            <Button size="sm" variant="ghost" className="h-7" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                                Suivant
                            </Button>
                        </div>
                    )}
                    <Button
                        size="sm"
                        className="ml-auto h-8"
                        disabled={selected.size === 0}
                        onClick={confirmSelection}
                    >
                        Utiliser{selected.size > 1 ? ` (${selected.size})` : ""}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
