"use client"

import React from "react";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {DynamicIcon} from "@liorian/sdk/presentation/components/dynamic-icon";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle
} from "@liorian/sdk/presentation/ui/item";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {ExternalLink} from "lucide-react";
import Link from "next/link";


export function ModulesListSheet() {
    const {modules} = useModuleStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const visibleModules = mounted
        ? modules.filter(module => !module.isEnabled)
        : [];

    return (
        <div className="w-full p-6 flex flex-col gap-6">

            <ItemGroup className={"gap-y-1"}>
                {visibleModules.map((module) => (
                    <Item
                        key={module.identifier}
                        variant="outline"
                    >
                        <ItemMedia>
                            <DynamicIcon name={module.icon} className="size-5 text-primary"/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle className="text-lg">{module.name}</ItemTitle>
                            <ItemDescription className="line-clamp-1">{module.description}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Link href={module.uri}>
                                <Button variant="outline">
                                    <ExternalLink/>
                                    Ouvrir
                                </Button>
                            </Link>
                        </ItemActions>
                    </Item>
                ))}
            </ItemGroup>
        </div>
    )
}
