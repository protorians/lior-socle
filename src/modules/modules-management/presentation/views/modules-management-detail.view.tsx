"use client"

import * as React from "react";
import {useRouter} from "next/navigation";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Card, CardContent} from "@sentients/sdk/presentation/ui/card";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";
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
                <Main className="flex items-center justify-center p-6 min-h-[60vh]">
                    <WaitingActivity size={40}/>
                </Main>
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