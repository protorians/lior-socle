"use client"

import * as React from "react"
import {Switch} from "@sentients/sdk/presentation/ui/switch"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@sentients/sdk/presentation/ui/card"
import {DynamicIcon} from "@sentients/sdk/presentation/components/dynamic-icon"
import {MODULE_OPTIONS, ModuleEnum} from "@sentients/sdk/domain/enums/module.enum"
import {OrganizationsApiService} from "@sentients/sdk/application/service/organizations-api-service"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import {toast} from "sonner"
import {cn} from "@sentients/sdk/infrastructure/utilities/utils"

export function OrganizationModulesPanel({organizationId, enabledModules}: {
    organizationId: string
    enabledModules: ModuleEnum[]
}) {
    const queryClient = useQueryClient()
    const [modules, setModules] = React.useState<ModuleEnum[]>(enabledModules ?? [])

    React.useEffect(() => {
        setModules(enabledModules ?? [])
    }, [enabledModules])

    const updateMutation = useMutation({
        mutationFn: (next: ModuleEnum[]) => OrganizationsApiService.updateModules(organizationId, next),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['organizations']})
            queryClient.invalidateQueries({queryKey: ['organizations', organizationId]})
            toast.success('Modules mis à jour')
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour des modules')
        },
    })

    const toggle = (module: ModuleEnum) => {
        setModules(prev => {
            const active = prev.includes(module)
            const next = active ? prev.filter(m => m !== module) : [...prev, module]
            updateMutation.mutate(next)
            return next
        })
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {MODULE_OPTIONS.map((option) => {
                const active = modules.includes(option.value)
                return (
                    <Card
                        key={option.value}
                        className={cn('transition-colors', active ? 'border-primary/40 bg-primary/5' : 'opacity-80')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    'size-10 rounded-xl flex items-center justify-center',
                                    active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                                )}>
                                    <DynamicIcon name={option.icon} className="size-5"/>
                                </span>
                                <div>
                                    <CardTitle className="text-base">{option.label}</CardTitle>
                                    <CardDescription className="line-clamp-1">{option.description}</CardDescription>
                                </div>
                            </div>
                            <Switch
                                checked={active}
                                onCheckedChange={() => toggle(option.value)}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-medium px-2 py-1 bg-muted rounded-md text-muted-foreground uppercase inline-block">
                                {option.value}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
