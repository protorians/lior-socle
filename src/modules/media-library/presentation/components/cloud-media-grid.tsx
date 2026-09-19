"use client"

import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {RefreshCwIcon, SearchIcon, Trash2Icon} from "lucide-react";
import {CloudApiService} from "@/modules/media-library/application/service/cloud-api-service";
import {MediaLibraryInterface, MediaSectionFilter} from "@/modules/media-library/domain/cloud.interface";
import {useUploadStore} from "@liorian/sdk/infrastructure/stores/upload.store";
import {MediaLabelService} from "@liorian/sdk/infrastructure/utilities/media-label.service";
import {Input} from "@liorian/sdk/presentation/ui/input";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {Empty, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {Skeleton} from "@liorian/sdk/presentation/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@liorian/sdk/presentation/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@liorian/sdk/presentation/ui/dialog";
import {CloudIcon} from "lucide-react";
import {CloudMediaCard} from "@/modules/media-library/presentation/components/cloud-media-card";
import {CloudMediaDetailSheet} from "@/modules/media-library/presentation/components/cloud-media-detail-sheet";
import {CloudSummary} from "@/modules/media-library/presentation/components/cloud-summary";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";

const PAGE_SIZE = 12;

const SECTION_FILTERS: {value: MediaSectionFilter; label: string}[] = [
    {value: 'all', label: 'Tous'},
    {value: 'image', label: 'Images'},
    {value: 'video', label: 'Vidéos'},
    {value: 'audio', label: 'Audio'},
    {value: 'document', label: 'Documents'},
    {value: 'other', label: 'Autres'},
];

function sectionOf(media: MediaLibraryInterface): string {
    const extension = media.filename?.split(".").pop() ?? "";
    return MediaLabelService.sectionFor({mime: media.type, extension});
}

export function CloudMediaGrid() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [section, setSection] = useState<MediaSectionFilter>('all');
    const [selected, setSelected] = useState<MediaLibraryInterface | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [toDelete, setToDelete] = useState<MediaLibraryInterface | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads);
    const prevActiveRef = useRef(hasActiveUploads);

    const {data, isLoading, isFetching, refetch} = useQuery<{items: MediaLibraryInterface[]; meta: any}>({
        queryKey: ['cloud', 'media', page, PAGE_SIZE],
        queryFn: async () => {
            const response = await CloudApiService.getAll({limit: PAGE_SIZE, page});
            const body = response.data?.data;
            return {
                items: (Array.isArray(body?.data) ? body.data : []) as MediaLibraryInterface[],
                meta: body?.meta ?? {},
            };
        },
    });

    useEffect(() => {
        const wasActive = prevActiveRef.current;
        prevActiveRef.current = hasActiveUploads;
        if (wasActive && !hasActiveUploads) {
            queryClient.invalidateQueries({queryKey: ['cloud', 'media']});
        }
    }, [hasActiveUploads, queryClient]);

    const filtered = useMemo(() => {
        const list = data?.items ?? [];
        return list.filter((media) => {
            if (section !== 'all' && sectionOf(media) !== section) return false;
            if (search && !(media.filename ?? '').toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [data?.items, section, search]);

    const totalPages = data?.meta?.totalPages ?? 0;
    const total = data?.meta?.total ?? 0;

    const handleDownload = async (media: MediaLibraryInterface) => {
        try {
            const response = await CloudApiService.getFile(media.id, {responseType: 'blob'});
            const url = URL.createObjectURL(response.data as any);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = media.filename || 'download';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Impossible de télécharger le fichier');
        }
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        setIsDeleting(true);
        try {
            await CloudApiService.removeMedia(toDelete.id);
            toast.success('Média supprimé');
            setToDelete(null);
            setDetailOpen(false);
            queryClient.invalidateQueries({queryKey: ['cloud', 'media']});
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Impossible de supprimer le média');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="aspect-square w-full rounded-xl"/>
                            <Skeleton className="h-4 w-3/4"/>
                            <Skeleton className="h-3 w-1/2"/>
                        </div>
                    ))}
                </div>
            );
        }

        if (!data || data.items.length === 0) {
            return (
                <Empty>
                    <EmptyMedia>
                        <CloudIcon size={80} strokeWidth={1}/>
                    </EmptyMedia>
                    <EmptyTitle>Aucun fichier</EmptyTitle>
                    <EmptyDescription>Les fichiers téléversés s'afficheront ici</EmptyDescription>
                </Empty>
            );
        }

        if (filtered.length === 0) {
            return (
                <Empty>
                    <EmptyMedia>
                        <SearchIcon size={80} strokeWidth={1}/>
                    </EmptyMedia>
                    <EmptyTitle>Aucun résultat</EmptyTitle>
                    <EmptyDescription>Aucun fichier ne correspond aux filtres</EmptyDescription>
                </Empty>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((media) => (
                    <CloudMediaCard
                        key={media.id}
                        media={media}
                        onSelect={(m) => {
                            setSelected(m);
                            setDetailOpen(true);
                        }}
                        onDownload={handleDownload}
                        onDelete={setToDelete}
                    />
                ))}
            </div>
        );
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-4">
                <CloudSummary data={data?.items ?? []} total={total}/>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Rechercher un fichier..."
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {SECTION_FILTERS.map((filter) => (
                            <Badge
                                key={filter.value}
                                variant={section === filter.value ? 'default' : 'outline'}
                                className="cursor-pointer whitespace-nowrap px-2 py-3"
                                onClick={() => {
                                    setSection(filter.value);
                                    setPage(1);
                                }}
                            >
                                {filter.label}
                            </Badge>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCwIcon className={cn(isFetching && 'animate-spin')}/>
                    </Button>
                </div>

                {renderBody()}

                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    text=""
                                    aria-disabled={page <= 1}
                                    className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page > 1) setPage(page - 1);
                                    }}
                                />
                            </PaginationItem>
                            {Array.from({length: totalPages}).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i + 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(i + 1);
                                        }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    text=""
                                    aria-disabled={page >= totalPages}
                                    className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page < totalPages) setPage(page + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                {total > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                        {total} fichier{total > 1 ? 's' : ''} au total
                    </p>
                )}
            </div>

            <CloudMediaDetailSheet
                media={selected}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onDelete={setToDelete}
            />

            <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2Icon className="size-5 text-destructive"/>
                            Supprimer le fichier
                        </DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Le fichier &quot;{toDelete?.filename}&quot; sera définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToDelete(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Suppression…' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
