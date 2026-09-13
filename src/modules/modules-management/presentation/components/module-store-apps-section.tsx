"use client"

import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Card, CardContent} from "@sentients/sdk/presentation/ui/card";
import {StoreIcon} from "lucide-react";
import {Tabs, TabsList, TabsTrigger} from "@sentients/sdk/presentation/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@sentients/sdk/presentation/ui/select";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {ModuleStoreCard} from "@/modules/modules-management/presentation/components/module-store-card";

export type StoreTab = 'all' | 'installed' | 'available' | 'enabled' | 'disabled';

export type StoreTypeFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';

const TABS: {value: StoreTab; label: string}[] = [
    {value: 'all',       label: 'Toutes'},
    {value: 'installed', label: 'Installées'},
    {value: 'available', label: 'Disponibles'},
    {value: 'enabled',   label: 'Activées'},
    {value: 'disabled',  label: 'Désactivées'},
];

interface ModuleStoreAppsSectionProps {
    modules: ModuleDeclarationInterface[];
    activeTab: StoreTab;
    onTabChange: (tab: StoreTab) => void;
    typeFilter: StoreTypeFilter;
    onTypeFilterChange: (type: StoreTypeFilter) => void;
    hasCategoryFilter: boolean;
    onResetCategory: () => void;
    onInstall: (module: ModuleDeclarationInterface) => void;
    onDetail: (module: ModuleDeclarationInterface) => void;
    onToggle: (id: string) => void;
    sectionRef: React.RefObject<HTMLDivElement | null>;
    tabs?: StoreTab[];
    title?: string;
}

export function ModuleStoreAppsSection({
    modules,
    activeTab,
    onTabChange,
    typeFilter,
    onTypeFilterChange,
    hasCategoryFilter,
    onResetCategory,
    onInstall,
    onDetail,
    onToggle,
    sectionRef,
    tabs,
    title,
}: ModuleStoreAppsSectionProps) {
    const renderedTabs = tabs ? TABS.filter(tab => tabs.includes(tab.value)) : TABS;

    return (
        <div ref={sectionRef} id="apps" className="flex flex-col gap-3 scroll-mt-20">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {title ?? "Toutes les applications"}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">{modules.length}</Badge>
                </div>

                <div className="flex flex-row gap-2 flex-wrap">
                    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as StoreTab)}>
                        <TabsList className="w-full md:w-fit">
                            {renderedTabs.map(tab => (
                                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as StoreTypeFilter)}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous les types</SelectItem>
                            <SelectItem value="INTERNAL">Internes</SelectItem>
                            <SelectItem value="EXTERNAL">Externes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {modules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {modules.map(module => (
                        <ModuleStoreCard
                            key={module.identifier}
                            module={module}
                            onInstall={onInstall}
                            onDetail={onDetail}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            ) : (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
                        <StoreIcon className="size-12 text-muted-foreground/40"/>
                        <div>
                            <p className="font-medium">Aucune application trouvée</p>
                            <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                {hasCategoryFilter ? (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-primary"
                                        onClick={onResetCategory}
                                    >
                                        Réinitialiser les catégories
                                    </Button>
                                ) : (
                                    "Modifiez votre recherche ou vos filtres."
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}