import {UserActivitiesAnalyticsInterface} from "@/modules/user-activity/domain/user-activities.interface";

export class UserActivitiesAnalyticsAdapter {
    static toDashboard(data?: UserActivitiesAnalyticsInterface) {
        if (!data || !data.summary) {
            return {
                totalActivities: 0,
                activitiesLast24h: 0,
                uniqueUsersActive: 0,
            };
        }
        return {
            totalActivities: data.summary.totalActivities || 0,
            activitiesLast24h: data.summary.activitiesLast24h || 0,
            uniqueUsersActive: data.summary.uniqueUsersActive || 0,
        };
    }
}
