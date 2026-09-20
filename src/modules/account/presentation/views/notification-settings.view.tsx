"use client"

import React from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {requestPushPermission} from "@liorian/sdk/infrastructure/utilities/push-permission.util";
import {NotificationsPushService} from "@liorian/sdk/application/service/notifications-push.service";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {SettingsLayout} from "../../../../../library/modules/pos-management/presentation/components/settings-layout";
import {Label} from "@liorian/sdk/presentation/ui/label";
import {Switch} from "@liorian/sdk/presentation/ui/switch";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card";
import {Activity} from "@liorian/sdk/presentation/components/activity";

interface NotificationSettingItem {
    key: string;
    label: string;
    description: string;
    defaultValue: boolean;
}

interface UserPreferenceResponse {
    id?: string;
    label?: string;
    value: string;
}

const NOTIFICATION_SETTINGS: { title: string; description: string; items: NotificationSettingItem[] }[] = [
    {
        title: "Notifications par email",
        description: "Choisissez les emails que vous souhaitez recevoir.",
        items: [
            {
                key: "notifications_email_security",
                label: "Emails de sécurité",
                description: "Recevez des alertes sur l'activité de votre compte.",
                defaultValue: true,
            },
            {
                key: "notifications_email_marketing",
                label: "Emails marketing",
                description: "Recevez des offres et des nouveautés.",
                defaultValue: false,
            },
        ],
    },
    {
        title: "Notifications Push",
        description: "Gérez les notifications sur votre navigateur.",
        items: [
            {
                key: "notifications_push_enabled",
                label: "Activer les notifications push",
                description: "Recevez des notifications en temps réel.",
                defaultValue: false,
            },
        ],
    },
];

function parsePreferenceValue(value: string): boolean {
    return String(value).toLowerCase() === "true";
}

export function NotificationSettingsView() {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
    const [pendingKeys, setPendingKeys] = React.useState<React.Key[]>([]);

    const preferencesQuery = useQuery({
        queryKey: ['user-preferences', user?.id],
        queryFn: async () => {
            const userId = user?.id;
            if (!userId) return [];
            const response = await UsersApiService.getPreferenceByUserId(userId);
            return ((response.data?.data ?? []) as UserPreferenceResponse[])
                .filter((preference) => !!preference.label);
        },
        enabled: !!user?.id,
    });

    const savedValues = React.useMemo(() => {
        const map = new Map<string, boolean>();
        for (const preference of preferencesQuery.data ?? []) {
            map.set(preference.label!, parsePreferenceValue(preference.value));
        }
        return map;
    }, [preferencesQuery.data]);

    const getValue = (item: NotificationSettingItem): boolean => {
        if (item.key in overrides) return overrides[item.key];
        return savedValues.get(item.key) ?? item.defaultValue;
    };

    const toggleMutation = useMutation({
        mutationFn: async ({key, next}: { key: string; next: boolean }) => {
            if (!user?.id) throw new Error("Utilisateur non trouvé");
            // Le backend effectue un upsert sur (user_id, label)
            const response = await UsersApiService.createPreference({
                user_id: user.id,
                label: key,
                value: String(next),
            });
            return response.data;
        },
        onSuccess: async (_data, variables) => {
            setOverrides(prev => {
                const {[variables.key]: _removed, ...rest} = prev;
                return rest;
            });
            setPendingKeys(prev => prev.filter(k => k !== variables.key));

            // Synchronise l'abonnement Web Push de cette instance avec la préférence
            if (variables.key === PUSH_NOTIFICATION_KEY && NotificationsPushService.isSupported) {
                const sync = variables.next
                    ? NotificationsPushService.subscribe()
                    : NotificationsPushService.unsubscribe();
                await sync.catch((error) => console.error("Push subscription sync failed", error));
            }

            await queryClient.invalidateQueries({queryKey: ['user-preferences', user?.id]});
            toast.success("Préférence enregistrée");
        },
        onError: (_error, variables) => {
            setOverrides(prev => {
                const {[variables.key]: _removed, ...rest} = prev;
                return rest;
            });
            setPendingKeys(prev => prev.filter(k => k !== variables.key));
            toast.error("Erreur lors de l'enregistrement de la préférence");
        },
    });

    const PUSH_NOTIFICATION_KEY = "notifications_push_enabled";

    const handleToggle = async (item: NotificationSettingItem, checked: boolean) => {
        if (!user?.id) return;

        // À l'activation des notifications push, demander d'abord l'autorisation
        // du navigateur ou de l'OS (Tauri). Sans accord, la préférence n'est pas enregistrée.
        if (item.key === PUSH_NOTIFICATION_KEY && checked) {
            setPendingKeys(prev => [...new Set([...prev, item.key])]);
            const permission = await requestPushPermission();
            setPendingKeys(prev => prev.filter(k => k !== item.key));

            if (permission === "unsupported") {
                toast.error("Les notifications push ne sont pas prises en charge sur cet appareil.");
                return;
            }
            if (permission === "denied") {
                toast.error("Autorisation refusée. Réactivez les notifications dans les réglages du navigateur ou du système.");
                return;
            }
            toast.success("Notifications push autorisées");
        }

        setOverrides(prev => ({...prev, [item.key]: checked}));
        setPendingKeys(prev => [...new Set([...prev, item.key])]);
        toggleMutation.mutate({key: item.key, next: checked});
    };

    const isLoadingPreferences = !preferencesQuery.isSuccess;

    const renderRow = (item: NotificationSettingItem) => {
        const isPending = pendingKeys.includes(item.key);
        return (
            <div key={item.key} className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isPending && <Activity.Loader size={16} />}
                    <Switch
                        id={item.key}
                        checked={getValue(item)}
                        onCheckedChange={(checked) => handleToggle(item, checked)}
                        disabled={isLoadingPreferences || toggleMutation.isPending}
                    />
                </div>
            </div>
        );
    };

    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Notifications"
                description="Gérez comment vous recevez les notifications."
            />

            <div className="grid gap-6">
                {NOTIFICATION_SETTINGS.map((section) => (
                    <Card key={section.title}>
                        <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {section.items.map(renderRow)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </SettingsLayout.Section>
    );
}
