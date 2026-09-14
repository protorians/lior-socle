"use client"

import React from "react";
import {SettingsLayout} from "../../../../external_modules/pos-management/presentation/components/settings-layout";

export default function PosSettingsLayout({children}: { children: React.ReactNode }) {
    return (
        <SettingsLayout>
            <SettingsLayout.Menu className={"flex flex-col gap-6"}>
                <div className="">
                    <h2>Paramètres</h2>
                </div>
                <SettingsLayout.MenuItem
                    href="/pos-management/settings/warehouses"
                    label="Dépôts"
                    icon="WarehouseIcon"
                />
                <SettingsLayout.MenuItem
                    href="/pos-management/settings/payment-methods"
                    label="Modes de paiement"
                    icon="CreditCardIcon"
                />
                <SettingsLayout.MenuItem
                    href="/pos-management/settings/register"
                    label="Caisse"
                    icon="ClockIcon"
                />
                <SettingsLayout.MenuItem
                    href="/pos-management/settings/accounting"
                    label="Comptabilité"
                    icon="ReceiptTextIcon"
                />
            </SettingsLayout.Menu>
            <SettingsLayout.Container>
                {children}
            </SettingsLayout.Container>
        </SettingsLayout>
    );
}
