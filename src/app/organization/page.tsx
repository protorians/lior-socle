"use client"

import {Suspense} from "react";
import {useSearchParams} from "next/navigation";
import {OrganizationsView} from "@/modules/organization/presentation/views/organizations.view";
import {OrganizationDetailsView} from "@/modules/organization/presentation/views/organization-details.view";

function OrganizationsRouter() {
    const searchParams = useSearchParams();
    const organizationId = searchParams.get("id");

    if (organizationId) {
        return <OrganizationDetailsView organizationId={organizationId}/>;
    }

    return <OrganizationsView/>;
}

export default function OrganizationsPage() {
    return (
        <Suspense fallback={null}>
            <OrganizationsRouter/>
        </Suspense>
    );
}
