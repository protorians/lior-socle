"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@sentients/sdk/presentation/ui/alert-dialog";
import {TrashIcon} from "lucide-react";

interface DashboardRemoveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    widgetLabel?: string
}

export function DashboardRemoveDialog(
    {open, onOpenChange, onConfirm, widgetLabel}: DashboardRemoveDialogProps
) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <TrashIcon className="size-4 text-destructive"/>
                        Supprimer le widget
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {widgetLabel
                            ? <>Voulez-vous vraiment supprimer le widget <strong>{widgetLabel}</strong> de votre tableau de bord ?</>
                            : <>Voulez-vous vraiment supprimer ce widget de votre tableau de bord ?</>
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
