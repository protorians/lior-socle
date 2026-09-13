"use client"

import {ModuleStoreSearch} from "@/modules/modules-management/presentation/components/module-store-search";
import React, {Dispatch, SetStateAction} from "react";

interface ModuleStoreHeaderProps {
    isSyncing?: boolean;
    onSync?: () => void;
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    canManage?: boolean;
    onPublish?: () => void;
    search?: string;
    setSearch?: Dispatch<SetStateAction<string>>;
}

export function ModuleStoreHeader(
    {
        isSyncing,
        onSync,
        icon,
        title,
        description,
        canManage,
        onPublish,
        search,
        setSearch
    }: ModuleStoreHeaderProps) {
    return (
        <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {icon}
                    {title}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {description}
                </p>
            </div>

            <div className="flex-auto flex flex-row gap-4 justify-end">
                <ModuleStoreSearch
                    value={search || ''}
                    onChange={setSearch || (() => {
                    })}
                />
                {/*<div className="flex items-center gap-2">*/}
                {/*    {canManage && onPublish && (*/}
                {/*        <Button onClick={onPublish}>*/}
                {/*            <PlusIcon className="size-4 mr-1.5"/>*/}
                {/*            Publier un module*/}
                {/*        </Button>*/}
                {/*    )}*/}
                {/*    <Button*/}
                {/*        variant="outline"*/}
                {/*        onClick={onSync}*/}
                {/*        disabled={isSyncing}*/}
                {/*    >*/}
                {/*        <RefreshCwIcon className={`size-4 ${isSyncing ? "animate-spin" : ""}`}/>*/}
                {/*        Synchroniser*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </div>

        </div>
    );
}