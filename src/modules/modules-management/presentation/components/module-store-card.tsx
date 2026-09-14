"use client"

import * as React from "react";
import Link from "next/link";
import {DynamicIcon} from "@sentients/sdk/presentation/components/dynamic-icon";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {ModuleStoreStateType} from "@sentients/sdk/domain/entities/module-activation.interface";
import {MODULE_CATEGORY_LABELS, MODULE_CATEGORY_ICONS, ModuleCategory} from "@sentients/sdk/domain/enums/module-category.enum";
import {Card, CardContent, CardTitle} from "@sentients/sdk/presentation/ui/card";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {Switch} from "@sentients/sdk/presentation/ui/switch";
import {
    DownloadIcon,
    SettingsIcon,
    InfoIcon,
    CheckIcon,
    ClockIcon,
    RefreshCwIcon,
    UnplugIcon,
} from "lucide-react";

function ModuleStateIndicator({state}: {state?: ModuleStoreStateType}) {
    const config: Record<ModuleStoreStateType, {
        label: string;
        color: string;
        icon: React.ReactNode;
    }> = {
        available:           {label: "Disponible",  color: "bg-blue-500",     icon: <DownloadIcon className="size-3"/>},
        activating:          {label: "Activation…",  color: "bg-amber-500",    icon: <ClockIcon className="size-3 animate-spin"/>},
        downloading:         {label: "Download…",    color: "bg-amber-500",    icon: <DownloadIcon className="size-3 animate-bounce"/>},
        verifying:           {label: "Vérification…",color: "bg-amber-500",    icon: <RefreshCwIcon className="size-3 animate-spin"/>},
        installing:          {label: "Installation…",color: "bg-amber-500",    icon: <DownloadIcon className="size-3 animate-pulse"/>},
        installed:           {label: "Installé",     color: "bg-emerald-500",  icon: <CheckIcon className="size-3"/>},
        resolved:            {label: "Résolu",       color: "bg-emerald-500",  icon: <CheckIcon className="size-3"/>},
        enabled:             {label: "Activé",       color: "bg-emerald-500",  icon: <CheckIcon className="size-3"/>},
        disabled:            {label: "Désactivé",    color: "bg-zinc-400",     icon: <UnplugIcon className="size-3"/>},
        update_available:    {label: "Mise à jour",  color: "bg-blue-500",     icon: <RefreshCwIcon className="size-3"/>},
        expired:             {label: "Expiré",       color: "bg-red-500",      icon: <ClockIcon className="size-3"/>},
        revoked:             {label: "Révoqué",      color: "bg-red-500",      icon: <UnplugIcon className="size-3"/>},
        incompatible:        {label: "Incompatible", color: "bg-red-500",      icon: <UnplugIcon className="size-3"/>},
        platform_unsupported:{label: "Non supporté", color: "bg-zinc-400",     icon: <UnplugIcon className="size-3"/>},
        corrupted:           {label: "Corrompu",     color: "bg-red-500",      icon: <UnplugIcon className="size-3"/>},
        uninstalled:         {label: "Désinstallé",  color: "bg-zinc-400",     icon: <DownloadIcon className="size-3"/>},
        failed:              {label: "Échoué",       color: "bg-red-500",      icon: <UnplugIcon className="size-3"/>},
    };

    const {label, color, icon} = config[state ?? "available"] ?? config.available;

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium`}>
            <span className={`inline-block size-2 rounded-full ${color}`}/>
            {label}
        </span>
    );
}

interface ModuleStoreCardProps {
    module: ModuleDeclarationInterface;
    onInstall: (module: ModuleDeclarationInterface) => void;
    onDetail: (module: ModuleDeclarationInterface) => void;
    onToggle: (id: string) => void;
}

export function ModuleStoreCard({module, onInstall, onDetail, onToggle}: ModuleStoreCardProps) {
    const isInstalled = module.isInstalled || module.storeState === 'enabled' || module.storeState === 'installed';
    const isBusy = module.storeState === 'activating' || module.storeState === 'downloading'
        || module.storeState === 'installing' || module.storeState === 'verifying';
    const categoryKey = module.category as ModuleCategory | undefined;

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
            <CardContent className="p-0">
                {/* Ligne principale (App Store row) */}
                <div className="flex items-start gap-3 p-4 pb-3">
                    <div className="relative shrink-0">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 shadow-sm transition-transform group-hover:scale-[1.03]">
                            {module.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={module.logo} alt={module.name} className="size-10 rounded-xl object-cover"/>
                            ) : (
                                <DynamicIcon name={module.icon} className="size-7 text-primary"/>
                            )}
                        </div>
                        {module.storeState === 'enabled' && (
                            <span className="absolute -right-0.5 -top-0.5 inline-block size-3 rounded-full bg-emerald-500 ring-2 ring-background"/>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <Link href={`/store/module?id=${module.identifier}`} className="group/title min-w-0">
                                <CardTitle className="truncate text-base font-semibold group-hover/title:text-primary transition-colors">
                                    {module.name}
                                </CardTitle>
                            </Link>
                            <Badge variant={module.type === 'INTERNAL' ? 'default' : 'outline'} className="shrink-0 text-[10px]">
                                {module.type}
                            </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            {categoryKey ? (
                                <>
                                    <span className="inline-flex items-center gap-1">
                                        <DynamicIcon name={MODULE_CATEGORY_ICONS[categoryKey]} className="size-3.5 text-primary/70"/>
                                        {MODULE_CATEGORY_LABELS[categoryKey]}
                                    </span>
                                    <span className="text-muted-foreground/40">•</span>
                                </>
                            ) : null}
                            {module.version && (
                                <span className="font-mono">v{module.version}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="px-4 pb-3 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {module.description || "Aucune description disponible."}
                </p>

                {/* Pied : état + action */}
                <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-3">
                    <ModuleStateIndicator state={module.storeState}/>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDetail(module)}
                            title="Détails"
                        >
                            <InfoIcon className="size-4"/>
                        </Button>
                        {module.configSettings && module.configSettings.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onDetail(module)}
                                title="Paramètres"
                            >
                                <SettingsIcon className="size-4"/>
                            </Button>
                        )}

                        {isInstalled ? (
                            module.isDefault ? (
                                <Badge variant="secondary" className="ml-1 text-[10px]">Par défaut</Badge>
                            ) : (
                                <Switch
                                    checked={module.isEnabled ?? false}
                                    onCheckedChange={() => onToggle(module.identifier)}
                                    disabled={isBusy}
                                />
                            )
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => onInstall(module)}
                                disabled={isBusy}
                                className="rounded-full px-4"
                            >
                                {isBusy ? (
                                    <RefreshCwIcon className="size-3 animate-spin mr-1.5"/>
                                ) : (
                                    <DownloadIcon className="size-3 mr-1.5"/>
                                )}
                                Installer
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}