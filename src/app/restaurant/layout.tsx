import React from "react";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";

export default function RestaurantLayout({children}: { children: React.ReactNode }) {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row px-6 gap-6">
                    {children}
                </Main>
            </Wrapper>
        </View>
    );
}
