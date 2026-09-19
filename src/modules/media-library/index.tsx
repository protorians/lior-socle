import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {CloudApiService} from "@/modules/media-library/application/service/cloud-api-service";
import {CloudWidget} from "@/modules/media-library/presentation/widgets/cloud.widget";

const cloudModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.media-library',
    key: 'MEDIA_LIBRARY',
    version: '1.0.0',
    name: 'Fichiers',
    description: 'Gestion des fichiers',
    icon: "CloudIcon",
    logo: undefined,
    widgets: {
        analytics: CloudWidget
    },
    service: {
        fetch: CloudApiService
    },
    uri: '/media-library',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'DATA',
}

export default cloudModule
