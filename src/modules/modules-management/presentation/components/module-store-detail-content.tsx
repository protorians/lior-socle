"use client"

import * as React from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {ModuleStoreApiService} from "@sentients/sdk/application/service/module-store-api.service";
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth";
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {ModuleConfigSettingsFieldInterface, ModuleConfigSettingsFieldType} from "@sentients/sdk/domain/entities/module-activation.interface";
import {MODULE_CATEGORY_LABELS, MODULE_CATEGORY_ICONS, ModuleCategory} from "@sentients/sdk/domain/enums/module-category.enum";
import {DynamicIcon} from "@sentients/sdk/presentation/components/dynamic-icon";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Input} from "@sentients/sdk/presentation/ui/input";
import {Label} from "@sentients/sdk/presentation/ui/label";
import {Separator} from "@sentients/sdk/presentation/ui/separator";
import {Switch} from "@sentients/sdk/presentation/ui/switch";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@sentients/sdk/presentation/ui/select";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service";
import {getModuleConfigSettingsPreferenceLabel} from "./module-store-install-dialog";
import {formatModuleSerialKey} from "./module-store-install-dialog";
import {ModuleStoreInstallDialog} from "./module-store-install-dialog";

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

function ModuleStateBadge({state}: {state?: string}) {
    const config: Record<string, {label: string; variant: "default" | "secondary" | "destructive" | "outline"}> = {
        enabled:      {label: "Activé",       variant: "default"},
        installed:    {label: "Installé",     variant: "secondary"},
        available:    {label: "Disponible",   variant: "outline"},
        disabled:     {label: "Désactivé",    variant: "secondary"},
        expired:      {label: "Expiré",       variant: "destructive"},
        revoked:      {label: "Révoqué",      variant: "destructive"},
        failed:       {label: "Échoué",       variant: "destructive"},
        activating:   {label: "Activation…",  variant: "default"},
        downloading:  {label: "Téléchargement…", variant: "default"},
        incompatible: {label: "Incompatible", variant: "destructive"},
    };

    const {label, variant} = config[state ?? "available"] ?? config.available;
    return <Badge variant={variant}>{label}</Badge>;
}

interface ModuleStoreDetailContentProps {
    module: ModuleDeclarationInterface;
    onChanged?: () => void | Promise<void>;
    onEditFiche?: () => void;
}

export function ModuleStoreDetailContent({module, onChanged, onEditFiche}: ModuleStoreDetailContentProps) {
    const {user, currentOrganization} = useAuth();
    const {updateModuleState, updateModuleConfig, setModuleInstalled, toggleModule} = useModuleStore();
    const queryClient = useQueryClient();
    const organizationId = currentOrganization?.id;
    const moduleId = module.key ?? module.identifier;
    const settingsFields = module.configSettings ?? [];

    const [settings, setSettings] = React.useState<Record<string, string>>(module.storeConfig ?? {});
    const [activeTab, setActiveTab] = React.useState("info");
    const [showInstall, setShowInstall] = React.useState(false);

    const savedSettingsQuery = useQuery<Record<string, string>>({
        queryKey: ["module-config", organizationId, moduleId],
        enabled: !!organizationId && !!moduleId && module.isInstalled === true,
        queryFn: async () => {
            try {
                const response = await OrganizationsApiService.getPreferenceByOrgId(organizationId!);
                const preferences = response.data?.data;
                if (!Array.isArray(preferences)) return {};
                const found = preferences.find(p => p?.label === getModuleConfigSettingsPreferenceLabel(moduleId));
                if (!found) return {};
                const parsed = JSON.parse(found.value);
                return typeof parsed === "object" && parsed !== null ? parsed : {};
            } catch {
                return {};
            }
        },
    });

    React.useEffect(() => {
        if (savedSettingsQuery.data) {
            setSettings(savedSettingsQuery.data);
        }
    }, [savedSettingsQuery.data]);

    const deactivateMutation = useMutation({
        mutationFn: async () => {
            if (!organizationId) throw new Error("Organisation introuvable");
            await ModuleStoreApiService.deactivateModule(organizationId, moduleId);
        },
        onSuccess: async () => {
            setModuleInstalled(module.identifier, false);
            updateModuleState(module.identifier, 'disabled');
            await queryClient.invalidateQueries({queryKey: ["module-activation"]});
            toast.success(`Module « ${module.name} » désactivé`);
            await onChanged?.();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la désactivation");
        },
    });

    const saveSettingsMutation = useMutation({
        mutationFn: async () => {
            if (!organizationId) throw new Error("Organisation introuvable");
            await OrganizationsApiService.createPreference({
                organization_id: organizationId,
                label: getModuleConfigSettingsPreferenceLabel(moduleId),
                value: JSON.stringify(settings),
            });
        },
        onSuccess: async () => {
            updateModuleConfig(module.identifier, settings);
            await queryClient.invalidateQueries({queryKey: ["module-config", organizationId, moduleId]});
            await queryClient.invalidateQueries({queryKey: ["organizations", organizationId, "preferences"]});
            toast.success("Paramètres sauvegardés");
            await onChanged?.();
        },
        onError: () => toast.error("Erreur lors de la sauvegarde des paramètres"),
    });

    const renderField = (field: ModuleConfigSettingsFieldInterface) => {
        const value = settings[field.key] ?? "";

        if (field.type === 'SELECT') {
            return (
                <Select value={value} onValueChange={(next) => setSettings(prev => ({...prev, [field.key]: next}))}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder ?? "Sélectionner..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettingsQuery.data ?? {});
    const isInstalled = module.isInstalled || module.storeState === 'enabled' || module.storeState === 'installed';

    return (
        <div className="flex flex-col gap-6">
            {/* Bannière de la fiche produit */}
            {module.banner && (
                <div className="overflow-hidden rounded-xl border bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={module.banner} alt={`Bannière ${module.name}`} className="aspect-[3/1] size-full object-cover"/>
                </div>
            )}

            {/* En-tête du module */}
            <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        {module.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={module.logo} alt={module.name} className="size-10 rounded-lg object-cover"/>
                        ) : (
                            <DynamicIcon name={module.icon} className="size-7 text-primary"/>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{module.name}</h1>
                            <ModuleStateBadge state={module.storeState}/>
                        </div>
                        <p className="text-muted-foreground text-sm">{module.description || "Aucune description"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onEditFiche && (
                        <Button variant="outline" onClick={onEditFiche}>
                            Éditer la fiche
                        </Button>
                    )}
                    {isInstalled ? (
                        <>
                            {module.isDefault ? (
                                <Badge variant="secondary">Par défaut</Badge>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => deactivateMutation.mutate()}
                                    disabled={deactivateMutation.isPending}
                                >
                                    {deactivateMutation.isPending
                                        ? <WaitingActivity size={14}/>
                                        : "Désactiver"
                                    }
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button onClick={() => setShowInstall(true)}>
                            Installer le module
                        </Button>
                    )}
                </div>
            </div>

            <Separator/>

            {/* Détails techniques */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {module.category && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Catégorie</span>
                        <span className="text-sm font-medium flex items-center gap-1.5">
                            <DynamicIcon name={MODULE_CATEGORY_ICONS[module.category as ModuleCategory]} className="size-4 text-primary/70"/>
                            {MODULE_CATEGORY_LABELS[module.category as ModuleCategory]}
                        </span>
                    </div>
                )}
                <DetailField label="Type" value={module.type}/>
                <DetailField label="ID" value={module.identifier} mono/>
                {module.version && <DetailField label="Version" value={module.version}/>}
                <DetailField label="Statut" value={module.storeState ?? 'available'}/>
                {module.uri && <DetailField label="URL" value={module.uri} mono/>}
                {module.activationExpiresAt && (
                    <DetailField
                        label="Expire le"
                        value={new Date(module.activationExpiresAt).toLocaleDateString('fr-FR')}
                    />
                )}
            </div>

            {module.requirements && Object.keys(module.requirements).length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Modules requis</span>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(module.requirements).map(([name, version]) => (
                            <Badge key={name} variant="outline">{name} {version}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Paramètres */}
            {settingsFields.length > 0 && (
                <>
                    <Separator/>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Paramètres du module</h2>
                            <Button
                                variant="outline"
                                onClick={() => setActiveTab(activeTab === 'settings' ? 'info' : 'settings')}
                            >
                                {activeTab === 'settings' ? "Masquer" : "Configurer"}
                            </Button>
                        </div>

                        {activeTab === 'settings' && (
                            <div className="flex flex-col gap-4">
                                {settingsFields.map((field) => (
                                    <div key={field.key} className="flex flex-col gap-1.5 max-w-lg">
                                        <Label htmlFor={`detail-${moduleId}-${field.key}`}>
                                            {field.label}
                                            {field.required && <span className="text-destructive">&nbsp;*</span>}
                                        </Label>
                                        {renderField(field)}
                                        {field.description && (
                                            <p className="text-xs text-muted-foreground">{field.description}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => saveSettingsMutation.mutate()}
                                        disabled={!hasChanges || saveSettingsMutation.isPending}
                                    >
                                        {saveSettingsMutation.isPending
                                            ? <WaitingActivity size={14}/>
                                            : "Sauvegarder les paramètres"
                                        }
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {showInstall && (
                <ModuleStoreInstallDialog
                    open={showInstall}
                    onOpenChange={setShowInstall}
                    module={module}
                />
            )}
        </div>
    )
}

function DetailField({label, value, mono}: {label: string; value: string; mono?: boolean}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`text-sm font-medium ${mono ? "font-mono truncate" : ""}`}>{value}</span>
        </div>
    );
}