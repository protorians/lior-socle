"use client"

import UsersModule from "@/modules/identity";
import DashboardModule from "@/modules/dashboard";
import AccessControlModule from "@/modules/access-control";
import BillingModule from "../external_modules/billing";
import BloggingModule from "../external_modules/blogging";
import CrmModule from "../external_modules/crm";
import NotificationsModule from "@/modules/notification";
import OrganizationsModule from "@/modules/organization";
import ProjectManagementModule from "../external_modules/project-management";
import RestaurantModule from "../external_modules/restaurant";
import StockModule from "../external_modules/stock-management";
import CloudModule from "@/modules/media-library";
import PosModule from "../external_modules/pos-management";
import {useEffect} from "react";
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import usersActivitiesModule from "@/modules/user-activity";
import accountModule from "@/modules/account";
import AccountingModule from "../external_modules/accounting";
import MessengerModule from "../external_modules/messenger";
import CalendarModule from "../external_modules/calendar";
import CustomerModule from "../external_modules/customer";
import storeModule from "@/modules/modules-management";

export function ModulesDefinition() {
    const {addModules, modules} = useModuleStore()

    useEffect(() => {
        const fn = () => {
            addModules([
                DashboardModule,
                OrganizationsModule,
                MessengerModule,
                AccessControlModule,
                UsersModule,
                usersActivitiesModule,
                accountModule,
                AccountingModule,
                BillingModule,
                BloggingModule,
                CrmModule,
                RestaurantModule,
                NotificationsModule,
                ProjectManagementModule,
                StockModule,
                CloudModule,
                PosModule,
                CalendarModule,
                CustomerModule,
                storeModule,
            ])
        }
        const timer = setTimeout(fn, 1000)
        return () => clearTimeout(timer)
    }, [])

    return null;
}