"use client"

import {useQueryClient} from "@tanstack/react-query";
import {BellIcon, InboxIcon, RefreshCwIcon} from "lucide-react";
import {toast} from "sonner";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {Button} from "@liorian/sdk/presentation/ui/button";
import {Card} from "@liorian/sdk/presentation/ui/card";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@liorian/sdk/presentation/ui/empty";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@liorian/sdk/presentation/ui/pagination";
import {Skeleton} from "@liorian/sdk/presentation/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@liorian/sdk/presentation/ui/tabs";
import {NotificationItem} from "@liorian/sdk/presentation/components/notification-item";
import {NotificationCategory, useNotifications} from "@liorian/sdk/infrastructure/hooks/use-notifications";
import {NotificationsApiService} from "@liorian/sdk/application/service/notifications-api-service";
import {NotificationInterface} from "@liorian/sdk/domain/entities/notification.interface";
import {MainWrapper} from "@liorian/sdk/presentation/themes/katon/main-wrapper";
import {Activity} from "@liorian/sdk/presentation/components/activity";

function NotificationsPagination({
                                     pageCount,
                                     pageIndex,
                                     onPageChange,
                                 }: { pageCount: number; pageIndex: number; onPageChange: (page: number) => void }) {
    if (pageCount <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    if (pageCount <= 7) {
        for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
        pages.push(1);
        if (pageIndex > 3) pages.push("ellipsis");
        for (let i = Math.max(2, pageIndex); i <= Math.min(pageCount - 1, pageIndex + 2); i++) pages.push(i);
        if (pageIndex < pageCount - 2) pages.push("ellipsis");
        pages.push(pageCount);
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        text=""
                        aria-disabled={pageIndex <= 1}
                        className={pageIndex <= 1 ? "pointer-events-none opacity-40" : ""}
                        onClick={(event) => {
                            event.preventDefault();
                            if (pageIndex > 1) onPageChange(pageIndex - 1);
                        }}
                    />
                </PaginationItem>

                {pages.map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                            <PaginationEllipsis/>
                        ) : (
                            <PaginationLink
                                isActive={page === pageIndex}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onPageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        text=""
                        aria-disabled={pageIndex >= pageCount}
                        className={pageIndex >= pageCount ? "pointer-events-none opacity-40" : ""}
                        onClick={(event) => {
                            event.preventDefault();
                            if (pageIndex < pageCount) onPageChange(pageIndex + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

function NotificationsList({category}: { category: NotificationCategory }) {
    const {data, isLoading, isFetching, pageCount, pagination, setPagination, refetch} = useNotifications(category, {
    });
    const queryClient = useQueryClient();

    const markAsRead = async (notification: NotificationInterface) => {
        try {
            await NotificationsApiService.markAsRead(notification.id);
            await queryClient.invalidateQueries({queryKey: ['notifications']});
        } catch (error: any) {
            toast.error("Impossible de marquer la notification comme lue");
        }
    };

    if (isLoading && data.length === 0) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-full"/>
            </div>
        );
    }

    if (!isLoading && data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Empty>
                    <EmptyMedia>
                        <InboxIcon size={80} strokeWidth={1}/>
                    </EmptyMedia>
                    <EmptyTitle>Aucune notification</EmptyTitle>
                    <EmptyDescription>Les
                        notifications {category === "user" ? "de l'utilisateur" : "de l'organisation"} s'afficheront
                        ici</EmptyDescription>
                    <EmptyContent>
                        <Button variant="outline" onClick={() => refetch()}>
                            <RefreshCwIcon/>
                            Actualiser
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-2">
                <div className="flex flex-col divide-y divide-border/60">
                    {data.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                        />
                    ))}
                </div>
            </Card>

            <NotificationsPagination
                pageCount={pageCount}
                pageIndex={pagination.pageIndex + 1}
                onPageChange={(page) => setPagination({pageIndex: page - 1, pageSize: pagination.pageSize})}
            />

            {isFetching && (
                <p className="text-center text-xs text-muted-foreground">Mise à jour...</p>
            )}
        </div>
    );
}

export function NotificationsView() {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col p-6 gap-6">
                    <Activity.Container variant="enter">
                        <MainWrapper>

                            <Activity.Header>
                                <Activity.Title label="Notifications" description="Vos notifications et celles de votre organisation" icon={<BellIcon/>}/>
                            </Activity.Header>

                            <Tabs defaultValue="user">
                                <TabsList>
                                    <TabsTrigger value="user">Utilisateur</TabsTrigger>
                                    <TabsTrigger value="organization">Organisation</TabsTrigger>
                                </TabsList>

                                <div className="mt-4">
                                    <TabsContent value="user">
                                        <NotificationsList category="user"/>
                                    </TabsContent>
                                    <TabsContent value="organization">
                                        <NotificationsList category="organization"/>
                                    </TabsContent>
                                </div>
                            </Tabs>

                        </MainWrapper>
                    </Activity.Container>
                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    )
}
