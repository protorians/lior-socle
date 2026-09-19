"use client"

import {FormScreen} from "@liorian/sdk/presentation/form-screen";
import {SelectOrganizationForm} from "@/modules/auth/presentation/components/select-organization-form";

export function AuthSelectOrganizationView() {
    return (
        <FormScreen hideSideImage={true}>
            <SelectOrganizationForm/>
        </FormScreen>
    )
}
