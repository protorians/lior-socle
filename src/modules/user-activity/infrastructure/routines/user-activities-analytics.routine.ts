import {Routine} from "@sentients/sdk/infrastructure/routines/routine";
import {RoutineInterface} from "@sentients/sdk/domain/typing/routine.types";
import {UserActivitiesApiService} from "@/modules/user-activity/application/service/user-activities-api-service";
import {UserActivitiesAnalyticsInterface} from "@/modules/user-activity/domain/user-activities.interface";

export interface UserActivitiesAnalyticsDataRoutine extends UserActivitiesAnalyticsInterface {

}

export class UserActivitiesAnalyticsRoutine extends Routine<UserActivitiesAnalyticsDataRoutine>
    implements RoutineInterface<UserActivitiesAnalyticsDataRoutine> {

    constructor() {
        super('user-activities.analytics', {
            icon: 'ChartNoAxesCombined',
            name: 'Service Analytique en temps réel'
        });
    }

    async job(): Promise<UserActivitiesAnalyticsDataRoutine | undefined> {
        return new Promise(async (resolve) => {
            const response = await UserActivitiesApiService.getAnalytics({
                granularity: this.granularity,
            });
            if (
                (!response) ||
                (!response.data) ||
                (!response.data.data)
            ) throw new Error('Impossible de charger les données analytiques des activités');
            resolve(response.data.data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }
}

export const userActivitiesAnalyticsRoutine = new UserActivitiesAnalyticsRoutine();
