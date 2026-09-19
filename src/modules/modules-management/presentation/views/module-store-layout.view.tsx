"use client"

import * as React from "react";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";

interface ModuleStoreLayoutProps {
    children: React.ReactNode;
}

export function ModuleStoreLayout({children}: ModuleStoreLayoutProps) {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>

                <View.Frame className={cn("flex flex-col p-4 lg:p-6 gap-6 max-w-screen mx-auto")}>
                    <Activity.Container variant="container" animateChildren className="contents">
                        {children}
                    </Activity.Container>
                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    );
}
