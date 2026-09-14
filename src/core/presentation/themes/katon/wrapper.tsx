import React from "react";
import {StartMenu} from "@/core/presentation/themes/katon/start-menu";
import Link from "next/link";
import {ThemeLogo} from "@sentients/sdk/presentation/system/logo.theme";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";

export interface WrapperProps {
    children: React.ReactNode;
}

export function Wrapper({children}: WrapperProps) {
    return (
        <div className="relative max-w-screen w-full min-h-[100dvh-64px] flex flex-col md:flex-row gap-0 pb-24">
            {/*<div className={cn(*/}
            {/*    "fixed! z-20 [&+*]:mt-16 sm:[&+*]:mt-0 md:[&+*]:ml-20 top-0 bottom-0 w-full h-20 md:w-20 md:h-full gap-0",*/}
            {/*    "flex flex-row md:flex-col",*/}
            {/*    "backdrop-blur-xl mask-[linear-gradient(to_bottom,background_40%,transparent_100%)]"*/}
            {/*)}>*/}
            {/*    <div className="md:px-3 px-2 w-16 h-16 flex items-center justify-center">*/}
            {/*        <Link href={"/public"} className="w-full h-full flex items-center justify-center">*/}
            {/*            <ThemeLogo color={"black"} onDark={"white"} variant={"square"}/>*/}
            {/*        </Link>*/}
            {/*    </div>*/}
            {/*    <div className={cn(*/}
            {/*        "relative flex-auto flex flex-row md:flex-col justify-start px-2 md:mb-20",*/}
            {/*        "overflow-x-auto overflow-y-hidden",*/}
            {/*        "sm:overflow-x-hidden sm:overflow-y-auto",*/}
            {/*        "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",*/}
            {/*        "pr-8 sm:pr-0",*/}
            {/*        // "pl-8 sm:pl-0",*/}
            {/*    )}>*/}
            {/*        /!*<div className="block sm:hidden absolute top-0 left-0 bg-linear-to-l from-transparent to-background w-16 h-full"/>*!/*/}
            {/*        <StartMenu/>*/}
            {/*    </div>*/}
            {/*    <div*/}
            {/*        className="block sm:hidden absolute top-0 right-0 bg-linear-to-l from-background to-transparent w-12 h-full"/>*/}
            {/*</div>*/}
            {/*<div className="flex flex-col gap-0 flex-auto">*/}
                {children}
            {/*</div>*/}
        </div>
    );
}