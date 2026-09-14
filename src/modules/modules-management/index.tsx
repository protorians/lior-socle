import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {StoreAnalyticsWidget} from "@/modules/modules-management/presentation/widgets/store-analytics.widget";
import {storeSyncRoutine} from "@/modules/modules-management/infrastructure/routines/store-sync.routine";

const storeModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.store',
    key: 'STORE',
    version: '1.0.0',
    name: 'Store',
    description: 'Store : découvrez, installez et gérez les applications de votre espace',
    icon: "StoreIcon",
    logo: undefined,
    widgets: {
        analytics: StoreAnalyticsWidget,
    },
    service: {
        fetch: undefined,
    },
    routines: [
        storeSyncRoutine,
    ],
    uri: '/store',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'SYSTEM',
    requirements: {},
    menu: {
        items: [
            {
                label: "Explorer",
                icon: "CompassIcon",
                url: '/store/explorer',
            },
            {
                label: "Mes modules",
                icon: "AppWindowIcon",
                url: '/store/installed',
            },
            {
                label: "Paramètres",
                icon: "SettingsIcon",
                url: '/store/settings',
            },
        ]
    },
}

export default storeModule
