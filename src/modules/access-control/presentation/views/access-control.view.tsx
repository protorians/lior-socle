"use client"

import * as React from "react"
import {DataGrid, type RowAction} from "@sentients/sdk/presentation/data-grid/data-grid"
import {DataGridSearchEngine} from "@sentients/sdk/presentation/data-grid/data-grid-search-engine"
import {DashboardLayout} from "@sentients/sdk/presentation/themes/katon/dashboard-layout"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@sentients/sdk/presentation/ui/tabs"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {PlusIcon, ShieldIcon, UsersIcon, KeyIcon, LockIcon, LayersIcon} from "lucide-react"
import {Label} from "@sentients/sdk/presentation/ui/label"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@sentients/sdk/presentation/ui/select"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {toast} from "sonner"

import {AccessControlApiService} from "../../application/service/access-control-api.service"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {useModalStepper} from "@sentients/sdk/presentation/modals/components/ModalStepper"
import {handleCreateRoleFromDefault} from "../components/create-role-from-default-stepper"
import type {CreateRoleFromDefaultInterface} from "../components/create-role-from-default-stepper"
import {accessControlColumns, type AccessControlRow} from "../components/access-control-columns"
import {getRoleLabel} from "@sentients/sdk/infrastructure/utilities/access-label.util"
import {AccessPermissionsDataGrid} from "../components/access-control-permissions-data-grid"
import {AccessAssignmentsDataGrid} from "../components/access-control-assignments-data-grid"
import {AccessAuditDataGrid} from "../components/access-control-audit-data-grid"
import {RolesSummaryType} from "../../domain/entities/roles.interface";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Waiting} from "@sentients/sdk/presentation/components/waiting";

export function AccessControlView() {
    const [roles, setRoles] = React.useState<AccessControlRow[]>([])
    const [loading, setLoading] = React.useState(true)
    const [summary, setSummary] = React.useState<RolesSummaryType | null>(null)
    const [organizationId, setOrganizationId] = React.useState<string | undefined>(undefined)
    const [roleSearch, setRoleSearch] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("roles")
    const [disabledRoles, setDisabledRoles] = React.useState<Set<string>>(new Set())
    const queryClient = useQueryClient()
    const openCreateRoleStepper = useModalStepper<CreateRoleFromDefaultInterface>({size: "XL"})

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                // 1. Charger le résumé pour les stats globales
                const summaryRes = await AccessControlApiService.getSummary()

                setSummary(summaryRes.data.data)

                // 2. Récupérer l'organisation courante (pour les onglets Affectations/Audit)
                const orgsRes = await OrganizationsApiService.getAll()
                const raw = orgsRes.data?.data
                const organizations = Array.isArray(raw) ? raw : (raw?.data ?? [])

                if (organizations.length > 0) {
                    setOrganizationId(organizations[0].id)
                }

                // 3. Charger les rôles par défaut (templates prédéfinis)
                const defaultsRes = await AccessControlApiService.getDefaultsInfo()
                const defaults = Array.isArray(defaultsRes.data) ? defaultsRes.data : defaultsRes.data?.data
                const defaultRoles = (Array.isArray(defaults) ? defaults : []).map((role: any) => ({
                    id: role.name ?? role.metadata?.name,
                    name: role.name ?? role.metadata?.name,
                    color: role.metadata?.color,
                    description: role.metadata?.description,
                    level: role.metadata?.level,
                    permissions: role.permissions,
                    permissionCount: role.permissionCount,
                }))

                // 4. Charger les rôles personnalisés de l'organisation
                let customRoles: AccessControlRow[] = []
                if (organizationId) {
                    const customRes = await AccessControlApiService.getRolesByOrg(organizationId)
                    const rawCustom = customRes.data?.data
                    const customs = Array.isArray(rawCustom) ? rawCustom : (rawCustom?.data ?? [])
                    customRoles = (Array.isArray(customs) ? customs : []).map((role: any) => ({
                        id: role.id ?? role.name,
                        name: role.name,
                        color: role.color,
                        description: role.description ?? role.metadata?.description,
                        level: role.level ?? role.metadata?.level,
                        permissions: role.permissions,
                        permissionCount: role.permissionCount,
                    }))
                }

                // Fusionner rôles par défaut + personnalisés dans la même grille (dédoublonnage par nom)
                const byName = new Map<string, AccessControlRow>()
                for (const role of [...defaultRoles, ...customRoles]) {
                    if (!byName.has(role.name)) byName.set(role.name, role)
                }
                const merged = Array.from(byName.values()).sort(
                    (a, b) => (b.level ?? 0) - (a.level ?? 0)
                )
                setRoles(merged)
            } catch (error) {
                console.error("Erreur lors du chargement des données d'accès:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const {data: assignedUsers = 0} = useQuery({
        queryKey: ['access-control', organizationId, 'assigned-users'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getMembers(organizationId as string)
            const raw = response.data?.data
            const members = Array.isArray(raw) ? raw : (raw?.data ?? [])
            return Array.isArray(members) ? members.length : 0
        },
    })

    const totalUsers = assignedUsers
    const totalRoles = roles.length

    const {data: auditCount = 0} = useQuery({
        queryKey: ['access-control', 'audit-count'],
        queryFn: async () => {
            const response = await UserActivitiesApiService.getAll({limit: 100})
            const raw = response.data?.data
            const activities = Array.isArray(raw) ? raw : []
            return activities.length
        },
    })

    // Nombre de lignes de permissions (rôle × domaine) issues des rôles par défaut
    const totalPermissions = React.useMemo(() => {
        return roles.reduce((acc, role) => {
            const perms = role.permissions ?? {}
            const count = Object.entries(perms).filter(([, cap]) => !!cap).length
            return acc + count
        }, 0)
    }, [roles])

    // Rôles filtrés par la barre de recherche
    const filteredRoles = React.useMemo(() => {
        const query = roleSearch.trim().toLowerCase()
        const base = query
            ? roles.filter(role =>
                (role.name ?? '').toLowerCase().includes(query) ||
                (role.description ?? '').toLowerCase().includes(query)
            )
            : roles
        return base.map(role => ({...role, disabled: disabledRoles.has(role.id)}))
    }, [roles, roleSearch, disabledRoles])

    const handleCreateFromRole = async (role: AccessControlRow) => {
        try {
            await handleCreateRoleFromDefault(role, organizationId, openCreateRoleStepper, queryClient)
        } catch (error) {
            console.error("Erreur lors de la création du rôle:", error)
        }
    }

    const handleToggleRoleStatus = (role: AccessControlRow) => {
        const id = role.id
        setDisabledRoles(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
        if (role.disabled) {
            toast.success("Rôle activé", {description: `${getRoleLabel(role.name)} est de nouveau actif.`})
        } else {
            toast.success("Rôle désactivé", {description: `${getRoleLabel(role.name)} a été désactivé.`})
        }
    }

    const roleActions = (role: AccessControlRow): RowAction<AccessControlRow>[] => [
        {
            id: "create",
            label: "Créer depuis ce rôle",
            onExecute: () => handleCreateFromRole(role),
        },
        {
            id: "permissions",
            label: "Consulter les permissions",
            onExecute: () => setActiveTab("permissions"),
        },
        {
            id: "assign",
            label: "Assigner aux utilisateurs",
            onExecute: () => setActiveTab("assignments"),
        },
        {
            id: "status",
            label: role.disabled ? "Activer" : "Désactiver",
            variant: role.disabled ? undefined : "destructive",
            onExecute: () => handleToggleRoleStatus(role),
        },
    ]

    // Calculer des stats globales à partir du résumé
    const stats = React.useMemo(() => {
        if (!summary) return {domains: 0, fullAccess: 0, blocked: 0}

        const rolesList = Object.values(summary).filter((role) => role.stats)
        const firstRole = rolesList[0]

        return {
            domains: firstRole?.stats?.totalDomains ?? 0,
            fullAccess: rolesList.reduce((acc, curr) => acc + curr.stats?.fullAccess, 0),
            blocked: rolesList.reduce((acc, curr) => acc + curr.stats?.blocked, 0)
        }
    }, [summary])

    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="">
                    <DashboardLayout maxWidth={'full'} className="flex-1 min-h-0">
                        <DashboardLayout.Header>
                            <DashboardLayout.HeaderTop>
                                <DashboardLayout.HeaderStart>
                                    <DashboardLayout.Icon>
                                        <ShieldIcon className="size-4"/>
                                    </DashboardLayout.Icon>
                                    <div className="flex flex-col gap-0.5">
                                        <DashboardLayout.Title>Contrôle d'accès</DashboardLayout.Title>
                                        <DashboardLayout.Description>
                                            Gestion des permissions et rôles
                                        </DashboardLayout.Description>
                                    </div>
                                </DashboardLayout.HeaderStart>
                                <DashboardLayout.Actions>
                                    <Button size="sm">
                                        <PlusIcon/>
                                        <span className="hidden sm:inline">Ajouter un Rôle</span>
                                    </Button>
                                </DashboardLayout.Actions>
                            </DashboardLayout.HeaderTop>

                            <DashboardLayout.Metrics cols={4}>
                                <DashboardLayout.MetricCard
                                    label="Total Rôles"
                                    value={totalRoles}
                                    icon={<ShieldIcon className="size-4"/>}
                                />
                                <DashboardLayout.MetricCard
                                    label="Utilisateurs Assignés"
                                    value={totalUsers}
                                    icon={<UsersIcon className="size-4"/>}
                                />
                                <DashboardLayout.MetricCard
                                    label="Domaines Couverts"
                                    value={stats.domains}
                                    icon={<LayersIcon className="size-4"/>}
                                />
                                <DashboardLayout.MetricCard
                                    label="Accès Complets"
                                    value={stats.fullAccess}
                                    icon={<KeyIcon className="size-4"/>}
                                />
                                <DashboardLayout.MetricCard
                                    label="Restrictions"
                                    value={stats.blocked}
                                    icon={<LockIcon className="size-4"/>}
                                />
                            </DashboardLayout.Metrics>
                        </DashboardLayout.Header>

                        <DashboardLayout.Body>
                            <DashboardLayout.Section>
                                <DashboardLayout.SectionHeader>
                                    <div className="flex flex-col gap-0.5">
                                        <DashboardLayout.SectionTitle>Rôles et Permissions</DashboardLayout.SectionTitle>
                                        <DashboardLayout.SectionDescription>
                                            Consultez et gérez les rôles de votre organisation
                                        </DashboardLayout.SectionDescription>
                                    </div>
                                    <DashboardLayout.SectionActions>
                                        {/*<DashboardLayout.ActionPill icon={<ShieldIcon className="size-3.5"/>}>*/}
                                        {/*    Nouveau Rôle*/}
                                        {/*</DashboardLayout.ActionPill>*/}
                                        {/*<DashboardLayout.ActionPill icon={<KeyIcon className="size-3.5"/>}>*/}
                                        {/*    Clés API*/}
                                        {/*</DashboardLayout.ActionPill>*/}
                                        {/*<DashboardLayout.ActionPill icon={<LockIcon className="size-3.5"/>}>*/}
                                        {/*    Audit de Sécurité*/}
                                        {/*</DashboardLayout.ActionPill>*/}
                                    </DashboardLayout.SectionActions>
                                </DashboardLayout.SectionHeader>

                                <DashboardLayout.SectionContent>
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={setActiveTab}
                                        className="w-full flex-col justify-start gap-4"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <Label htmlFor="view-selector" className="sr-only">
                                                Vue
                                            </Label>
                                            <Select value={activeTab} onValueChange={setActiveTab}>
                                                <SelectTrigger
                                                    className="flex w-fit md:hidden"
                                                    size="sm"
                                                    id="view-selector"
                                                >
                                                    <SelectValue placeholder="Choisir une vue"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="roles">Rôles</SelectItem>
                                                        <SelectItem value="permissions">Permissions</SelectItem>
                                                        <SelectItem value="assignments">Affectations</SelectItem>
                                                        <SelectItem value="logs">Logs d'audit</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <TabsList
                                                className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 md:flex">
                                                <TabsTrigger value="roles">Rôles <Badge variant="secondary">{totalRoles}</Badge></TabsTrigger>
                                                <TabsTrigger value="permissions">
                                                    Permissions <Badge variant="secondary">{totalPermissions}</Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="assignments">
                                                    Affectations <Badge variant="secondary">{totalUsers}</Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="logs">Audit <Badge variant="secondary">{auditCount}</Badge></TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent
                                            value="roles"
                                            className="relative flex flex-col gap-6 overflow-auto"
                                        >
                                            {loading ? (
                                                <div
                                                    className="flex h-64 items-center justify-center text-muted-foreground">
                                                    <Waiting label="Chargement des rôles..."/>
                                                </div>
                                            ) : (
                                                <DataGrid
                                                    data={filteredRoles}
                                                    columns={accessControlColumns}
                                                    getRowId={(row) => row.id ?? row.name}
                                                    enableDnd
                                                    enableSelection
                                                    actions={roleActions}
                                                    containerClassName="gap-0"
                                                    toolbar={(table) => (
                                                        <DataGridSearchEngine
                                                            table={table}
                                                            value={roleSearch}
                                                            onChange={setRoleSearch}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </TabsContent>
                                        <TabsContent
                                            value="permissions"
                                            className="flex flex-col gap-6"
                                        >
                                            <AccessPermissionsDataGrid/>
                                        </TabsContent>
                                        <TabsContent value="assignments" className="flex flex-col">
                                            <AccessAssignmentsDataGrid organizationId={organizationId}/>
                                        </TabsContent>
                                        <TabsContent
                                            value="logs"
                                            className="flex flex-col gap-6"
                                        >
                                            <AccessAuditDataGrid organizationId={organizationId}/>
                                        </TabsContent>
                                    </Tabs>
                                </DashboardLayout.SectionContent>
                            </DashboardLayout.Section>
                        </DashboardLayout.Body>
                    </DashboardLayout>
                </Main>
                <Footer>

                </Footer>
            </Wrapper>
        </View>
    )
}
