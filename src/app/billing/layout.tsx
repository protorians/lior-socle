import React from "react";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";

export default function BillingLayout({children}: { children: React.ReactNode }) {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col lg:flex-row p-6 gap-6">
                    {children}
                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    );
}
