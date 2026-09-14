"use client"

import {LoginForm} from "@/modules/auth/presentation/components/login-form";
import {authUserConnectedStore} from "@sentients/sdk/infrastructure/stores/auth-user-connected.store";
import {AuthSessionView} from "@/modules/auth/presentation/auth-session.view";
import {ThemeLogo} from "@sentients/sdk/presentation/system/logo.theme";
import {AppConfig} from "@sentients/sdk/domain/config/app.config";
import {FormScreen} from "@sentients/sdk/presentation/form-screen";
import {Fragment, useEffect, useState} from "react";
import {AuthApiService} from "@sentients/sdk/application/service/auth-api-service";

export function AuthLoginView() {
    const [pending, setPending] = useState<boolean>(false)

    useEffect(() => {
        setPending(true)
        AuthApiService.fetchAvailableSessions()
            .then(data => {
                console.log('fetchAvailableSessions', data)
            })
            .catch(err => {
                console.error(err)
            })
            .finally(() => setPending(false))
    }, [])

    if (pending) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <AuthSessionView/>
            </div>
        )
    }

    return (
        <Fragment>
            <FormScreen hideSideImage={true} className={"max-w-3xl w-full mx-auto"}>
                <LoginForm/>
            </FormScreen>
        </Fragment>
    )
}
