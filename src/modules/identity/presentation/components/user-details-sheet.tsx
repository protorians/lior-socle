"use client";

import React from "react";
import {LegacySheet} from "@liorian/sdk/presentation/sheets/legacy-sheet";
import {UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import {Avatar, AvatarFallback} from "@liorian/sdk/presentation/ui/avatar";
import {Badge} from "@liorian/sdk/presentation/ui/badge";
import {Separator} from "@liorian/sdk/presentation/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@liorian/sdk/presentation/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@liorian/sdk/presentation/ui/accordion";
import {
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    UserIcon,
    ShieldIcon,
    ClockIcon,
    CalendarDaysIcon,
    CheckCircle2Icon,
    XCircleIcon,
    AlertCircleIcon,
    TimerIcon,
    ShieldPlusIcon, ShieldCogIcon
} from "lucide-react";
import {getFullName} from "@/modules/identity/infrastructure/utilities/users-name.util";
import {UserStatusEnum} from "@liorian/sdk/domain/enums/user-status.enum";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {cn} from "@liorian/sdk/infrastructure/utilities/utils";
import {getDomainLabel, getRoleLabel} from "@liorian/sdk/infrastructure/utilities/access-label.util";
import {PermissionActionBadge} from "@liorian/sdk/presentation/permission-action-badge";
import {StorageMedia} from "@liorian/sdk/presentation/uploading/storage-media";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {useAuth} from "@liorian/sdk/infrastructure/hooks/use-auth";
import {useModal} from "@liorian/sdk/presentation/modals/hooks/useModal";
import {
    UserRolesAccessModal,
    UserRolesAccessModalProps,
} from "@/modules/identity/presentation/components/user-roles-access-modal";
import {toast} from "sonner";

export interface UserDetailsSheetProps {
    user: UserInterface;
    children?: React.ReactNode;
    opened?: boolean;
    onOpenChange?: (status: boolean) => void;
}

export function UserDetailsSheet({children, opened, onOpenChange, user}: UserDetailsSheetProps) {
    const {currentOrganization} = useAuth();
    const {open, close} = useModal();

    if (!user) return null;

    const fullName = getFullName(user);
    const initials = (user.userData?.firstname?.[0] || "") + (user.userData?.lastname?.[0] || "");
    const displayInitials = initials.toUpperCase() || user.username.substring(0, 2).toUpperCase();

    const formatDate = (date?: Date | string) => {
        if (!date) return "N/A";
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            return format(d, "d MMMM yyyy", {locale: fr});
        } catch (e) {
            return "Date invalide";
        }
    };

    const getStatusConfig = (status: UserStatusEnum) => {
        switch (status) {
            case UserStatusEnum.ACTIVE:
                return {
                    label: "Actif",
                    variant: "default" as const,
                    icon: <CheckCircle2Icon className="size-3"/>,
                    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                };
            case UserStatusEnum.INACTIVE:
                return {
                    label: "Inactif",
                    variant: "secondary" as const,
                    icon: <XCircleIcon className="size-3"/>,
                    className: ""
                };
            case UserStatusEnum.SUSPENDED:
                return {
                    label: "Suspendu",
                    variant: "destructive" as const,
                    icon: <AlertCircleIcon className="size-3"/>,
                    className: ""
                };
            case UserStatusEnum.BANNED:
                return {
                    label: "Banni",
                    variant: "destructive" as const,
                    icon: <XCircleIcon className="size-3"/>,
                    className: ""
                };
            case UserStatusEnum.PENDING:
                return {
                    label: "En attente",
                    variant: "outline" as const,
                    icon: <TimerIcon className="size-3"/>,
                    className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
                };
            default:
                return {label: status, variant: "outline" as const, icon: null, className: ""};
        }
    };

    const statusConfig = getStatusConfig(user.status ?? UserStatusEnum.INACTIVE);

    const openRolesAccessModal = () => {
        if (!user?.id || !currentOrganization?.id) {
            toast.warning("Aucune organisation sélectionnée pour gérer les rôles");
            return;
        }

        const modalId = open(
            (props: UserRolesAccessModalProps) => (
                <UserRolesAccessModal
                    user={props.user}
                    organization={props.organization}
                    close={props.close}
                />
            ),
            {user, organization: currentOrganization, close: () => close(modalId)},
            {
                title: "Rôles & accès",
                description: `Gérez les rôles et permissions de ${fullName}`,
                size: "XL",
                useHeight: true,
                scrollable: false,
            }
        );
    };

    return (
        <LegacySheet trigger={children} opened={opened} onOpenChange={onOpenChange}>
            <div className="flex flex-col h-full space-y-6 p-6">
                {/* Header Profile Section */}
                <div className="flex flex-row items-center space-x-4 pt-4">
                    <Avatar className="size-24 text-xl overflow-hidden">
                        {user.avatar?.id ? (
                            <StorageMedia id={user.avatar.id} className="size-full"/>
                        ) : (
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                                {displayInitials}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex flex-col items-start space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{fullName}</h2>
                        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5">
                            <UserIcon className="size-3.5"/>
                            @{user.username}
                        </p>
                        <Badge variant={statusConfig.variant} className={statusConfig.className}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                    </div>
                </div>

                <Separator/>

                {/* Content Sections */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
                        <div className="px-1 flex justify-start overflow-y-hidden overflow-x-auto scrollbar-none">
                            <TabsList variant="default" className="">
                                <TabsTrigger value="general"
                                             className="px-4 py-2">
                                    Général
                                </TabsTrigger>
                                <TabsTrigger value="access"
                                             className="px-4 py-2">
                                    Accès & Rôles
                                </TabsTrigger>
                                <TabsTrigger value="system"
                                             className="px-4 py-2">
                                    Système
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4 pr-2 pb-8">
                            <TabsContent value="general" className="mt-0 space-y-6">
                                {/* Contact Information */}
                                <Section title="Informations de contact">
                                    <InfoRow
                                        icon={<MailIcon className="size-4"/>}
                                        label="Email"
                                        value={user.email}
                                        isCopyable
                                    />
                                    <InfoRow
                                        icon={<PhoneIcon className="size-4"/>}
                                        label="Téléphone"
                                        value={user.userPhones?.map(phone => phone.phone).filter(Boolean).join(", ")}
                                    />
                                    <InfoRow
                                        icon={<MapPinIcon className="size-4"/>}
                                        label="Adresse"
                                        value={[user.userData?.address, user.userData?.city, user.userData?.country].filter(Boolean).join(", ")}
                                    />
                                </Section>

                                {/* Personal Details */}
                                <Section title="Détails personnels">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoRow
                                            icon={<UserIcon className="size-4"/>}
                                            label="Genre"
                                            value={user.userData?.gender === 'M' ? 'Masculin' : user.userData?.gender === 'F' ? 'Féminin' : user.userData?.gender}
                                        />
                                        <InfoRow
                                            icon={<CalendarIcon className="size-4"/>}
                                            label="Date de naissance"
                                            value={formatDate(user.userData?.birthDate)}
                                        />
                                    </div>
                                </Section>
                            </TabsContent>

                            <TabsContent value="access" className="mt-0 space-y-6">
                                <div className="flex flex-row justify-start items-center">
                                    {/* Roles & Permissions */}
                                    <Button
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={openRolesAccessModal}
                                    >
                                        <ShieldCogIcon className="size-4 text-primary"/>
                                        Modifier les permissions
                                    </Button>
                                </div>
                                {/*<Section title="Rôles et Accès">*/}
                                {user.roles && user.roles.length > 0 ? (
                                    <Accordion type="multiple" className="w-full">
                                        {user.roles.map((role) => (
                                            <AccordionItem key={role.id ?? role.name} value={role.id ?? role.name}
                                                           className="border-b-0 mb-2 border rounded-sm px-2">
                                                <AccordionTrigger className="hover:no-underline py-3">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldIcon className="size-4 text-primary"/>
                                                        <span className="text-sm font-semibold">{getRoleLabel(role.name)}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className="px-1.5 text-muted-foreground tabular-nums"
                                                        >
                                                            {(role.level ?? 0).toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent
                                                    className="pb-4 max-h-[60dvh] overflow-y-auto scrollbar-thin">
                                                    <div
                                                        className="space-y-0 divide-y divide-border/50 border-t border-border/50">
                                                        {Object.entries(role.permissions || {}).map(([domain, caps], index) => {
                                                            const capabilities = caps as any;
                                                            const hasAnyPermission = capabilities.read || capabilities.create || capabilities.update || capabilities.delete;

                                                            if (!hasAnyPermission) return null;

                                                            return (
                                                                <div key={domain}
                                                                     className="flex items-center justify-between py-2.5 px-1">
                                                                    <span
                                                                        className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{getDomainLabel(domain)}</span>
                                                                    <div className="flex flex-wrap gap-2 justify-end">
                                                                        {capabilities.read &&
                                                                            <PermissionActionBadge action="get"/>
                                                                        }
                                                                        {capabilities.create &&
                                                                            <PermissionActionBadge action="post"/>
                                                                        }
                                                                        {capabilities.update &&
                                                                            <PermissionActionBadge action="put"/>
                                                                        }
                                                                        {capabilities.delete &&
                                                                            <PermissionActionBadge action="delete"/>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        }).filter(Boolean)}
                                                        {(!role.permissions || Object.keys(role.permissions).length === 0) && (
                                                            <div
                                                                className="py-4 text-center text-xs text-muted-foreground italic">
                                                                Aucune permission granulaire définie
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed">
                                        <ShieldIcon className="size-8 text-muted-foreground/30 mb-2"/>
                                        <span className="text-sm text-muted-foreground italic">Aucun rôle assigné</span>
                                    </div>
                                )}
                                {/*</Section>*/}
                            </TabsContent>

                            <TabsContent value="system" className="mt-0 space-y-6">
                                {/* Audit & System */}
                                <Section title="Informations système">
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoRow
                                            icon={<CalendarDaysIcon className="size-4"/>}
                                            label="Créé le"
                                            value={formatDate(user.createdAt)}
                                        />
                                        <InfoRow
                                            icon={<ClockIcon className="size-4"/>}
                                            label="Dernière modification"
                                            value={formatDate(user.updatedAt)}
                                        />
                                        {user.auditId && (
                                            <InfoRow
                                                icon={<TimerIcon className="size-4"/>}
                                                label="ID Audit"
                                                value={user.auditId}
                                                className="text-xs opacity-70"
                                            />
                                        )}
                                    </div>
                                </Section>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </LegacySheet>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({title, children}: SectionProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider pl-1">
                {title}
            </h3>
            <div className="bg-muted/20 rounded-lg p-4 space-y-4 border border-border/50">
                {children}
            </div>
        </div>
    );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    isCopyable?: boolean;
    className?: string;
}

function InfoRow({icon, label, value, className}: InfoRowProps) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div
                className="mt-0.5 text-muted-foreground p-1.5 bg-background rounded-md border border-border/50 shadow-xs">
                {icon}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none mb-1">
                    {label}
                </span>
                <span className="text-sm font-medium break-words leading-tight">
                    {value || "Non renseigné"}
                </span>
            </div>
        </div>
    );
}
