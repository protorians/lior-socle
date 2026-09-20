"use client"

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {DataGrid, RowAction} from "@liorian/sdk/presentation/data-grid/data-grid";
import {DataGridSearchEngine} from "@liorian/sdk/presentation/data-grid/data-grid-search-engine";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {PaginationState, Table} from "@tanstack/react-table";
import {useRouter} from "next/navigation";
import {ArchiveIcon, EyeIcon, PencilIcon, WandSparklesIcon} from "lucide-react";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {HelloWorldApiService} from "../../application/service/hello-world-api-service";
import {HelloWorldInterface} from "../../domain/hello-world.interface";
import {getHelloWorldColumns} from "./hello-world-columns";
import {HelloWorldDetailsSheet} from "./hello-world-details-sheet";
import {handleEditHelloWorld} from "./create-hello-world-dialog";

export function HelloWorldDataGrid() {
    const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10});
    const [mounted, setMounted] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [details, setDetails] = useState<HelloWorldInterface | null>(null);

    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const {data, isLoading} = useQuery({
        queryKey: ['hello-world', 'table', search || 'all', pagination.pageIndex, pagination.pageSize],
        enabled: !!currentOrganization?.id,
        queryFn: async () => {
            const response = await HelloWorldApiService.getAll({
                search: search.trim() || undefined,
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            });
            const payload = (response.data as any)?.data ?? response.data as any;
            return {
                data: Array.isArray(payload) ? payload : (payload?.data ?? []),
                total: Array.isArray(payload) ? payload.length : (payload?.total ?? 0),
                totalPages: Array.isArray(payload)
                    ? Math.ceil(payload.length / pagination.pageSize)
                    : (payload?.totalPages ?? Math.ceil((payload?.total ?? 0) / pagination.pageSize)),
            };
        },
    });

    const items = data?.data ?? [];
    const total = data?.total ?? 0;
    const pageCount = total ? Math.ceil(total / pagination.pageSize) : 0;

    const invalidate = () => queryClient.invalidateQueries({queryKey: ['hello-world']});

    const archive = async (item: HelloWorldInterface) => {
        try {
            await HelloWorldApiService.archive(item.id);
            toast.success("Salutation archivée avec succès");
            invalidate();
        } catch {
            toast.error("Erreur lors de l'archivage de la salutation");
        }
    };

    const toolbar = (table: Table<HelloWorldInterface>) => (
        <div className="flex flex-row items-center gap-2 w-full">
            <DataGridSearchEngine
                table={table}
                value={search}
                onChange={setSearch}
            />
            {isLoading && (
                <div className="flex-auto flex items-center justify-center">
                    <Activity.Loader size={16}/>
                </div>
            )}
        </div>
    );

    const rowActions = (item: HelloWorldInterface): RowAction<HelloWorldInterface>[] => [
        {
            id: "details",
            label: "Détails",
            icon: <EyeIcon className="size-4"/>,
            onExecute: (c) => setDetails(c),
        },
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon className="size-4"/>,
            onExecute: (c) => handleEditHelloWorld(c, queryClient),
        },
        {
            id: "archive",
            label: "Archiver",
            variant: "destructive",
            icon: <ArchiveIcon className="size-4"/>,
            onExecute: (c) => archive(c),
        },
    ];

    useEffect(() => {
        if (!mounted) setMounted(true);
    }, []);

    return (
        <div className="flex-auto">
            {(items.length || mounted) ? (
                <>
                    <DataGrid
                        data={items}
                        columns={getHelloWorldColumns()}
                        getRowId={row => row.id}
                        enableSelection
                        actions={rowActions}
                        manualPagination
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        toolbar={(table) => toolbar(table)}
                    />

                    {details && (
                        <HelloWorldDetailsSheet
                            item={details}
                            opened={!!details}
                            onOpenChange={(open) => !open && setDetails(null)}
                            onChanged={() => invalidate()}
                        />
                    )}
                </>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <WandSparklesIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Hello World</EmptyTitle>
                        <EmptyDescription>Toutes vos salutations s&apos;afficheront ici</EmptyDescription>
                        <EmptyContent>
                            <Button onClick={router.refresh} variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    );
}