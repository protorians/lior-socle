export interface UserActivitiesSummaryInterface {
    totalActivities: number;
    activitiesLast24h: number;
    uniqueUsersActive: number;
    mostActiveModule: string;
}

export interface UserActivitiesByModuleInterface {
    module: string;
    count: number;
}

export interface UserActivitiesByActionInterface {
    action: string;
    count: number;
}

export interface UserActivitiesTopUserInterface {
    userId: string;
    username: string;
    activityCount: number;
}

export interface UserActivitiesOverTimeInterface {
    date: string;
    count: number;
}

export interface UserActivitiesAnalyticsInterface {
    summary: UserActivitiesSummaryInterface;
    activitiesByModule: UserActivitiesByModuleInterface[];
    activitiesByAction: UserActivitiesByActionInterface[];
    topActiveUsers: UserActivitiesTopUserInterface[];
    activityOverTime: UserActivitiesOverTimeInterface[];
}
