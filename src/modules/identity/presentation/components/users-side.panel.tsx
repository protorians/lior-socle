import {UserActivitiesFeed} from "@/modules/dashboard/presentation/components/user-activities-feed";
import {UsersAnalyticsData} from "@/modules/identity/presentation/components/users-analytics-data";

export function UsersSidePanel() {
    return (
        <div className="w-full lg:max-w-[25dvw] ">
            <div className="flex flex-col gap-4">
                <div className="">
                    <UsersAnalyticsData/>
                </div>
                <div className="">
                    <UserActivitiesFeed compacted={true}/>
                </div>
                <div className="sticky top-20 ">

                </div>
            </div>
        </div>
    )
}
