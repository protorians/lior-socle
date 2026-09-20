"use client"

import * as React from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {ModuleStoreLayout} from "@/modules/modules-management/presentation/views/module-store-layout.view";
import {SettingsLayout} from "@/library/modules/pos-management/presentation/components/settings-layout";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Switch} from "@liorian/sdk/presentation/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@liorian/sdk/presentation/ui/select";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service";
import {DownloadIcon, SettingsIcon, ShieldCheckIcon, RotateCwIcon, LockIcon} from "lucide-react";

const STORE_SETTING_LABEL = "liorian:store:settings";
const ANALYTICS_SHARE_LABEL = "liorian:analytics:share";

interface StoreSettingsData {
    autoSync: boolean;
    checkUpdatesOnLaunch: boolean;
    showDefaultModules: boolean;
    installationMode: 'serial_key' | 'direct';
    updateCheckInterval: string;
    downloadConcurrency: string;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
    autoSync: true,
    checkUpdatesOnLaunch: true,
    showDefaultModules: false,
    installationMode: 'serial_key',
    updateCheckInterval: '24',
    downloadConcurrency: '3',
};

type CombinedSettingItem = {id?: string; label: string; value: string}[];

export function ModuleStoreSettingsView() {
    const {currentOrganization} = useAuth();
    const queryClient = useQueryClient();
    const organizationId = currentOrganization?.id;

    const [settings, setSettings] = React.useState<StoreSettingsData>(DEFAULT_SETTINGS);
    const [saved, setSaved] = React.useState<StoreSettingsData>(DEFAULT_SETTINGS);
    const [analyticsShare, setAnalyticsShare] = React.useState(false);
    const [analyticsShareLoaded, setAnalyticsShareLoaded] = React.useState(false);

    const preferenceQuery = useQuery<CombinedSettingItem>({
        queryKey: ["store-settings", organizationId],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getPreferenceByOrgId(organizationId!);
            const raw = response.data?.data;
            const prefs = Array.isArray(raw) ? raw : (raw?.data ?? []);
            const found = (prefs as {label?: string; value: string}[]).find(p => p?.label === STORE_SETTING_LABEL);
            if (!found) return [];
            try {
                const parsed = JSON.parse(found.value);
                return typeof parsed === "object" && parsed !== null ? parsed : {};
            } catch {
                return [];
            }
        },
    });

    React.useEffect(() => {
        if (preferenceQuery.data) {
            setSettings({...DEFAULT_SETTINGS, ...preferenceQuery.data});
            setSaved({...DEFAULT_SETTINGS, ...preferenceQuery.data});
        }
    }, [preferenceQuery.data]);

    const analyticsPrefQuery = useQuery<{id?: string; label?: string; value: string}[]>({
        queryKey: ["org-preference", ANALYTICS_SHARE_LABEL, organizationId],
        enabled: !!organizationId,
        queryFn: async () => {
            const response = await OrganizationsApiService.getPreferenceByOrgId(organizationId!);
            const raw = response.data?.data;
            const prefs = Array.isArray(raw) ? raw : (raw?.data ?? []);
            return (prefs as {id?: string; label?: string; value: string}[]).filter(p => p?.label === ANALYTICS_SHARE_LABEL);
        },
    });

    React.useEffect(() => {
        if (!analyticsShareLoaded && analyticsPrefQuery.data) {
            setAnalyticsShare(analyticsPrefQuery.data.some(p => p.value === 'true'));
            setAnalyticsShareLoaded(true);
        }
    }, [analyticsPrefQuery.data, analyticsShareLoaded]);

    const shareMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            if (!organizationId) throw new Error("Organisation introuvable");
            const existing = analyticsPrefQuery.data?.find(p => p.id);
            const payload = {
                organization_id: organizationId,
                label: ANALYTICS_SHARE_LABEL,
                value: enabled ? 'true' : 'false',
            };
            if (existing?.id) {
                await OrganizationsApiService.updatePreference(existing.id, payload);
            } else {
                await OrganizationsApiService.createPreference(payload);
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["org-preference", ANALYTICS_SHARE_LABEL, organizationId]});
            await queryClient.invalidateQueries({queryKey: ["store", "usage-analytics", organizationId]});
            toast.success("Préférence de partage de données mise à jour");
        },
        onError: () => {
            setAnalyticsShare(prev => !prev);
            toast.error("Erreur lors de la mise à jour de la préférence de partage");
        },
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!organizationId) throw new Error("Organisation introuvable");
            await OrganizationsApiService.createPreference({
                organization_id: organizationId,
                label: STORE_SETTING_LABEL,
                value: JSON.stringify(settings),
            });
        },
        onSuccess: async () => {
            setSaved(settings);
            await queryClient.invalidateQueries({queryKey: ["store-settings", organizationId]});
            await queryClient.invalidateQueries({queryKey: ["organizations", organizationId, "preferences"]});
            toast.success("Paramètres du store enregistrés");
        },
        onError: () => toast.error("Erreur lors de l'enregistrement des paramètres"),
    });

    const set = <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) =>
        setSettings(prev => ({...prev, [key]: value}));

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(saved);
    const isLoading = preferenceQuery.isLoading;

    return (
        <ModuleStoreLayout>
            <SettingsLayout>
                <SettingsLayout.Container>
                    <div className="flex flex-col gap-6 min-w-0">
                        <SettingsLayout.Header
                            title="Paramètres du store"
                            description="Configurer le comportement global des applications dans le store."
                        />

                <SettingsLayout.Section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RotateCwIcon className="size-4"/>
                                Synchronisation
                            </CardTitle>
                            <CardDescription>
                                Gestion des mises à jour et de la synchronisation des modules installés.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Activity.Loader size={24}/>
                                </div>
                            ) : (
                                <>
                                    <SettingsRow
                                        title="Synchronisation automatique"
                                        description="Synchroniser automatiquement l'état des modules avec le backend."
                                    >
                                        <Switch
                                            checked={settings.autoSync}
                                            onCheckedChange={(v) => set('autoSync', v)}
                                        />
                                    </SettingsRow>

                                    <SettingsRow
                                        title="Vérifier les mises à jour au lancement"
                                        description="Vérifier automatiquement les mises à jour des modules au démarrage de l'application."
                                    >
                                        <Switch
                                            checked={settings.checkUpdatesOnLaunch}
                                            onCheckedChange={(v) => set('checkUpdatesOnLaunch', v)}
                                        />
                                    </SettingsRow>

                                    <SettingsRow
                                        title="Fréquence de vérification des mises à jour"
                                        description="Intervalle en heures entre deux vérifications automatiques."
                                    >
                                        <Select
                                            value={settings.updateCheckInterval}
                                            onValueChange={(v) => set('updateCheckInterval', v)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">Toutes les 6 h</SelectItem>
                                                <SelectItem value="12">Toutes les 12 h</SelectItem>
                                                <SelectItem value="24">Chaque jour</SelectItem>
                                                <SelectItem value="168">Chaque semaine</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </SettingsRow>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </SettingsLayout.Section>

                <SettingsLayout.Section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DownloadIcon className="size-4"/>
                                Installation
                            </CardTitle>
                            <CardDescription>
                                Mode d'installation et limites de téléchargement des modules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            <SettingsRow
                                title="Mode d'installation"
                                description="Exiger une clé série (licence) ou installer directement les modules."
                            >
                                <Select
                                    value={settings.installationMode}
                                    onValueChange={(v) => set('installationMode', v as 'serial_key' | 'direct')}
                                >
                                    <SelectTrigger className="w-44">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="serial_key">Clé série requise</SelectItem>
                                        <SelectItem value="direct">Installation directe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingsRow>

                            <SettingsRow
                                title="Téléchargements simultanés"
                                description="Nombre maximal de modules téléchargés en parallèle."
                            >
                                <Select
                                    value={settings.downloadConcurrency}
                                    onValueChange={(v) => set('downloadConcurrency', v)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingsRow>
                        </CardContent>
                    </Card>
                </SettingsLayout.Section>

                <SettingsLayout.Section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheckIcon className="size-4"/>
                                Visibilité
                            </CardTitle>
                            <CardDescription>
                                Contrôler l'affichage des modules dans le store.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            <SettingsRow
                                title="Afficher les modules par défaut"
                                description="Montrer les modules système (par défaut) dans l'onglet Explorer."
                            >
                                <Switch
                                    checked={settings.showDefaultModules}
                                    onCheckedChange={(v) => set('showDefaultModules', v)}
                                />
                            </SettingsRow>
                        </CardContent>
                    </Card>
                </SettingsLayout.Section>

                <SettingsLayout.Section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LockIcon className="size-4"/>
                                Confidentialité
                            </CardTitle>
                            <CardDescription>
                                Partage de données d'utilisation anonymes pour améliorer le store.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            <SettingsRow
                                title="Partager les données d'utilisation"
                                description="Autoriser l'envoi du temps d'utilisation et de la fréquence des modules (anonyme). Les stats d'usage s'affichent alors dans le widget Store."
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {analyticsShare ? "Activé" : "Désactivé"}
                                    </span>
                                    <Switch
                                        checked={analyticsShare}
                                        disabled={shareMutation.isPending}
                                        onCheckedChange={(v) => {
                                            setAnalyticsShare(v);
                                            shareMutation.mutate(v);
                                        }}
                                    />
                                </div>
                            </SettingsRow>
                        </CardContent>
                    </Card>
                </SettingsLayout.Section>

                <div className="flex items-center justify-between gap-4 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SettingsIcon className="size-4"/>
                        {hasChanges
                            ? <Badge variant="secondary">Modifications non enregistrées</Badge>
                            : <span>Paramètres à jour</span>}
                    </div>
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!hasChanges || saveMutation.isPending}
                    >
                        {saveMutation.isPending ? <Activity.Loader size={14}/> : "Enregistrer les paramètres"}
                    </Button>
                </div>
                    </div>
                </SettingsLayout.Container>
            </SettingsLayout>
        </ModuleStoreLayout>
    );
}

interface SettingsRowProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

function SettingsRow({title, description, children}: SettingsRowProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 max-w-lg">
                <div className="text-sm font-medium">{title}</div>
                {description && (
                    <div className="text-xs text-muted-foreground">{description}</div>
                )}
            </div>
            {children}
        </div>
    );
}