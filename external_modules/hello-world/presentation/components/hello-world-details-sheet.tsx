"use client";

import React from "react";
import {LegacySheet} from "@sentients/sdk/presentation/sheets/legacy-sheet";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {Separator} from "@sentients/sdk/presentation/ui/separator";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";
import {CalendarDaysIcon, ClockIcon, MessageCircleIcon, SendIcon, UserIcon} from "lucide-react";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {HelloWorldInterface} from "../../domain/hello-world.interface";
import {HelloWorldStatus} from "../../domain/enums/hello-world-status.enum";

export interface HelloWorldDetailsSheetProps {
    item: HelloWorldInterface;
    children?: React.ReactNode;
    opened?: boolean;
    onOpenChange?: (status: boolean) => void;
    onChanged?: () => void;
}

const STATUS_LABELS: Record<HelloWorldStatus, string> = {
    [HelloWorldStatus.DRAFT]: 'Brouillon',
    [HelloWorldStatus.PUBLISHED]: 'Publié',
    [HelloWorldStatus.ARCHIVED]: 'Archivé',
};

export function HelloWorldDetailsSheet({children, opened, onOpenChange, item}: HelloWorldDetailsSheetProps) {
    if (!item) return null;

    const formatDate = (date?: string | null) => {
        if (!date) return "N/A";
        try {
            return format(new Date(date), "d MMMM yyyy HH:mm", {locale: fr});
        } catch {
            return "Date invalide";
        }
    };

    const status = item.status || HelloWorldStatus.DRAFT;

    return (
        <LegacySheet trigger={children} opened={opened} onOpenChange={onOpenChange}>
            <div className="flex flex-col h-full space-y-6 p-6">
                <div className="flex flex-row items-center space-x-4 pt-4">
                    <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <SendIcon className="size-10"/>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{item.title}</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={status === HelloWorldStatus.PUBLISHED ? "default" : "outline"}
                                className={cn(
                                    status === HelloWorldStatus.PUBLISHED
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : status === HelloWorldStatus.ARCHIVED
                                            ? "text-muted-foreground"
                                            : "text-amber-600 border-amber-500/20"
                                )}
                            >
                                {STATUS_LABELS[status] ?? status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator/>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <Section title="Contenu">
                        <InfoRow
                            icon={<MessageCircleIcon className="size-4"/>}
                            label="Message"
                            value={item.message || undefined}
                        />
                        <InfoRow
                            icon={<UserIcon className="size-4"/>}
                            label="Auteur"
                            value={item.author || undefined}
                        />
                    </Section>

                    <Section title="Informations système">
                        <InfoRow
                            icon={<CalendarDaysIcon className="size-4"/>}
                            label="Créé le"
                            value={formatDate(item.createdAt)}
                        />
                        <InfoRow
                            icon={<ClockIcon className="size-4"/>}
                            label="Dernière modification"
                            value={formatDate(item.updatedAt)}
                        />
                    </Section>
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
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider pl-1">{title}</h3>
            <div className="bg-muted/20 rounded-lg p-4 space-y-4 border border-border/50">{children}</div>
        </div>
    );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    className?: string;
}

function InfoRow({icon, label, value, className}: InfoRowProps) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div className="mt-0.5 text-muted-foreground p-1.5 bg-background rounded-md border border-border/50 shadow-xs">
                {icon}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground uppercase leading-none mb-1">{label}</span>
                <span className="text-sm font-medium break-words leading-tight">{value || "Non renseigné"}</span>
            </div>
        </div>
    );
}