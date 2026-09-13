import {ModuleStoreApiService} from "@sentients/sdk/application/service/module-store-api.service";

/**
 * Service API Proxy du Module Store pour le frontend Manager.
 * Délegue toutes les requêtes au service typé du SDK.
 */
export class ModuleActivationApiService extends ModuleStoreApiService {
    // Le SDK expose déjà tous les endpoints nécessaires :
    // - Catalogue : getCatalog, getCatalogModule, createCatalogModule, deleteCatalogModule
    // - Activation : activateModule, validateActivation, getOrganizationModules, deactivateModule
    // - Clés série : getSerialKeys, createSerialKey, deleteSerialKey
    // - Configuration : getModuleConfig, saveModuleConfig
    // - Synchronisation : syncModules
}