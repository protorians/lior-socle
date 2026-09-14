"use client";

import {SettingsLayout} from "../../../../external_modules/pos-management/presentation/components/settings-layout";
import React from "react";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";

export default function OrganizationSettingsLayout({children}: { children: React.ReactNode }) {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row px-6 gap-6">
                    <div className="container mx-auto py-6">
                        <SettingsLayout>
                            <SettingsLayout.Menu className={"flex flex-col gap-6"}>
                                <SettingsLayout.MenuItem
                                    href="/organization/settings/general"
                                    label="Général"
                                    icon="SettingsIcon"
                                />
                                <SettingsLayout.MenuItem
                                    href="/organization/settings/preferences"
                                    label="Préférences"
                                    icon="SlidersHorizontalIcon"
                                />
                                {/*<SettingsLayout.MenuItem*/}
                                {/*    href="/organization/settings/themes"*/}
                                {/*    label="Thèmes"*/}
                                {/*    icon="PaletteIcon"*/}
                                {/*/>*/}
                                <SettingsLayout.MenuItem
                                    href="/organization/settings/document-types"
                                    label="Types de documents"
                                    icon="FileTextIcon"
                                />
                            </SettingsLayout.Menu>
                            <SettingsLayout.Container>
                                {children}
                            </SettingsLayout.Container>
                        </SettingsLayout>
                    </div>
                </Main>
            </Wrapper>
        </View>
    );
}
