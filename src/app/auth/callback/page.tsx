"use client";

import {SsoCallbackView} from "@liorian/sdk/presentation/components/auth/sso-callback.view";

export default function SsoCallbackPage() {
    return <SsoCallbackView successRedirect="/dashboard"/>;
}