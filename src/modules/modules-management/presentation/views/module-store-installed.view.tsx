"use client"

import * as React from "react";
import {ModuleStoreLayout} from "@/modules/modules-management/presentation/views/module-store-layout.view";
import {ModuleStoreSearch} from "@/modules/modules-management/presentation/components/module-store-search";
import {ModuleStoreCategoryMenu} from "@/modules/modules-management/presentation/components/module-store-category-menu";
import {ModuleStoreCard} from "@/modules/modules-management/presentation/components/module-store-card";
import {ModuleStoreDetailDialog} from "@/modules/modules-management/presentation/components/module-store-detail-dialog";
import {SettingsLayout} from "@/library/modules/pos-management/presentation/components/settings-layout";
import {Card, CardContent} from "@liorian/sdk/presentation/ui/card";
import {CheckCircle2Icon, PackageIcon} from "lucide-react";
import {
    ModuleCategory,
    MODULE_CATEGORY_LABELS,
} from "@liorian/sdk/domain/enums/module-category.enum";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {ModuleStoreHeader} from "@/modules/modules-management/presentation/components/module-store-header";

export function ModuleStoreInstalledView() {
    const {modules, toggleModule} = useModuleStore();

    const [search, setSearch] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState<ModuleCategory | 'ALL'>('ALL');
    const [detailModule, setDetailModule] = React.useState<ModuleDeclarationInterface | null>(null);

    const isInstalled = (m: ModuleDeclarationInterface) =>
        m.isInstalled || m.storeState === 'enabled' || m.storeState === 'installed' || m.storeState === 'disabled';

    const installedModules = React.useMemo(() => modules.filter(isInstalled), [modules]);

    const stats = React.useMemo(() => {
        const categoryCounts = Object.values(ModuleCategory).map((category) => ({
            category,
            count: installedModules.filter(m => m.category === category).length,
        }));
        return {
            total: installedModules.length,
            enabled: installedModules.filter(m => m.storeState === 'enabled').length,
            disabled: installedModules.filter(m => m.storeState === 'disabled' || m.storeState === 'installed').length,
            categories: categoryCounts,
        };
    }, [installedModules]);

    const filteredModules = React.useMemo(() => {
        return installedModules.filter((m) => {
            if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
            if (search) {
                const haystack = `${m.name} ${m.description} ${m.identifier} ${m.key ?? ""} ${m.category ? MODULE_CATEGORY_LABELS[m.category] : ""}`.toLowerCase();
                if (!haystack.includes(search.toLowerCase())) return false;
            }
            return true;
        });
    }, [installedModules, categoryFilter, search]);

    const selectCategory = (category: ModuleCategory | 'ALL') => setCategoryFilter(category);

    return (
        <ModuleStoreLayout>
            <ModuleStoreHeader
                icon={<CheckCircle2Icon className="size-6 text-primary"/>}
                title="Mes modules"
                description={<>
                    {stats.total} module{stats.total > 1 ? "s" : ""} installé{stats.total > 1 ? "s" : ""} · {stats.enabled} activé{stats.enabled > 1 ? "s" : ""} · {stats.disabled} désactivé{stats.disabled > 1 ? "s" : ""}
                </>}
                search={search}
                setSearch={setSearch}
            />

            <SettingsLayout>
                <ModuleStoreCategoryMenu
                    categories={Object.values(ModuleCategory)}
                    active={categoryFilter}
                    onSelect={selectCategory}
                />

                <SettingsLayout.Container fully>
                    {filteredModules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredModules.map(module => (
                                <ModuleStoreCard
                                    key={module.identifier}
                                    module={module}
                                    onInstall={() => undefined}
                                    onDetail={setDetailModule}
                                    onToggle={toggleModule}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="py-16">
                            <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
                                <PackageIcon className="size-12 text-muted-foreground/40"/>
                                <div>
                                    <p className="font-medium">Aucun module installé</p>
                                    <p className="text-sm text-muted-foreground">
                                        {categoryFilter !== 'ALL'
                                            ? "Aucun module installé dans cette catégorie."
                                            : "Parcourez le store pour installer vos premiers modules."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </SettingsLayout.Container>
            </SettingsLayout>

            {detailModule && (
                <ModuleStoreDetailDialog
                    open={!!detailModule}
                    onOpenChange={(open) => !open && setDetailModule(null)}
                    module={detailModule}
                />
            )}
        </ModuleStoreLayout>
    );
}