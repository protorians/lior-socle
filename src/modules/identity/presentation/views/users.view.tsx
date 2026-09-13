import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {UsersSidePanel} from "@/modules/identity/presentation/components/users-side.panel";
import {UsersDataGrid} from "@/modules/identity/presentation/components/users-data-grid";
import {UsersAnalyticsChart} from "@/modules/identity/presentation/components/users-analytics-chart";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {PlusIcon} from "lucide-react";
import {CreateUserStepper} from "@/modules/identity/presentation/components/create-user-stepper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";


export function UsersView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row p-6 gap-6">
                    <AnimatedContent variant="container" animateChildren className="contents">
                        <div className="flex-auto flex flex-col">

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden">
                                    <h1 className="text-2xl font-bold truncate text-ellipsis">Gestion des utilisateurs</h1>
                                </div>
                                <div className="flex flex-row items-center">
                                    <CreateUserStepper/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[40dvh]">
                                <UsersAnalyticsChart/>
                            </div>

                            <div className="flex-auto">
                                <UsersDataGrid/>
                            </div>
                        </div>
                        <UsersSidePanel/>
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}