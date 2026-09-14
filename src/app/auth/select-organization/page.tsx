import {Suspense} from "react";
import {AuthSelectOrganizationView} from "@/modules/auth/presentation/auth-select-organization.view";

export default function SelectOrganizationPage() {
    return (
        <Suspense fallback={null}>
            <AuthSelectOrganizationView/>
        </Suspense>
    );
}
