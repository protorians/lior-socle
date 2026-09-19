"use client"

import {
    ModuleDeclarationInterface,
    ModuleNavigationInterface
} from "@liorian/sdk/domain/entities/module.interface";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import Link from "next/link";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";
import {LucideIcon} from "@liorian/sdk/presentation/icons/lucide";
import {usePathname} from "next/navigation";
import {Fragment} from "react";
import {
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@liorian/sdk/presentation/ui/sheet";
import {LegacySheet} from "@liorian/sdk/presentation/sheets/legacy-sheet";


export function StartMenuItem(module: ModuleNavigationInterface) {
    const currentPathname = usePathname()
    const isActive = currentPathname.startsWith(module.url)

    const renderChildren = () => {
        return (
            <div className={"flex flex-row group relative"}>
                {module.icon && (<LucideIcon size={5} name={module.icon}/>)}
                <div className={cn(
                    "bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 absolute left-0 ml-10 whitespace-nowrap  transition-all",
                    "hidden group-hover:block"
                )}>{module.label}</div>
            </div>
        )
    }

    const itemClassName = cn(
        "aspect-square flex flex-row items-center gap-2 px-3 py-2 rounded-full text-xs transition-all",
        isActive && "bg-primary/90 text-primary-foreground border border-primary",
        !isActive && "text-foreground border border-transparent hover:bg-foreground/80 hover:text-background hover:border hover:border-foreground",
    )

    const isMega = module.dropdown?.type === "mega"
    const isMini = module.dropdown?.type === "mini"

    return (
        <Fragment>
            {
                module.dropdown
                    ? (
                        <LegacySheet
                            trigger={<div className={cn(itemClassName, "cursor-pointer items-center justify-center")}>{renderChildren()}</div>}
                            side={module.dropdown.side ?? "left"}
                            className={cn(
                                "bg-background/90",
                                isMega && "w-full! max-w-screen! md:max-w-[70dvw]!",
                                isMini && "w-[min(100%,200px)]! sm:w-[min(100%,200px)]! md:w-[min(100%,200px)]! lg:w-[min(100%,200px)]! xl:w-[min(100%,200px)]!"
                            )}
                        >
                            <SheetHeader>
                                <SheetTitle>
                                    {module.label}
                                </SheetTitle>
                                {module.description && (
                                    <SheetDescription>
                                        {module.description}
                                    </SheetDescription>
                                )}
                            </SheetHeader>
                            <div className="flex-auto flex-col gap-4 overflow-x-hidden overflow-y-auto">
                                {module.dropdown?.component(module)}
                            </div>
                        </LegacySheet>
                    )
                    : (
                        <Link
                            href={module.url}
                            className={itemClassName}>
                            {renderChildren()}
                        </Link>
                    )
            }
        </Fragment>
    )
}

function moduleToNavItem(module: ModuleDeclarationInterface): ModuleNavigationInterface {
    return {
        id: module.identifier,
        label: module.name,
        icon: module.icon,
        url: module.uri,
        useOnlyIcon: true,
    }
}

export function StartMenu() {
    const modules = useModuleStore(state => state.modules)

    const navItems = modules
        .filter(module => module.isEnabled)
        .map(moduleToNavItem)

    return (
        <nav
            className={cn(
                "flex flex-row md:flex-col items-center",
                "p-2",
                "max-h-16 sm:max-h-[60vh]",
            )}>
            {
                navItems.map((module, index) => {
                    return (
                        <StartMenuItem key={`default-modules-nav-${index}`} {...module} />
                    )
                })
            }
        </nav>
    )
}