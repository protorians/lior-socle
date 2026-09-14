import {Routine} from "@sentients/sdk/infrastructure/routines/routine";
import {UsersApiService} from "@/modules/identity/application/service/users-api-service";
import {UserAnalyticsInterface} from "@/modules/identity/domain/users.interface";
import {RoutineInterface} from "@sentients/sdk/domain/typing/routine.types";

export interface UsersAnalyticsDataRoutine extends UserAnalyticsInterface {

}

export class UsersAnalyticsRoutine extends Routine<UsersAnalyticsDataRoutine>
    implements RoutineInterface<UsersAnalyticsDataRoutine> {

    constructor() {
        super('users.analytics', {
            icon: 'ChartNoAxesCombined',
            name: 'Service Analytique en temps reel'
        });
    }

    async job(): Promise<UsersAnalyticsDataRoutine | undefined> {
        return new Promise(async (resolve) => {
            const response = await UsersApiService.getAnalytics({
                granularity: this.granularity,
            });
            if (
                (!response) ||
                (!response.data) ||
                (!response.data.data)
            ) throw new Error('Impossible de charger les données analytiques des utilisateurs');
            resolve(response.data.data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }

}

export const usersAnalyticsRoutine = new UsersAnalyticsRoutine();