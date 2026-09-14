"use client"

import {useEffect} from "react"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty"
import {DynamicIcon} from "@sentients/sdk/presentation/components/dynamic-icon"
import "./globals.css"

export default function GlobalError({error, retry}: { error: Error & { digest?: string }; retry: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="fr">
        <body>
        <div className="flex min-h-svh items-center justify-center p-4">
            <Empty className="max-w-md">
                <EmptyMedia variant="icon">
                    <DynamicIcon name="CircleAlertIcon" className="size-5"/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Une erreur est survenue</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    Un problème inattendu s&apos;est produit. Veuillez réessayer.
                </EmptyDescription>
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => history.go(0)}>
                        Actualiser
                    </Button>
                    <Button size="lg" onClick={() => retry()}>
                        Réessayer
                    </Button>
                </div>
            </Empty>
        </div>
        </body>
        </html>
    )
}
