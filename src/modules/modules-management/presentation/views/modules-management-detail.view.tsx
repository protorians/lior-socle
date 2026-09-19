"use client"

import * as React from "react";
import {useRouter} from "next/navigation";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Card, CardContent} from "@liorian/sdk/presentation/ui/card";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {ModuleStoreDetailContent} from "@/modules/modules-management/presentation/components/module-store-detail-content";
import {ModuleStoreLayout} from "@/modules/modules-management/presentation/views/module-store-layout.view";
import {ArrowLeftIcon, PackageIcon} from "lucide-react";

interface ModuleStoreDetailViewProps {
    moduleId: string | null;
}

export function ModuleStoreDetailView({moduleId}: ModuleStoreDetailViewProps) {
    const router = useRouter();
    const {modules} = useModuleStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const module = React.useMemo(() => {
        if (!mounted || !moduleId) return null;
        return modules.find(m => m.identifier === moduleId || m.key === moduleId) ?? null;
    }, [mounted, moduleId, modules]);

    if (!mounted) {
        return (
            <ModuleStoreLayout>
                <View.Frame className="flex items-center justify-center p-6 min-h-[60vh]">
                    <Activity.Loader size={40}/>
                </View.Frame>
            </ModuleStoreLayout>
        );
    }

    return (
        <ModuleStoreLayout>
            <div className="flex flex-col gap-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-2"
                    onClick={() => router.push('/store/explorer')}
                >
                    <ArrowLeftIcon className="size-4"/>
                    Retour au Store
                </Button>

                {module ? (
                    <ModuleStoreDetailContent module={module}/>
                ) : (
                    <Card className="py-16">
                        <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
                            <PackageIcon className="size-12 text-muted-foreground/40"/>
                            <div>
                                <p className="font-medium">Module introuvable</p>
                                <p className="text-sm text-muted-foreground">
                                    Le module « {moduleId} » n&apos;existe pas ou n&apos;est pas disponible.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => router.push('/store/explorer')}>
                                Voir le Store
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ModuleStoreLayout>
    );
}