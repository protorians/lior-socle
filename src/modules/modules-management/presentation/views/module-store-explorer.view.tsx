"use client"

import * as React from "react";
import {ModuleStoreLayout} from "@/modules/modules-management/presentation/views/module-store-layout.view";
import {ModuleStoreHeader} from "@/modules/modules-management/presentation/components/module-store-header";
import {ModuleStoreSearch} from "@/modules/modules-management/presentation/components/module-store-search";
import {ModuleStoreSpotlight} from "@/modules/modules-management/presentation/components/module-store-spotlight";
import {ModuleStoreCategoryMenu} from "@/modules/modules-management/presentation/components/module-store-category-menu";
import {ModuleStoreAppsSection} from "@/modules/modules-management/presentation/components/module-store-apps-section";
import {ModuleStoreInstallDialog} from "@/modules/modules-management/presentation/components/module-store-install-dialog";
import {ModuleStoreDetailDialog} from "@/modules/modules-management/presentation/components/module-store-detail-dialog";
import {ModuleStorePublishDialog} from "@/modules/modules-management/presentation/components/module-store-publish-dialog";
import {SettingsLayout} from "@/external_modules/pos-management/presentation/components/settings-layout";
import {
    ModuleCategory,
    MODULE_CATEGORY_LABELS,
} from "@sentients/sdk/domain/enums/module-category.enum";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {useAuth} from "@sentients/sdk/infrastructure/hooks/use-auth";
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import {StoreTab, StoreTypeFilter} from "@/modules/modules-management/presentation/components/module-store-apps-section";
import {storeSyncRoutine} from "@/modules/modules-management/infrastructure/routines/store-sync.routine";
import {
    findCatalogItem,
    mergeCatalogIntoModules,
    useModuleCatalog,
} from "@/modules/modules-management/infrastructure/hooks/use-module-catalog.hook";
import {ModuleStoreCatalogItemInterface} from "@sentients/sdk/domain/entities/module-activation.interface";
import {StoreIcon} from "lucide-react";

const SUPER_ADMIN_MIN_LEVEL = 90;

export function ModuleStoreExplorerView() {
    const {modules, toggleModule} = useModuleStore();
    const {user} = useAuth();
    const {data: catalog} = useModuleCatalog();

    const catalogModules = React.useMemo(
        () => mergeCatalogIntoModules(modules, catalog),
        [modules, catalog],
    );

    const [activeTab, setActiveTab] = React.useState<StoreTab>('available');
    const [search, setSearch] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState<StoreTypeFilter>('ALL');
    const [categoryFilter, setCategoryFilter] = React.useState<ModuleCategory | 'ALL'>('ALL');
    const [installModule, setInstallModule] = React.useState<ModuleDeclarationInterface | null>(null);
    const [detailModule, setDetailModule] = React.useState<ModuleDeclarationInterface | null>(null);
    const [publishOpen, setPublishOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<ModuleStoreCatalogItemInterface | null>(null);
    const [isSyncing, setIsSyncing] = React.useState(false);
    const appsRef = React.useRef<HTMLDivElement>(null);

    const canManage = React.useMemo(
        () => user?.roles?.some((role) => (role.level ?? 0) >= SUPER_ADMIN_MIN_LEVEL) ?? false,
        [user],
    );

    const isInstalled = (m: ModuleDeclarationInterface) =>
        m.isInstalled || m.storeState === 'enabled' || m.storeState === 'installed';

    const featured = React.useMemo(
        () => catalogModules.find(m => m.storeState === 'available' && !isInstalled(m))
            ?? catalogModules.find(m => m.storeState === 'available' || m.storeState === undefined)
            ?? catalogModules.find(m => !isInstalled(m))
            ?? catalogModules[0],
        [catalogModules]
    );

    const availableModules = React.useMemo(
        () => catalogModules.filter(m => !isInstalled(m)),
        [catalogModules]
    );

    const filteredModules = React.useMemo(() => {
        return availableModules.filter((m) => {
            if (activeTab === 'available' && m.storeState === 'disabled') return false;
            if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
            if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
            if (search) {
                const haystack = `${m.name} ${m.description} ${m.identifier} ${m.key ?? ""} ${m.category ? MODULE_CATEGORY_LABELS[m.category] : ""}`.toLowerCase();
                if (!haystack.includes(search.toLowerCase())) return false;
            }
            return true;
        });
    }, [availableModules, activeTab, search, typeFilter, categoryFilter]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await storeSyncRoutine.refetch();
        } finally {
            setIsSyncing(false);
        }
    };

    const selectCategory = (category: ModuleCategory | 'ALL') => {
        setCategoryFilter(category);
        setSearch("");
        appsRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const openEditFiche = (module: ModuleDeclarationInterface) => {
        const item = findCatalogItem(module, catalog);
        setEditItem(item ?? null);
        setPublishOpen(true);
    };

    return (
        <ModuleStoreLayout>
            <ModuleStoreHeader
                isSyncing={isSyncing}
                onSync={handleSync}
                canManage={canManage}
                icon={<StoreIcon className="size-6 text-primary"/>}
                title="Store"
                description="Découvrez, installez et gérez les applications de votre espace."
                search={search}
                setSearch={setSearch}
                onPublish={() => {
                    setEditItem(null);
                    setPublishOpen(true);
                }}
            />

            {featured && (
                <ModuleStoreSpotlight
                    module={featured}
                    isInstalled={isInstalled(featured)}
                    onInstall={setInstallModule}
                />
            )}

            <SettingsLayout>
                <ModuleStoreCategoryMenu
                    categories={Object.values(ModuleCategory)}
                    active={categoryFilter}
                    onSelect={selectCategory}
                />

                <SettingsLayout.Container fully>
                    <div className="flex flex-col gap-6 min-w-0 w-full">
                        <ModuleStoreAppsSection
                            modules={filteredModules}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            typeFilter={typeFilter}
                            onTypeFilterChange={setTypeFilter}
                            hasCategoryFilter={categoryFilter !== 'ALL'}
                            onResetCategory={() => setCategoryFilter('ALL')}
                            onInstall={setInstallModule}
                            onDetail={setDetailModule}
                            onToggle={toggleModule}
                            sectionRef={appsRef}
                            tabs={['all', 'available']}
                            title="Applications disponibles"
                        />
                    </div>
                </SettingsLayout.Container>
            </SettingsLayout>

            {installModule && (
                <ModuleStoreInstallDialog
                    open={!!installModule}
                    onOpenChange={(open) => !open && setInstallModule(null)}
                    module={installModule}
                />
            )}

            {detailModule && (
                <ModuleStoreDetailDialog
                    open={!!detailModule}
                    onOpenChange={(open) => !open && setDetailModule(null)}
                    module={detailModule}
                    onEditFiche={canManage ? () => openEditFiche(detailModule) : undefined}
                />
            )}

            <ModuleStorePublishDialog
                open={publishOpen}
                onOpenChange={setPublishOpen}
                catalogItem={editItem}
            />
        </ModuleStoreLayout>
    );
}