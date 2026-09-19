import {AccessControlApiService} from "@/modules/access-control/application/service/access-control-api.service";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {AccessControlWidget} from "@/modules/access-control/presentation/widgets/access-control.widget";

const accessControlModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.access-control',
    key: 'ACCESS_CONTROL',
    version: '1.0.0',
    name: "Contrôle d'accès",
    description: "Gestion des permissions et rôles",
    icon: "ShieldIcon",
    logo: undefined,
    widgets: {
        analytics: AccessControlWidget
    },
    service: {
        fetch: AccessControlApiService
    },
    uri: '/access-control',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'ADMINISTRATION',
}

export default accessControlModule
