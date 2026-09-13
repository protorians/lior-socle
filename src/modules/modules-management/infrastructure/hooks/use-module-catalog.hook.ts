"use client"

import {useQuery} from "@tanstack/react-query";
import {ModuleStoreApiService} from "@sentients/sdk/application/service/module-store-api.service";
import {ModuleStoreCatalogItemInterface} from "@sentients/sdk/domain/entities/module-activation.interface";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {IconKey} from "@sentients/sdk/presentation/icons/types";

/**
 * Catalogue des modules publiés (fiches produit du backend).
 * Les images (logo + bannière) définies à la publication sont
 * fusionnées dans les modules déclarés localement pour l'affichage.
 */
export function useModuleCatalog() {
    return useQuery<ModuleStoreCatalogItemInterface[]>({
        queryKey: ["module-catalog"],
        queryFn: async () => {
            const response = await ModuleStoreApiService.getCatalog();
            const list = response.data?.data;
            return Array.isArray(list) ? list : [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fusionne les fiches produits du catalogue dans les modules déclarés
 * localement (par identifiant technique), puis complète avec les fiches du
 * catalogue absentes des modules locaux — notamment celles retirées par la
 * vérification des accès ou non déclarées localement.
 */
export function mergeCatalogIntoModules(
    modules: ModuleDeclarationInterface[],
    catalog: ModuleStoreCatalogItemInterface[] | undefined,
): ModuleDeclarationInterface[] {
    if (!catalog || catalog.length === 0) return modules;

    const catalogByIdentifier = new Map(catalog.map((item) => [item.identifier, item]));

    const merged = modules.map((module) => {
        const item = catalogByIdentifier.get(module.identifier);
        if (!item) return module;

        return {
            ...module,
            logo: item.logoUrl ?? module.logo,
            banner: item.bannerUrl ?? module.banner,
            description: module.description || item.description || module.description,
            category: module.category ?? item.category,
        } satisfies ModuleDeclarationInterface;
    });

    const mergedIdentifiers = new Set(merged.map(m => m.identifier));
    const catalogOnly = catalog
        .filter(item => !mergedIdentifiers.has(item.identifier))
        .map(item => ({
            identifier: item.identifier,
            key: item.identifier,
            version: '1.0.0',
            name: item.name,
            description: item.description ?? "",
            icon: (item.icon as IconKey) ?? ('AppWindow' as IconKey),
            logo: item.logoUrl ?? undefined,
            banner: item.bannerUrl ?? undefined,
            uri: item.url,
            isEnabled: item.isEnabled,
            isDefault: item.isDefault,
            type: item.type,
            category: item.category,
            storeState: 'available' as const,
            isInstalled: false,
        } satisfies ModuleDeclarationInterface));

    return [...merged, ...catalogOnly];
}

export function findCatalogItem(
    module: ModuleDeclarationInterface,
    catalog: ModuleStoreCatalogItemInterface[] | undefined,
): ModuleStoreCatalogItemInterface | undefined {
    if (!catalog) return undefined;
    return catalog.find((item) =>
        item.identifier === module.identifier || item.identifier === (module.key ?? "")
    );
}