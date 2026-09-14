"use client"

import * as React from "react"
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {SettingsLayout} from "../../../../../external_modules/pos-management/presentation/components/settings-layout"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {Input} from "@sentients/sdk/presentation/ui/input"
import {Label} from "@sentients/sdk/presentation/ui/label"
import {Switch} from "@sentients/sdk/presentation/ui/switch"
import {Badge} from "@sentients/sdk/presentation/ui/badge"
import {toast} from "sonner"
import {PaletteIcon} from "lucide-react"
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";

const AVAILABLE_THEMES = [
    {id: 'default', label: 'Par défaut', description: 'Thème standard du système'},
    {id: 'dark', label: 'Sombre', description: 'Thème sombre'},
    {id: 'light', label: 'Clair', description: 'Thème clair'},
    {id: 'katon', label: 'Katon', description: 'Thème Katon'},
] as const

export function OrganizationThemesSettingsView() {
    const {currentOrganization} = useAuth()
    const queryClient = useQueryClient()
    const orgId = currentOrganization?.id

    const {data: preferences, isLoading} = useQuery<{id: string; label?: string | null; value: string}[]>({
        queryKey: ['organizations', orgId, 'preferences'],
        enabled: !!orgId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getPreferenceByOrgId(orgId!)
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
    })

    const defaultThemePref = preferences?.find(p => p.label === 'org-default-theme')
    const enabledThemesPref = preferences?.find(p => p.label === 'org-enabled-themes')

    const currentDefault = defaultThemePref?.value ?? 'default'
    const enabledThemes: string[] = React.useMemo(() => {
        if (!enabledThemesPref?.value) return AVAILABLE_THEMES.map(t => t.id)
        try {
            const parsed = JSON.parse(enabledThemesPref.value)
            return Array.isArray(parsed) ? parsed : AVAILABLE_THEMES.map(t => t.id)
        } catch {
            return AVAILABLE_THEMES.map(t => t.id)
        }
    }, [enabledThemesPref])

    const saveDefaultMutation = useMutation({
        mutationFn: async (themeId: string) => {
            return OrganizationsApiService.createPreference({
                organization_id: orgId,
                label: 'org-default-theme',
                value: themeId,
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'preferences']})
            toast.success("Thème par défaut enregistré")
        },
        onError: () => toast.error("Erreur lors de l'enregistrement"),
    })

    const saveEnabledMutation = useMutation({
        mutationFn: async (themes: string[]) => {
            return OrganizationsApiService.createPreference({
                organization_id: orgId,
                label: 'org-enabled-themes',
                value: JSON.stringify(themes),
            })
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['organizations', orgId, 'preferences']})
            toast.success("Thèmes activés enregistrés")
        },
        onError: () => toast.error("Erreur lors de l'enregistrement"),
    })

    function toggleTheme(themeId: string) {
        const next = enabledThemes.includes(themeId)
            ? enabledThemes.filter(t => t !== themeId)
            : [...enabledThemes, themeId]
        saveEnabledMutation.mutate(next)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40dvh]">
                <WaitingActivity size={24} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <SettingsLayout.Header
                title="Thèmes"
                description="Configurez les thèmes disponibles pour l'organisation"
            />

            <SettingsLayout.Section>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PaletteIcon className="size-4"/>
                            Thème par défaut
                        </CardTitle>
                        <CardDescription>
                            Thème appliqué par défaut aux membres de l'organisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {AVAILABLE_THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => saveDefaultMutation.mutate(theme.id)}
                                    disabled={saveDefaultMutation.isPending}
                                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                                        currentDefault === theme.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-border hover:bg-muted/40'
                                    }`}
                                >
                                    <div className={`size-3 rounded-full ${
                                        currentDefault === theme.id ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`}/>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{theme.label}</div>
                                        <div className="text-xs text-muted-foreground">{theme.description}</div>
                                    </div>
                                    {currentDefault === theme.id && (
                                        <Badge variant="secondary" className="text-[10px]">Actuel</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thèmes disponibles</CardTitle>
                        <CardDescription>
                            Activez ou désactivez les thèmes accessibles aux membres
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            {AVAILABLE_THEMES.map(theme => (
                                <div key={theme.id} className="flex items-center gap-3 rounded-lg border p-3">
                                    <Switch
                                        checked={enabledThemes.includes(theme.id)}
                                        onCheckedChange={() => toggleTheme(theme.id)}
                                        disabled={saveEnabledMutation.isPending}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{theme.label}</div>
                                        <div className="text-xs text-muted-foreground">{theme.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </SettingsLayout.Section>
        </div>
    )
}
