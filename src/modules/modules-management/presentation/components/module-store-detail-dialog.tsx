"use client"

import * as React from "react";
import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@liorian/sdk/presentation/ui/dialog";
import {DynamicIcon} from "@liorian/sdk/presentation/components/dynamic-icon";
import {ModuleStoreDetailContent} from "./module-store-detail-content";

interface ModuleStoreDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: ModuleDeclarationInterface;
    onEditFiche?: () => void;
}

export function ModuleStoreDetailDialog({open, onOpenChange, module, onEditFiche}: ModuleStoreDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            {module.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={module.logo} alt={module.name} className="size-8 rounded-md object-cover"/>
                            ) : (
                                <DynamicIcon name={module.icon} className="size-6 text-primary"/>
                            )}
                        </div>
                        <div>
                            <DialogTitle>{module.name}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <ModuleStoreDetailContent module={module} onEditFiche={onEditFiche}/>
            </DialogContent>
        </Dialog>
    );
}