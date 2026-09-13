"use client"

import * as React from "react";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";

interface ModuleStoreLayoutProps {
    children: React.ReactNode;
}

export function ModuleStoreLayout({children}: ModuleStoreLayoutProps) {
    return (
        <View>
            <Wrapper>
                <Header/>

                <Main className={cn("flex flex-col p-4 lg:p-6 gap-6 max-w-screen mx-auto")}>
                    <AnimatedContent variant="container" animateChildren className="contents">
                        {children}
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    );
}
