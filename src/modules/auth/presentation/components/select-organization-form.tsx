"use client"

import {AuthConfig} from "@sentients/sdk/domain/config/auth.config";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {Building2, CheckCircle2} from "lucide-react"
import {useRouter, useSearchParams} from "next/navigation"
import {useState} from "react"
import {Motion} from "@sentients/sdk/infrastructure/library/motion"
import {elasticEnter} from "@sentients/sdk/infrastructure/library/motion-utils"
import {AuthUserService} from "@sentients/sdk/application/service/auth-user.service";
import {authUserConnectedStore} from "@sentients/sdk/infrastructure/stores/auth-user-connected.store";
import {toast} from "sonner";
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service";
import {OrganizationInterface} from "@sentients/sdk/domain/entities/organization.interface";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";

export function SelectOrganizationForm({className, ...props}: React.ComponentProps<"div">) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const {organizations, setCurrentOrganization} = authUserConnectedStore()

    const handleSelect = async (org: OrganizationInterface) => {
        setSelectedId(org.id)
        setIsLoading(true)

        try {
            // 1. Enregistrer l'organisation courante
            await AuthUserService.setCurrentOrganization(org)
            setCurrentOrganization(org)

            // 2. Rechercher sa clé publique d'API
            const response = await OrganizationsApiService.getApiAccess(org.id)
            const apiKeys = response.data.data
            const publicKey = apiKeys.publicKeys.length > 0 ? apiKeys.publicKeys[0] : null

            if (!publicKey) {
                toast.error("Aucune clé API trouvée pour cette organisation")
                throw new Error("No API key found for this organization")
            }

            await AuthUserService.setApiKey(publicKey)

            toast.success(`Organisation ${org.name} sélectionnée`)

            // 3. Rediriger vers la page demandée avant la demande de connexion
            const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
            router.push(callbackUrl)
        } catch (error: any) {
            console.error('Organization Selection Error', error)
            toast.error("Erreur lors de la sélection de l'organisation")
        } finally {
            setIsLoading(false)
        }
    }

    if (!organizations || organizations.length === 0) {
        return (
            <div className="text-center p-6 text-muted-foreground">
                <p>Aucune organisation disponible.</p>
                <Button variant="link" onClick={() => router.push(`${AuthConfig.routes.login}`)} className="mt-4">
                    Retour à la connexion
                </Button>
            </div>
        )
    }

    return (
        <Motion
            animation={elasticEnter()}
            className={cn("flex flex-col gap-6 w-full", className)}>

            <div className="flex flex-col gap-1 text-left w-full mb-4">
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Presque fini</span>
                <h1 className="text-3xl font-black tracking-tight">
                    Choisir une organisation<span className="text-primary">.</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Sélectionnez l'organisation avec laquelle vous souhaitez travailler.
                </p>
            </div>

            <div className="grid gap-4">
                {organizations.map((org) => (
                    <button
                        key={org.id}
                        onClick={() => handleSelect(org)}
                        disabled={isLoading}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer",
                            selectedId === org.id
                                ? "bg-primary/10 border-primary border-2 shadow-lg shadow-primary/10"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            selectedId === org.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            <Building2 className="size-5"/>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">{org.name}</h3>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{org.description}</p>
                        </div>
                        {selectedId === org.id ? (
                            <CheckCircle2 className="size-5 text-primary"/>
                        ) : (
                            isLoading && selectedId === org.id ? <WaitingActivity size={20}/> : null
                        )}
                    </button>
                ))}
            </div>

            <p className="px-2 text-left text-[11px] text-muted-foreground/50 leading-relaxed">
                Besoin d'aide ? Contactez votre administrateur pour accéder à d'autres organisations.
            </p>
        </Motion>
    )
}
