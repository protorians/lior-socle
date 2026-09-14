"use client"

import {CloudIcon} from "lucide-react";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {MainWrapper} from "@sentients/sdk/presentation/themes/katon/main-wrapper";
import {AnimatedContent} from "@sentients/sdk/presentation/components/animated-content";
import {CloudUploadDropzone} from "@/modules/media-library/presentation/components/cloud-upload";
import {CloudMediaGrid} from "@/modules/media-library/presentation/components/cloud-media-grid";

export function CloudView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col p-6 gap-6">
                    <AnimatedContent variant="enter" >
                        <div className={"gap-6 flex flex-col"}>

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <CloudIcon/>
                                    </span>
                                    <div>
                                        <h1 className="text-2xl font-bold truncate text-ellipsis">Bibliothèque de fichiers</h1>
                                        <p className="text-sm text-muted-foreground">Stockez, organisez et partagez les fichiers de votre organisation</p>
                                    </div>
                                </div>
                            </div>

                            <CloudUploadDropzone/>

                            <CloudMediaGrid/>

                        </div>
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
