"use client"

import * as React from "react"
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {DashboardWidgetsContainer} from "@/modules/dashboard/presentation/components/dashboard-widgets-container";
import DashboardSidePanel from "@/modules/dashboard/presentation/components/dashboard-side-panel";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";

export function DashboardView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="w-full flex flex-col lg:flex-row p-6 gap-6">
                    <AnimatedContent variant="container" className="contents" >
                        <DashboardWidgetsContainer/>
                        <DashboardSidePanel/>
                    </AnimatedContent>
                </Main>
                <Footer/>
            </Wrapper>
        </View>
    )
}
