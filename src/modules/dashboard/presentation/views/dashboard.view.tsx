"use client"

import * as React from "react"
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {DashboardWidgetsContainer} from "@/modules/dashboard/presentation/components/dashboard-widgets-container";
import DashboardSidePanel from "@/modules/dashboard/presentation/components/dashboard-side-panel";
import {Activity} from "@liorian/sdk/presentation/components/activity";

export function DashboardView() {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="w-full flex flex-col lg:flex-row p-6 gap-6">
                    <Activity.Container variant="container" className="contents" >
                        <DashboardWidgetsContainer/>
                        <DashboardSidePanel/>
                    </Activity.Container>
                </View.Frame>
                <View.Status breadcrumb={<AutoBreadcrumb/>}/>
            </View.Wrapper>
        </View>
    )
}
