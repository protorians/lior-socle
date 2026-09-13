import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@sentients/sdk/presentation/ui/card";
import {Badge} from "@sentients/sdk/presentation/ui/badge";
import {TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import {Fragment, ReactNode} from "react";
import {StatisticalProps} from "@sentients/sdk/domain/typing/statisticals";
import {ListItems} from "@sentients/sdk/presentation/ui/list-items";


export interface SectionModuleDetailsProps {
    title?: ReactNode;
    statistical?: StatisticalProps;
    children?: ReactNode;
    footer?: ReactNode;
    items?: Record<string, ReactNode>;
    itemsHeader?: ReactNode;
    itemsFooter?: ReactNode;
}

export function SectionModuleDetails(
    {title, statistical, children, footer, items, itemsFooter, itemsHeader}: SectionModuleDetailsProps
) {
    return (
        <Card className="@container/card">
            <CardHeader>
                {title && (<CardDescription>{title}</CardDescription>)}
                {statistical && (
                    <Fragment>
                        {statistical.amount && (
                            <CardTitle
                                className="text-5xl font-semibold flex flex-row gap-2 py-2 items-center">
                                <span className={"text-xs"}>{statistical.devise || 'XOF'}</span>
                                {statistical.amount}
                            </CardTitle>
                        )}
                    </Fragment>
                )}
                {statistical?.trend && (
                    <div className={"flex flex-row gap-2"}>
                        <Badge variant="outline">
                            {statistical.trend > 0 ? <TrendingUpIcon/> : <TrendingDownIcon/>}
                            {statistical.trend}%
                        </Badge>
                        <div className="text-muted-foreground text-sm">{statistical.description}</div>
                    </div>
                )}
            </CardHeader>
            {children && (
                <div className="flex flex-col gap-2 py-6">
                    {children}
                </div>
            )}

            {items && (
                <ListItems
                    header={itemsHeader}
                    footer={itemsFooter}
                    items={items}
                />
            )}
            {footer && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {footer}
                </CardFooter>
            )}
        </Card>
    )
}