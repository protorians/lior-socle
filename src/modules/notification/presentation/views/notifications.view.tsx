"use client"

import {useQueryClient} from "@tanstack/react-query";
import {BellIcon, InboxIcon, RefreshCwIcon} from "lucide-react";
import {toast} from "sonner";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Button} from "@sentients/sdk/presentation/ui/button";
import {Card} from "@sentients/sdk/presentation/ui/card";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@sentients/sdk/presentation/ui/empty";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@sentients/sdk/presentation/ui/pagination";
import {Skeleton} from "@sentients/sdk/presentation/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@sentients/sdk/presentation/ui/tabs";
import {NotificationItem} from "@sentients/sdk/presentation/components/notification-item";
import {NotificationCategory, useNotifications} from "@sentients/sdk/infrastructure/hooks/use-notifications";
import {NotificationsApiService} from "@sentients/sdk/application/service/notifications-api-service";
import {NotificationInterface} from "@sentients/sdk/domain/entities/notification.interface";
import {MainWrapper} from "@sentients/sdk/presentation/themes/katon/main-wrapper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";

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
                <Skeleton className="h-16 w-full"/>
                <Skeleton className="h-16 w-full"/>
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
            <Wrapper>
                <Header/>
                <Main className="flex flex-col p-6 gap-6">
                    <AnimatedContent variant="enter">
                        <MainWrapper>

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden items-center gap-3">
                                <span
                                    className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <BellIcon/>
                                </span>
                                    <div>
                                        <h1 className="text-2xl font-bold truncate text-ellipsis">Notifications</h1>
                                        <p className="text-sm text-muted-foreground">Vos notifications et celles de votre
                                            organisation</p>
                                    </div>
                                </div>
                            </div>

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
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
