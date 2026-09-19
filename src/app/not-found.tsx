"use client"

import {useRouter} from "next/navigation"
import {Button} from "@liorian/sdk/presentation/ui/button"
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty"
import {DynamicIcon} from "@liorian/sdk/presentation/components/dynamic-icon"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex min-h-svh items-center justify-center p-4">
            <Empty className="max-w-md">
                <EmptyMedia variant="icon">
                    <DynamicIcon name="FileQuestionIcon" className="size-5"/>
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Page introuvable</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    La page que vous recherchez n&apos;existe pas ou a été déplacée.
                </EmptyDescription>
                <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => history.go(0)}>
                        Actualiser
                    </Button>
                    <Button size="lg" onClick={() => router.push('/dashboard')}>
                        Retour au tableau de bord
                    </Button>
                </div>
            </Empty>
        </div>
    )
}
