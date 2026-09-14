import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";

const dashboardModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.dashboard',
    key: 'DASHBOARD',
    version: '1.0.0',
    name: 'Tableau de board',
    description: 'Tableau de bord principal',
    icon: "LayoutDashboardIcon",
    logo: undefined,
    uri: '/dashboard',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
    category: 'SYSTEM',
    requirements: {},
}

export default dashboardModule
