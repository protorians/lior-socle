"use client"

import * as React from "react"
import {useQuery} from "@tanstack/react-query"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {OrganizationInterface} from "@sentients/sdk/domain/entities/organization.interface"
import {ModuleEnum} from "@sentients/sdk/domain/enums/module.enum"
import {EditOrganizationStepper} from "@/modules/organization/presentation/components/create-organization-stepper"
import {OrganizationModulesPanel} from "@/modules/organization/presentation/components/organization-modules-panel"
import {OrganizationMembersDataGrid} from "@/modules/organization/presentation/components/organization-members-data-grid"
import {OrganizationApiKeysDataGrid} from "@/modules/organization/presentation/components/organization-api-keys-data-grid"
import {CreateApiKeyStepper} from "@/modules/organization/presentation/components/create-api-key-stepper"
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@sentients/sdk/presentation/ui/tabs"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card"
import {
    Building2Icon,
    KeyRoundIcon,
    LayersIcon,
    ShieldCheckIcon,
    ShieldAlertIcon,
    UsersIcon,
} from "lucide-react"
import {DashboardLayout, Header, Main, View} from "@sentients/sdk/presentation/themes/katon"
import {Wrapper} from "@/core/presentation/themes/katon/wrapper"
import {Waiting} from "@sentients/sdk/presentation/components/waiting"

export function OrganizationDetailsView({organizationId}: { organizationId: string }) {
    const {data: organization, isLoading} = useQuery<OrganizationInterface | null>({
        queryKey: ['organizations', organizationId],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getById(organizationId)
            const raw = response.data?.data
            return raw ?? null
        },
    })

    const {data: members} = useQuery({
        queryKey: ['organizations', organizationId, 'members'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getMembers(organizationId)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const {data: apiKeys} = useQuery({
        queryKey: ['organizations', organizationId, 'api-keys'],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getApiKeys(organizationId)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const active = organization ? organization.status !== false : false
    const enabledModules = organization ? ((organization.enabledModules ?? []) as ModuleEnum[]) : []

    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="px-6">
                    <DashboardLayout maxWidth="full">
                        <DashboardLayout.Header>
                            <DashboardLayout.HeaderTop>
                                <DashboardLayout.HeaderStart>
                                    <DashboardLayout.Icon size="lg">
                                        <Building2Icon className="size-5"/>
                                    </DashboardLayout.Icon>
                                    <div className="min-w-0">
                                        <DashboardLayout.Title>
                                            {organization?.name ?? 'Organisation'}
                                        </DashboardLayout.Title>
                                        <DashboardLayout.Description>
                                            {organization?.description || 'Détails de l\'organisation'}
                                        </DashboardLayout.Description>
                                    </div>
                                    {organization && (
                                        <Badge variant="outline" className="px-1.5 ml-2">
                                            {active ? (
                                                <ShieldCheckIcon className="size-4 text-emerald-500 mr-1"/>
                                            ) : (
                                                <ShieldAlertIcon className="size-4 text-muted-foreground mr-1"/>
                                            )}
                                            {active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    )}
                                </DashboardLayout.HeaderStart>
                                <DashboardLayout.Actions>
                                    {organization && (
                                        <EditOrganizationStepper organization={organization}/>
                                    )}
                                </DashboardLayout.Actions>
                            </DashboardLayout.HeaderTop>
                        </DashboardLayout.Header>

                        <DashboardLayout.Body>
                            {isLoading ? (
                                <div className="flex items-center justify-center min-h-[40dvh]">
                                    <Waiting label="Chargement de l'organisation..."/>
                                </div>
                            ) : !organization ? (
                                <div className="flex items-center justify-center min-h-[40dvh] text-muted-foreground">
                                    Organisation introuvable
                                </div>
                            ) : (
                                <AnimatedContent variant="container" className="contents">
                                    <div className="flex-auto flex flex-col gap-6">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <StatCard label="Membres" value={members?.length ?? 0} icon={<UsersIcon className="size-4"/>}/>
                                            <StatCard label="Clés API" value={apiKeys?.length ?? 0} icon={<KeyRoundIcon className="size-4"/>}/>
                                            <StatCard label="Modules" value={enabledModules.length} icon={<LayersIcon className="size-4"/>}/>
                                            <StatCard
                                                label="Statut"
                                                value={active ? 1 : 0}
                                                icon={<ShieldCheckIcon className="size-4"/>}
                                            />
                                        </div>

                                        <Tabs defaultValue="overview" className="w-full flex-col justify-start gap-6">
                                            <TabsList>
                                                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                                                <TabsTrigger value="modules">Modules</TabsTrigger>
                                                <TabsTrigger value="members">
                                                    Membres <Badge variant="secondary">{members?.length ?? 0}</Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="api-keys">
                                                    Clés API <Badge variant="secondary">{apiKeys?.length ?? 0}</Badge>
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="overview" className="flex flex-col gap-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Informations</CardTitle>
                                                            <CardDescription>Profil de l'organisation</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="flex flex-col gap-2 text-sm">
                                                            <div className="flex justify-between border-b pb-2">
                                                                <span className="text-muted-foreground">Nom</span>
                                                                <span className="font-medium">{organization.name}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                <span className="text-muted-foreground">Description</span>
                                                                <span className="font-medium text-right">{organization.description || '—'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                <span className="text-muted-foreground">Identifiant</span>
                                                                <span className="font-mono text-xs">{organization.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Propriétaire</span>
                                                                <span className="font-mono text-xs">{organization.ownerId ?? '—'}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Modules activés</CardTitle>
                                                            <CardDescription>{enabledModules.length} module(s)</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="flex flex-wrap gap-1.5">
                                                            {enabledModules.length === 0 && (
                                                                <span className="text-muted-foreground text-sm">Aucun module activé</span>
                                                            )}
                                                            {enabledModules.map(m => (
                                                                <Badge key={m} variant="secondary">{m}</Badge>
                                                            ))}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="modules" className="flex flex-col">
                                                <OrganizationModulesPanel organizationId={organizationId} enabledModules={enabledModules}/>
                                            </TabsContent>

                                            <TabsContent value="members" className="flex flex-col gap-4">
                                                <OrganizationMembersDataGrid organizationId={organizationId}/>
                                            </TabsContent>

                                            <TabsContent value="api-keys" className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground">Gérez les accès programmatiques.</p>
                                                    <CreateApiKeyStepper organizationId={organizationId}/>
                                                </div>
                                                <OrganizationApiKeysDataGrid organizationId={organizationId}/>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </AnimatedContent>
                            )}
                        </DashboardLayout.Body>
                    </DashboardLayout>
                </Main>
            </Wrapper>
        </View>
    )
}

function StatCard({label, value, icon}: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <Card className="border rounded-2xl shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">{label}</CardDescription>
                <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums tracking-tight">{value.toLocaleString('fr-FR')}</div>
            </CardContent>
        </Card>
    )
}
