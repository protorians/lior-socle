import React from "react";
import {View} from "@liorian/sdk/presentation/themes/katon/view";

export default function PosDriveLayout({children}: { children: React.ReactNode }) {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col lg:flex-row px-6 gap-6">
                    {children}
                </View.Frame>
            </View.Wrapper>
        </View>
    );
}