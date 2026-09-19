import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {UsersSidePanel} from "@/modules/identity/presentation/components/users-side.panel";
import {UsersDataGrid} from "@/modules/identity/presentation/components/users-data-grid";
import {UsersAnalyticsChart} from "@/modules/identity/presentation/components/users-analytics-chart";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {PlusIcon} from "lucide-react";
import {CreateUserStepper} from "@/modules/identity/presentation/components/create-user-stepper";
import {Activity} from "@liorian/sdk/presentation/components/activity";

export function UsersView() {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col lg:flex-row p-6 gap-6">
                    <Activity.Container variant="container" animateChildren className="contents">
                        <Activity.Content>
                            <Activity.Header>
                                <Activity.Title label="Gestion des utilisateurs"/>
                                <Activity.Actions>
                                    <CreateUserStepper/>
                                </Activity.Actions>
                            </Activity.Header>

                            <div className="flex flex-col gap-4 min-h-[40dvh]">
                                <UsersAnalyticsChart/>
                            </div>

                            <div className="flex-auto">
                                <UsersDataGrid/>
                            </div>
                        </Activity.Content>
                        <UsersSidePanel/>
                    </Activity.Container>
                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    )
}
