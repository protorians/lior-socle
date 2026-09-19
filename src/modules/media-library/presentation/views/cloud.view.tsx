"use client"

import {CloudIcon} from "lucide-react";
import {View} from "@liorian/sdk/presentation/themes/katon/view";
import {AutoBreadcrumb} from "@/core/presentation/components/auto-breadcrumb";
import {MainWrapper} from "@liorian/sdk/presentation/themes/katon/main-wrapper";
import {Activity} from "@liorian/sdk/presentation/components/activity";
import {CloudUploadDropzone} from "@/modules/media-library/presentation/components/cloud-upload";
import {CloudMediaGrid} from "@/modules/media-library/presentation/components/cloud-media-grid";

export function CloudView() {
    return (
        <View>
            <View.Wrapper>
                <View.Helmet/>
                <View.Frame className="flex flex-col p-6 gap-6">
                    <Activity.Container variant="enter" >
                        <Activity.Content>
                            <Activity.Header>
                                <Activity.Title label="Bibliothèque de fichiers" description="Stockez, organisez et partagez les fichiers de votre organisation" icon={<CloudIcon/>}/>
                            </Activity.Header>

                            <CloudUploadDropzone/>

                            <CloudMediaGrid/>

                        </Activity.Content>
                    </Activity.Container>
                </View.Frame>
            </View.Wrapper>
            <View.Status breadcrumb={<AutoBreadcrumb/>}/>
        </View>
    )
}
