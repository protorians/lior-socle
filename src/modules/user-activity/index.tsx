import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service";
import {UserActivitiesWidget} from "@/modules/user-activity/presentation/widgets/user-activities.widget";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";

const userActivitiesModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.user-activity',
    key: 'USER_ACTIVITY',
    version: '1.0.0',
    name: 'Activités des utilisateurs',
    description: "Journal d'activité et traçabilité",
    icon: "RotateCcwClockIcon",
    logo: undefined,
    widgets: {
        analytics: UserActivitiesWidget
    },
    service: {
        fetch: UserActivitiesApiService
    },
    routines: [
        userActivitiesAnalyticsRoutine
    ],
    uri: '/user-activity',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'ADMINISTRATION',
    requirements: {
        'organization': '>=1.0.0',
        'identity': '>=1.0.0',
    },
}

export default userActivitiesModule
