"use client"

import {ActivityIcon} from "lucide-react";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {MainWrapper} from "@sentients/sdk/presentation/themes/katon/main-wrapper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";
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
            <Wrapper>
                <Header/>
                <Main className="flex flex-col md:flex-row p-6 gap-6">
                    <AnimatedContent variant="enter" className={"w-auto! flex-auto"}>
                        <div className="gap-6 flex flex-col">

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden items-center gap-3">
                                    <span
                                        className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <ActivityIcon/>
                                    </span>
                                    <div>
                                        <h1 className="text-2xl font-bold truncate text-ellipsis">Journal
                                            d'activité</h1>
                                        <p className="text-sm text-muted-foreground">Traçabilité et analytiques des
                                            actions
                                            de votre organisation</p>
                                    </div>
                                </div>
                            </div>

                            <UserActivitiesAnalyticsData/>

                            <UserActivitiesAnalyticsChart/>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <UserActivitiesByModuleChart/>
                                <UserActivitiesByActionList/>
                            </div>

                            <UserActivitiesTopUsers/>
                        </div>
                    </AnimatedContent>

                    <AnimatedContent variant="scale" className={"max-w-2xl"}>
                        <UserActivitiesFeed/>

                    </AnimatedContent>

                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
