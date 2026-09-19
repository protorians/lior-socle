import {UsersAnalyticsWidget} from "@/modules/identity/presentation/widgets/users-analytics.widget";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {
    usersAnalyticsRoutine,
} from "@/modules/identity/infrastructure/routines/users-analytics.routine";

const accountModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.account',
    key: 'ACCOUNT',
    version: '1.0.0',
    name: 'Mon compte',
    description: 'Gestion de mon compte',
    icon: "UserIcon",
    logo: undefined,
    widgets: {
        // analytics: UsersAnalyticsWidget
    },
    service: {
        // fetch: UsersApiService
    },
    routines: [
        // usersAnalyticsRoutine
    ],
    uri: '/account',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
    category: 'SYSTEM',
    // menu: {
    //     items: [
    //         {
    //             label: 'Fichier',
    //             // description: 'Gestion des comptes et activités',
    //             icon: "UsersIcon",
    //             // action: () => {},
    //             items: [
    //                 {
    //                     label: 'Créer',
    //                     description: 'Créer un nouvel utilisateur',
    //                     icon: "PlusIcon",
    //                     action: () => {
    //                     }
    //                 },
    //                 {
    //                     label: "Voir",
    //                     description: 'Voir un utilisateur',
    //                     icon: "EyeIcon"
    //                 },
    //                 {
    //                     separator: true
    //                 },
    //                 {
    //                     label: 'Exporter',
    //                     description: 'Exporter des utilisateurs',
    //                     icon: "DownloadIcon"
    //                 }
    //             ]
    //         },
    //         {
    //             label: 'Organisations',
    //             // description: 'Gestion des comptes et activités',
    //             icon: "BuildingIcon",
    //             // action: () => {},
    //             items: [
    //                 {
    //                     label: 'Créer',
    //                     description: 'Créer une nouvelle organisation',
    //                     icon: "PlusIcon",
    //                     action: () => {
    //                     }
    //                 },
    //                 {
    //                     label: "Voir",
    //                     description: 'Voir une organisation',
    //                     icon: "EyeIcon"
    //                 },
    //             ]
    //         }
    //     ]
    // }
}

export default accountModule