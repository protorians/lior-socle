"use client"

import {useRouter} from "next/navigation";
import {DownloadIcon, ExternalLinkIcon, SparklesIcon} from "lucide-react";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Card, CardContent} from "@liorian/sdk/presentation/ui/card";
import {DynamicIcon} from "@liorian/sdk/presentation/components/dynamic-icon";
import {MODULE_CATEGORY_LABELS} from "@liorian/sdk/domain/enums/module-category.enum";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";

interface ModuleStoreSpotlightProps {
    module: ModuleDeclarationInterface;
    isInstalled: boolean;
    onInstall: (module: ModuleDeclarationInterface) => void;
}

export function ModuleStoreSpotlight({module, isInstalled, onInstall}: ModuleStoreSpotlightProps) {
    const router = useRouter();

    const handleOpen = () => {
        if (module.isDefault || isInstalled) {
            router.push(`/store/module?id=${module.identifier}`);
            return;
        }
        onInstall(module);
    };

    return (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-primary/15 ring-1 ring-primary/25 shadow-md">
                    {module.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={module.logo} alt={module.name} className="size-12 rounded-2xl object-cover"/>
                    ) : (
                        <DynamicIcon name={module.icon} className="size-10 text-primary"/>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                            <SparklesIcon className="size-3"/>
                            En vedette
                        </Badge>
                        {module.category && (
                            <Badge variant="outline" className="text-[10px]">
                                {MODULE_CATEGORY_LABELS[module.category]}
                            </Badge>
                        )}
                    </div>
                    <h2 className="mt-1.5 text-xl font-bold tracking-tight">{module.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                        {module.description || "Une application pour enrichir votre espace de travail."}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/store/module?id=${module.identifier}`)}
                    >
                        Détails
                    </Button>
                    <Button onClick={handleOpen} className="rounded-full px-5">
                        {module.isDefault || isInstalled ? (
                            <>
                                <ExternalLinkIcon className="size-3.5 mr-1.5"/>
                                Ouvrir
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="size-3.5 mr-1.5"/>
                                Installer
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}