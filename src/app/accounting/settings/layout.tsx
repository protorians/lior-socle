"use client"

import React from "react";
import {SettingsLayout} from "../../../../external_modules/pos-management/presentation/components/settings-layout";

export default function AccountingSettingsLayout({children}: { children: React.ReactNode }) {
    return (
        <SettingsLayout>
            <SettingsLayout.Menu className={"flex flex-col gap-6"}>
                <div className="">
                    <h2>Paramètres</h2>
                </div>
                <SettingsLayout.MenuItem
                    href="/accounting/settings/general"
                    label="Général"
                    icon="Building2Icon"
                />
                <SettingsLayout.MenuItem
                    href="/accounting/settings/accounting"
                    label="Comptabilité"
                    icon="CalculatorIcon"
                />
                <SettingsLayout.MenuItem
                    href="/accounting/settings/default-accounts"
                    label="Comptes par défaut"
                    icon="LandmarkIcon"
                />
            </SettingsLayout.Menu>
            <SettingsLayout.Container>
                {children}
            </SettingsLayout.Container>
        </SettingsLayout>
    );
}
