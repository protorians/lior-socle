"use client"

import * as React from "react"
import {useQuery} from "@tanstack/react-query"
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service"
import {OrganizationInterface} from "@liorian/sdk/domain/entities/organization.interface"
import {OrganizationsDataGrid} from "@/modules/organization/presentation/components/organizations-data-grid"
import {CreateOrganizationStepper} from "@/modules/organization/presentation/components/create-organization-stepper"
import {Activity} from "@liorian/sdk/presentation/components/activity"
import {Card, CardContent, CardDescription, CardHeader} from "@liorian/sdk/presentation/ui/card"
import {Building2Icon, LayersIcon, ShieldCheckIcon, UsersIcon} from "lucide-react"
import {DashboardLayout, View} from "@liorian/sdk/presentation/themes/katon"

export function OrganizationsView() {
    const {data: organizations} = useQuery<OrganizationInterface[]>({
        queryKey: ['organizations', 'view'],
        queryFn: async () => {
            const response = await OrganizationsApiService.getAll()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const items = organizations ?? []
    const total = items.length
    const active = items.filter(o => o.status !== false).length
    const totalModules = items.reduce((acc, o) => acc + (o.enabledModules?.length ?? 0), 0)
    const avgModules = total > 0 ? totalModules / total : 0

    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="px-6">
                    <DashboardLayout maxWidth="full">
                        <DashboardLayout.Header>
                            <DashboardLayout.HeaderTop>
                                <DashboardLayout.HeaderStart>
                                    <DashboardLayout.Icon size="lg">
                                        <Building2Icon className="size-5"/>
                                    </DashboardLayout.Icon>
                                    <div className="min-w-0">
                                        <DashboardLayout.Title>Organisations</DashboardLayout.Title>
                                        <DashboardLayout.Description>
                                            Gestion des organisations, membres, clés API et modules
                                        </DashboardLayout.Description>
                                    </div>
                                </DashboardLayout.HeaderStart>
                                <DashboardLayout.Actions>
                                    <CreateOrganizationStepper size="default"/>
                                </DashboardLayout.Actions>
                            </DashboardLayout.HeaderTop>
                        </DashboardLayout.Header>

                        <DashboardLayout.Body>
                            <Activity.Container variant="container" className="contents">
                                <Activity.Content>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <KpiCard
                                            label="Total"
                                            value={total}
                                            hint="Organisations"
                                            icon={<Building2Icon className="size-4"/>}
                                            color="blue"
                                        />
                                        <KpiCard
                                            label="Actives"
                                            value={active}
                                            hint={`${total > 0 ? Math.round((active / total) * 100) : 0}% du total`}
                                            icon={<ShieldCheckIcon className="size-4"/>}
                                            color="emerald"
                                        />
                                        <KpiCard
                                            label="Modules"
                                            value={totalModules}
                                            hint={`${avgModules.toFixed(1)} / organisation`}
                                            icon={<LayersIcon className="size-4"/>}
                                            color="violet"
                                        />
                                        <KpiCard
                                            label="Multi-tenant"
                                            value={items.filter(o => o.status !== false).length}
                                            hint="Locataires actifs"
                                            icon={<UsersIcon className="size-4"/>}
                                            color="amber"
                                        />
                                    </div>

                                    <OrganizationsDataGrid/>
                                </Activity.Content>
                            </Activity.Container>
                        </DashboardLayout.Body>
                    </DashboardLayout>
                </View.Frame>
            </View.Wrapper>
        </View>
    )
}

function KpiCard({label, value, hint, icon, color}: {
    label: string
    value: number
    hint?: string
    icon: React.ReactNode
    color: string
}) {
    const colorMap: Record<string, { gradient: string; icon: string }> = {
        emerald: {gradient: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20", icon: "bg-emerald-500/15 text-emerald-600"},
        blue: {gradient: "from-blue-500/10 to-blue-500/5 border-blue-500/20", icon: "bg-blue-500/15 text-blue-600"},
        amber: {gradient: "from-amber-500/10 to-amber-500/5 border-amber-500/20", icon: "bg-amber-500/15 text-amber-600"},
        violet: {gradient: "from-violet-500/10 to-violet-500/5 border-violet-500/20", icon: "bg-violet-500/15 text-violet-600"},
    }

    const palette = colorMap[color] ?? colorMap.blue

    return (
        <Card className={`border rounded-2xl shadow-none bg-gradient-to-br ${palette.gradient} overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">{label}</CardDescription>
                <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${palette.icon}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums tracking-tight">{value.toLocaleString('fr-FR')}</div>
                {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
            </CardContent>
        </Card>
    )
}
