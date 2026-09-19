import {ApiService} from "@liorian/sdk/infrastructure/utilities/api-service";
import {ActivitiesType} from "@liorian/sdk/domain/entities/activities.interface";
import {FetchResponseInterface} from "@liorian/sdk/domain/typing/response";
import {UserActivitiesAnalyticsInterface} from "@/modules/user-activity/domain/user-activities.interface";

export class UserActivitiesApiService extends ApiService {

    static async getAll(options?: { limit?: number }) {
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/', options);
    }

    static async getMyActivities() {
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/me');
    }

    static async getAnalytics(params?: { granularity?: string; startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.granularity) query.set('granularity', params.granularity);
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        const queryStr = query.toString();
        return await this.get<FetchResponseInterface<UserActivitiesAnalyticsInterface>>(
            `/user-activities/analytics${queryStr ? '?' + queryStr : ''}`
        );
    }
}
