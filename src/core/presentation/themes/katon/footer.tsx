import {cn} from "@sentients/sdk/infrastructure/utilities/utils";
import {AppConfig} from "@sentients/sdk/domain/config/app.config";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {EdgeSection} from "@sentients/sdk/presentation/themes/katon/edge-section";

export interface FooterProps {
    className?: string;
    children?: React.ReactNode;
    fixed?: boolean;
}

export function Footer({className, children, fixed = true}: FooterProps) {
    return (
        <footer className={cn(
            "",
            className,
            fixed
                ? "fixed bottom-0 left-0 w-screen flex flex-row items-center gap-4 px-4 pb-4 pt-6 z-3 backdrop-blur-xl mask-[linear-gradient(to_top,background_40%,transparent_100%)]"
                : "flex flex-row items-center gap-4 p-4"
        )}>
            <EdgeSection className={"py-1 p-3"}>
                <AutoBreadcrumb/>
            </EdgeSection>
            <div className="flex-auto flex flex-row justify-end items-center">
                {children}
            </div>
            <EdgeSection className="justify-end text-muted-foreground text-xs py-1 p-3">
                © {AppConfig.COPYRIGHT_YEAR} {AppConfig.APP_NAME}
            </EdgeSection>
        </footer>
    )
}