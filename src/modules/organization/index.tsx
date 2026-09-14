import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {OrganizationsWidget} from "@/modules/organization/presentation/widgets/organizations.widget";
import {authUserConnectedStore} from "@sentients/sdk/infrastructure/stores/auth-user-connected.store";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

const organizationsModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.organization',
    key: 'ORGANIZATION',
    version: '1.0.0',
    name: 'Organisations',
    description: 'Gestion des organisations, membres, clés API et modules',
    icon: "BuildingIcon",
    logo: undefined,
    widgets: {
        analytics: OrganizationsWidget
    },
    service: {
        fetch: OrganizationsApiService
    },
    uri: '/organization',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'ADMINISTRATION',
    requirements: {},
    menu: {
        items: [
            {
                label: 'Toutes',
                icon: 'BuildingIcon',
                url: '/organization',
            },
            {
                label: 'Actuelle',
                icon: 'EyeIcon',
                action: (router) => {
                    const {currentOrganization} = authUserConnectedStore.getState();
                    if (currentOrganization?.id) {
                        router.push(`/organization?id=${currentOrganization.id}`);
                    } else {
                        toast.error('Vous n\'êtes pas membre d\'une organisation');
                    }

                    console.log('Menu Action ', currentOrganization)
                },
            },
            {
                label: 'Paramètres',
                icon: 'SettingsIcon',
                url: '/organization/settings',
            },
        ]
    },
}

export default organizationsModule
