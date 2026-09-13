import {UserAnalyticsInterface} from "@/modules/identity/domain/users.interface";

export class UserAnalyticsAdapter {
    static toDashboard(data: any) {
        if (!data || !data.summary) {
            return {
                totalUsers: 0,
                activeUsers: 0,
                growth: 0
            };
        }
        return {
            totalUsers: data.summary.totalUsers || 0,
            activeUsers: data.summary.activeUsers || 0,
            growth: data.summary.newUsersThisMonth || 0
        };
    }
}
