"use client"

import {Suspense} from "react";
import {useSearchParams} from "next/navigation";
import {ModuleStoreDetailView} from "@/modules/modules-management/presentation/views/modules-management-detail.view";

function ModuleDetailRouter() {
    const searchParams = useSearchParams();
    const moduleId = searchParams.get("id");

    return <ModuleStoreDetailView moduleId={moduleId}/>;
}

export default function ModuleDetailPage() {
    return (
        <Suspense fallback={null}>
            <ModuleDetailRouter/>
        </Suspense>
    );
}