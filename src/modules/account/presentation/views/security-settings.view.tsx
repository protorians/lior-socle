"use client"

import React from "react";
import {toast} from "sonner";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {ActivityLockService} from "@liorian/sdk/infrastructure/utilities/activity-lock.service";
import {SettingsLayout} from "../../../../../library/modules/pos-management/presentation/components/settings-layout";
import {Input} from "@liorian/sdk/presentation/ui/input";
import {Label} from "@liorian/sdk/presentation/ui/label";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@liorian/sdk/presentation/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@liorian/sdk/presentation/ui/select";

const AUTO_LOCK_OPTIONS: Array<{label: string; value: number}> = [
    {label: "1 minute", value: 60 * 1000},
    {label: "5 minutes", value: 5 * 60 * 1000},
    {label: "15 minutes", value: 15 * 60 * 1000},
    {label: "30 minutes", value: 30 * 60 * 1000},
    {label: "1 heure", value: 60 * 60 * 1000},
    {label: "Jamais", value: 0},
];

export function SecuritySettingsView() {
    const {user} = useAuth();
    const [passwords, setPasswords] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [autoLockTimeout, setAutoLockTimeout] = React.useState<number | undefined>(undefined);
    const [savingAutoLock, setSavingAutoLock] = React.useState(false);

    React.useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        ActivityLockService.getTimeout(user.id)
            .then((timeout) => {
                if (!cancelled) setAutoLockTimeout(timeout);
            })
            .catch(() => {
                if (!cancelled) setAutoLockTimeout(3 * 60 * 1000);
            });
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPasswords(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation de changement de mot de passe
        console.log("Changing password:", passwords);
    };

    const handleAutoLockChange = async (value: string) => {
        if (!user?.id) return;
        const timeout = Number(value);
        setAutoLockTimeout(timeout);
        setSavingAutoLock(true);
        try {
            await ActivityLockService.setTimeoutPreference(user.id, timeout);
            ActivityLockService.updateTimeout(timeout);
            toast.success(timeout > 0
                ? "Durée de verrouillage automatique mise à jour"
                : "Verrouillage automatique désactivé");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSavingAutoLock(false);
        }
    };

    return (
        <SettingsLayout.Section>
            <SettingsLayout.Header
                title="Sécurité"
                description="Gérez la sécurité de votre compte et votre mot de passe."
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Verrouillage automatique</CardTitle>
                        <CardDescription>
                            Verrouillez l'écran après une période d'inactivité. Vous devrez alors
                            saisir votre mot de passe ou utiliser votre passkey pour vous déverrouiller.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="auto-lock-timeout">Durée d'inactivité avant verrouillage</Label>
                            <Select
                                value={autoLockTimeout === undefined ? "" : String(autoLockTimeout)}
                                onValueChange={handleAutoLockChange}
                                disabled={savingAutoLock}
                            >
                                <SelectTrigger id="auto-lock-timeout" className="w-60">
                                    <SelectValue placeholder="Choisir une durée">
                                        {savingAutoLock
                                            ? "Enregistrement…"
                                            : AUTO_LOCK_OPTIONS.find((o) => o.value === autoLockTimeout)?.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {AUTO_LOCK_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Cette préférence est enregistrée sur votre profil et s'applique à vos
                                prochaines sessions.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mot de passe</CardTitle>
                        <CardDescription>
                            Changez votre mot de passe pour sécuriser votre compte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                <Input 
                                    id="currentPassword" 
                                    name="currentPassword"
                                    type="password"
                                    value={passwords.currentPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                <Input 
                                    id="newPassword" 
                                    name="newPassword"
                                    type="password"
                                    value={passwords.newPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                <Input 
                                    id="confirmPassword" 
                                    name="confirmPassword"
                                    type="password"
                                    value={passwords.confirmPassword} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Mettre à jour le mot de passe</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout.Section>
    );
}
