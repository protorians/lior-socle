"use client"

import * as React from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {ModuleActivationApiService} from "@liorian/sdk/application/service/module-activation-api.service";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {ModuleConfigSettingsFieldInterface, ModuleConfigSettingsFieldType} from "@liorian/sdk/domain/entities/module-activation.interface";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@liorian/sdk/presentation/ui/dialog";
import {Input} from "@liorian/sdk/presentation/ui/input";
import {Label} from "@liorian/sdk/presentation/ui/label";
import {Separator} from "@liorian/sdk/presentation/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@liorian/sdk/presentation/ui/select";
import {Switch} from "@liorian/sdk/presentation/ui/switch";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {OrganizationsApiService} from "@liorian/sdk/application/service/organizations-api-service";

const INPUT_TYPES: Record<ModuleConfigSettingsFieldType, string> = {
    TEXT: "text",
    NUMBER: "number",
    EMAIL: "email",
    PASSWORD: "password",
    URL: "url",
    TEL: "tel",
    SELECT: "text",
    TOGGLE: "text",
};

export function formatModuleSerialKey(raw: string): string {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);
    return cleaned.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

export function getModuleConfigSettingsPreferenceLabel(moduleId: string): string {
    return `module_config_${moduleId}`;
}

interface ModuleStoreInstallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: ModuleDeclarationInterface;
}

export function ModuleStoreInstallDialog({open, onOpenChange, module}: ModuleStoreInstallDialogProps) {
    const {user, currentOrganization} = useAuth();
    const {updateModuleState, updateModuleConfig, setModuleInstalled} = useModuleStore();
    const queryClient = useQueryClient();

    const organizationId = currentOrganization?.id;
    const moduleId = module.key ?? module.identifier;
    const settingsFields = module.configSettings ?? [];

    const [serialKey, setSerialKey] = React.useState("");
    const [settings, setSettings] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        const defaults: Record<string, string> = {};
        settingsFields.forEach(field => {
            if (field.defaultValue !== undefined) defaults[field.key] = field.defaultValue;
        });
        setSettings({...defaults, ...(module.storeConfig ?? {})});
    }, [settingsFields, module.storeConfig]);

    const isSerialKeyComplete = serialKey.replace(/-/g, "").length === 32;
    const isMissingRequiredSetting = settingsFields
        .filter(field => field.type !== 'TOGGLE')
        .some(field => field.required && !(settings[field.key] ?? "").trim());

    const installMutation = useMutation({
        mutationFn: async () => {
            if (!organizationId) throw new Error("Organisation introuvable");

            // 1. Activer le module via clé série
            await ModuleActivationApiService.activateModule(organizationId, {
                moduleIdentifier: module.identifier,
                serialKey,
                auditId: user?.auditId,
            });

            // 2. Sauvegarder la configuration dans les préférences de l'organisation
            if (settingsFields.length > 0) {
                await OrganizationsApiService.createPreference({
                    organization_id: organizationId,
                    label: getModuleConfigSettingsPreferenceLabel(moduleId),
                    value: JSON.stringify(settings),
                });
            }
        },
        onSuccess: async () => {
            setModuleInstalled(module.identifier, true);
            updateModuleState(module.identifier, 'enabled');
            updateModuleConfig(module.identifier, settings);
            await queryClient.invalidateQueries({queryKey: ["module-activation"]});
            await queryClient.invalidateQueries({queryKey: ["organizations", organizationId, "preferences"]});
            toast.success(`Module « ${module.name} » installé et activé`);
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || `Erreur lors de l'installation du module « ${module.name} »`);
        },
    });

    const renderField = (field: ModuleConfigSettingsFieldInterface) => {
        const value = settings[field.key] ?? "";

        if (field.type === 'SELECT') {
            return (
                <Select
                    value={value}
                    onValueChange={(next) => setSettings(prev => ({...prev, [field.key]: next}))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder ?? "Sélectionner..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (field.type === 'TOGGLE') {
            return (
                <Switch
                    checked={value === 'true' || value === '1'}
                    onCheckedChange={(checked) => setSettings(prev => ({...prev, [field.key]: String(checked)}))}
                />
            );
        }

        return (
            <Input
                type={INPUT_TYPES[field.type ?? "TEXT"]}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => setSettings(prev => ({...prev, [field.key]: e.target.value}))}
                autoComplete="off"
            />
        );
    };

    const canSubmit = isSerialKeyComplete && !isMissingRequiredSetting && !installMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Installer « {module.name} »</DialogTitle>
                    <DialogDescription>
                        Saisissez la clé d&apos;activation et configurez les paramètres du module.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`${moduleId}-serial-key`}>Clé d&apos;activation</Label>
                        <Input
                            id={`${moduleId}-serial-key`}
                            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                            value={serialKey}
                            onChange={(event) => setSerialKey(formatModuleSerialKey(event.target.value))}
                            onKeyDown={(event) => event.key === "Enter" && canSubmit && installMutation.mutate()}
                            autoComplete="off"
                            spellCheck={false}
                            className="font-mono tracking-wide"
                        />
                        <p className="text-xs text-muted-foreground">Format : 8 blocs de 4 caractères.</p>
                    </div>

                    {settingsFields.length > 0 && (
                        <>
                            <Separator/>
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-medium">Paramètres du module</p>
                                {settingsFields.map((field) => (
                                    <div key={field.key} className="flex flex-col gap-1.5">
                                        <Label htmlFor={`${moduleId}-${field.key}`}>
                                            {field.label}
                                            {field.required && <span className="text-destructive">&nbsp;*</span>}
                                        </Label>
                                        {renderField(field)}
                                        {field.description && (
                                            <p className="text-xs text-muted-foreground">{field.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        className="w-full"
                        disabled={!canSubmit}
                        onClick={() => installMutation.mutate()}
                    >
                        {installMutation.isPending ? <Activity.Loader size={16}/> : "Installer et activer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}