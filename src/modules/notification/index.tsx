import {NotificationsApiService} from "@liorian/sdk/application/service/notifications-api-service";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {NotificationsWidget} from "@/modules/notification/presentation/widgets/notifications.widget";

const notificationsModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.notification',
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
}

export default notificationsModule
