"use client"

import {useEffect} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty"
import {DynamicIcon} from "@sentients/sdk/presentation/components/dynamic-icon"

export default function Error({error, retry}: { error: Error & { digest?: string }; retry: () => void }) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Empty className="max-w-md">
                <EmptyMedia variant="icon">
                    <DynamicIcon name="BugIcon" className="size-10"/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Une erreur est survenue</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    Un problème inattendu s&apos;est produit. Veuillez réessayer.
                </EmptyDescription>
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.push('/dashboard')}>
                        Retour au tableau de bord
                    </Button>
                    <Button size="lg" onClick={() => retry()}>
                        Réessayer
                    </Button>
                </div>
            </Empty>
        </div>
    )
}
