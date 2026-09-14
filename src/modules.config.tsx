import {ShieldIcon, UsersIcon} from "lucide-react";
import {ModuleNavigationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {ModulesListSheet} from "@/core/presentation/modules-list-sheet";
import dashboardModule from "@/modules/dashboard";
import usersModule from "@/modules/identity";
import accessControlModule from "@/modules/access-control";
import organizationsModule from "@/modules/organization";


export const defaultModulesNavConfig: ModuleNavigationInterface[] = [
    {
        id: dashboardModule.identifier,
        label: 'Tableau de bord',
        icon: "LayoutDashboardIcon",
        url: '/dashboard',
        useOnlyIcon: true,
    },
    {
        id: organizationsModule.identifier,
        label: 'Organisations',
        icon: "BuildingIcon",
        useOnlyIcon: true,
        url: '/organization',
    },
    {
        id: usersModule.identifier,
        label: 'Utilisateurs',
        icon: "UsersIcon",
        useOnlyIcon: false,
        url: '/identity',
    },
    {
        id: accessControlModule.identifier,
        label: 'Contrôles d\'accès',
        icon: "ShieldIcon",
        useOnlyIcon: false,
        url: '/access-control',
    },
    {
        id: 'store',
        label: 'Store',
        icon: "StoreIcon",
        useOnlyIcon: false,
        url: '/store/explorer',
        dropdown: {
            type: 'mini',
            component: ModulesListSheet
        }
    },
]