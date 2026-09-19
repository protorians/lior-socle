"use client"

import {DataGrid, RowAction} from "@liorian/sdk/presentation/data-grid/data-grid";
import {getUsersColumns} from "@/modules/identity/presentation/components/users-columns";
import {useQuery} from "@tanstack/react-query";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {GetAllUsersFilterOptions, UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import {AppConfig} from "@liorian/sdk/domain/config/app.config";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {BanIcon, EyeIcon, LayersIcon, PencilIcon, TrashIcon, UsersIcon} from "lucide-react";
import {Waiting} from "@liorian/sdk/presentation/components/waiting";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {authUserConnectedStore} from "@liorian/sdk/infrastructure/stores/auth-user-connected.store";
import {Fragment, useEffect, useState} from "react";
import {DataGridSearchEngine} from "@liorian/sdk/presentation/data-grid/data-grid-search-engine";
import {PaginationState, Table} from "@tanstack/react-table";
import {FetchResponseWithMetaInterface} from "@liorian/sdk/domain/typing/response";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {UserDetailsSheet} from "@/modules/identity/presentation/components/user-details-sheet";
import {handleUpdateUser, UpdateUserStepper} from "@/modules/identity/presentation/components/update-user-stepper";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {useQueryClient} from "@tanstack/react-query";
import {useModalStepper} from "@liorian/sdk/presentation/modals/components/ModalStepper";
import {CreateUserInterface} from "@/modules/identity/domain/users.interface";


export function UsersDataGrid() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [mounted, setMounted] = useState<boolean>(false)
    const [filter, setFilter] = useState<GetAllUsersFilterOptions | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const [detailsUser, setDetailsUser] = useState<UserInterface | null>(null)
    const [updateUser, setUpdateUser] = useState<UserInterface | null>(null)

    const {getCurrentUser} = authUserConnectedStore()
    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const openStepper = useModalStepper<CreateUserInterface>({
        size: 'XXL'
    });
    const router = useRouter()
    const [data, setData] = useState<FetchResponseWithMetaInterface<UserInterface[]>>()
    const getUsers: () => Promise<FetchResponseWithMetaInterface<UserInterface[]>> = async () => {
        setLoading(true);
        const responses = await UsersApiService.getAll({
            ...filter,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize
        });
        setLoading(false);
        setData(responses.data)
        return responses.data;
    }
    const {isLoading} = useQuery<FetchResponseWithMetaInterface<UserInterface[]>>({
        queryKey: ['users', 'activities', 'table', filter || 'all', pagination.pageIndex, pagination.pageSize],
        enabled: !!getCurrentUser,
        queryFn: getUsers,
        refetchInterval: AppConfig.APP_REFRESH_UI
    })

    const deleteItems = async (selected: UserInterface[]) => {
        try {
            await UsersApiService.deleteMany(selected.map(s => s.id).filter((id): id is string => !!id))
            toast.success("Les utilisateurs ont été supprimés avec succès")
        } catch (error: any) {
        }
    }

    const toolbar = (table: Table<UserInterface>) => (
        <Fragment>
            <DataGridSearchEngine
                table={table}
                value={filter?.search}
                onChange={value => setFilter({...filter, search: value})}
            />

            {
                isLoading && (
                    <div className="flex-auto flex items-center justify-center">
                        <Activity.Loader size={16}/>
                    </div>
                )
            }
        </Fragment>
    )

    const pageCount = data?.meta?.total && data?.meta?.limit ? Math.ceil(data.meta?.total / data.meta?.limit) : 0;

    const rowActions = (user: UserInterface): RowAction<UserInterface>[] => [
        {
            id: "details",
            label: "Détails",
            icon: <EyeIcon className="size-4"/>,
            onExecute: (u) => setDetailsUser(u),
        },
        {
            id: "edit",
            label: "Modifier",
            icon: <PencilIcon className="size-4"/>,
            onExecute: (u) => handleUpdateUser(u, currentOrganization || null, queryClient, openStepper),
        },
        {
            id: "block",
            label: "Bloquer",
            variant: "destructive",
            icon: <BanIcon className="size-4"/>,
            onExecute: (u) => {
                // TODO: Implement block
                toast.info(`Bloquer ${u.username}`)
            },
        },
        {
            id: "delete",
            label: "Supprimer",
            variant: "destructive",
            icon: <TrashIcon className="size-4"/>,
            onExecute: async (u) => {
                await deleteItems([u])
            },
        },
    ]

    const usersDataGridColumns = getUsersColumns()

    useEffect(() => {
        if (!mounted) setMounted(true)
    }, []);

    return (
        <div className="flex-auto">
            {(data?.data.length || mounted) ? (
                <Fragment>
                    {/*{isLoading && (*/}
                    {/*    <div className="flex-auto flex flex-col items-center justify-center">*/}
                    {/*        <Waiting label={"Chargement de utilisateurs"}/>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    {/*{!isLoading && (*/}
                    <DataGrid
                        data={(data?.data || []) as UserInterface[]}
                        columns={usersDataGridColumns}
                        getRowId={row => row.id ?? row.username}
                        enableSelection
                        actions={rowActions}
                        manualPagination
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        toolbar={(table) => toolbar(table)}
                        bulkActions={[
                            {
                                id: "delete",
                                label: "Supprimer",
                                variant: "destructive",
                                onExecute: async (selected) => {
                                    await deleteItems(selected)
                                }
                            },
                        ]}
                    />
                    {/*)}*/}

                    {detailsUser && (
                        <UserDetailsSheet
                            user={detailsUser}
                            opened={!!detailsUser}
                            onOpenChange={(open) => !open && setDetailsUser(null)}
                        />
                    )}
                </Fragment>
            ) : (
                <div className="flex-auto flex flex-col items-center justify-center min-h-[70dvh]">
                    <Empty>
                        <EmptyMedia>
                            <UsersIcon size={80} strokeWidth={1}/>
                        </EmptyMedia>
                        <EmptyTitle>Utilisateurs</EmptyTitle>
                        <EmptyDescription>Tous les utilisateurs s'afficheront ici</EmptyDescription>
                        {isLoading && (<EmptyDescription>
                            <Waiting label={"En attente de utilisateurs"}/>
                        </EmptyDescription>)}
                        <EmptyContent>
                            <Button
                                onClick={router.refresh}
                                variant="outline">
                                Actualiser
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )}
        </div>
    )
}