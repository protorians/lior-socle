import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";

const dashboardModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.dashboard',
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
}

export default dashboardModule
