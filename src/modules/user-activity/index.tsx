import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service";
import {UserActivitiesWidget} from "@/modules/user-activity/presentation/widgets/user-activities.widget";
import {userActivitiesAnalyticsRoutine} from "@/modules/user-activity/infrastructure/routines/user-activities-analytics.routine";

const userActivitiesModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.user-activity',
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
}

export default userActivitiesModule
