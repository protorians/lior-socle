import {ModuleActivationApiService as SdkModuleActivationApiService} from "@liorian/sdk/application/service/module-activation-api.service";

/**
 * Service API Proxy d'activation des modules pour le frontend Manager.
 * Délegue toutes les requêtes au service typé du SDK (base `/module-activation`).
 */
export class ModuleActivationApiService extends SdkModuleActivationApiService {
    // Le SDK expose déjà tous les endpoints nécessaires :
    // - Activation : activateModule, validateActivation, getOrganizationModules, deactivateModule
    // - Clés série : getSerialKeys, createSerialKey, deleteSerialKey
    // - Configuration : getModuleConfig, saveModuleConfig
    // - Synchronisation : syncModules
    // - Analytics d'usage : recordModuleUsage, getModuleUsageAnalytics
}
