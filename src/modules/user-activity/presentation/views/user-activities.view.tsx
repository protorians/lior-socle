"use client"

import {ActivityIcon} from "lucide-react";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {MainWrapper} from "@liorian/sdk/presentation/themes/katon/main-wrapper";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {
    UserActivitiesAnalyticsData
} from "@/modules/user-activity/presentation/components/user-activities-analytics-data";
import {
    UserActivitiesAnalyticsChart
} from "@/modules/user-activity/presentation/components/user-activities-analytics-chart";
import {
    UserActivitiesByModuleChart
} from "@/modules/user-activity/presentation/components/user-activities-by-module-chart";
import {
    UserActivitiesByActionList
} from "@/modules/user-activity/presentation/components/user-activities-by-action-list";
import {UserActivitiesTopUsers} from "@/modules/user-activity/presentation/components/user-activities-top-users";
import {UserActivitiesFeed} from "@/modules/user-activity/presentation/components/user-activities-feed";

export function UserActivitiesView() {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col md:flex-row p-6 gap-6">
                    <Activity.Container variant="enter" className={"w-auto! flex-auto"}>
                        <Activity.Content>
                            <Activity.Header>
                                <Activity.Title label="Journal d'activité" description="Traçabilité et analytiques des actions de votre organisation" icon={<ActivityIcon/>}/>
                            </Activity.Header>

                            <UserActivitiesAnalyticsData/>

                            <UserActivitiesAnalyticsChart/>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <UserActivitiesByModuleChart/>
                                <UserActivitiesByActionList/>
                            </div>

                            <UserActivitiesTopUsers/>
                        </Activity.Content>
                    </Activity.Container>

                    <Activity.Container variant="scale" className={"max-w-2xl"}>
                        <UserActivitiesFeed/>

                    </Activity.Container>

                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    )
}
