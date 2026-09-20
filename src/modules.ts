"use client"

import {externalModules} from "@/library/modules";
import UsersModule from "@/modules/identity";
import DashboardModule from "@/modules/dashboard";
import AccessControlModule from "@/modules/access-control";
import NotificationsModule from "@/modules/notification";
import OrganizationsModule from "@/modules/organization";
import CloudModule from "@/modules/media-library";
import usersActivitiesModule from "@/modules/user-activity";
import accountModule from "@/modules/account";
import storeModule from "@/modules/modules-management";
import {useEffect} from "react";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";

export function ModulesDefinition() {
    const {addModules} = useModuleStore()

    useEffect(() => {
        addModules([
            DashboardModule,
            OrganizationsModule,
            AccessControlModule,
            UsersModule,
            usersActivitiesModule,
            accountModule,
            NotificationsModule,
            CloudModule,
            storeModule,
            ...externalModules,
        ])
    }, [])

    return null;
}