import {NotificationsApiService} from "@sentients/sdk/application/service/notifications-api-service";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {NotificationsWidget} from "@/modules/notification/presentation/widgets/notifications.widget";

const notificationsModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.notification',
    key: 'NOTIFICATION',
    version: '1.0.0',
    name: 'Notifications',
    description: 'Centre de notifications',
    icon: "BellIcon",
    logo: undefined,
    widgets: {
        analytics: NotificationsWidget
    },
    service: {
        fetch: NotificationsApiService
    },
    uri: '/notification',
    isEnabled: true,
    isDefault: true,
    type: 'INTERNAL',
    category: 'COMMUNICATION',
    requirements: {
        'organization': '>=1.0.0',
        'identity': '>=1.0.0',
    },
}

export default notificationsModule
