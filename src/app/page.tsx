"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {AuthUserService} from "@liorian/sdk/application/service/auth-user.service";
import {AuthConfig} from "@liorian/sdk/domain/config/auth.config";
import {Activity} from "@liorian/sdk/presentation/components/activity";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        void (async () => {
            await AuthUserService.ready();
            if (AuthUserService.isAuthenticated()) {
                router.replace('/dashboard');
            } else {
                router.replace(AuthConfig.routes.login);
            }
        })();
    }, [router]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
            <Activity.Loader/>
        </div>
    );
}
