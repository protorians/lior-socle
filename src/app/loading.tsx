import {ThemeLogo} from "@liorian/sdk/presentation/system/logo.theme";
import {Waiting} from "@liorian/sdk/presentation/components/waiting";
import {WaitingBar} from "@liorian/sdk/presentation/components/waiting-bar";

export default function Loading() {
    // return (
    //     <div className="fixed top-0 left-0 z-99999 flex w-screen h-screen items-center justify-center px-4 bg-background">
    //         <div className="text-center flex justify-center items-center flex-auto">
    //             <ThemeLogo variant="banner" color="black" onDark="white" className="mb-6"/>
    //         </div>
    //         <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-10">
    //             <Waiting label="Synchronisation des données"/>
    //         </div>
    //     </div>
    // )

    return (
        <div className="fixed top-0 left-0 z-99999 flex flex-col w-screen px-4 bg-primary">
            <WaitingBar/>
        </div>
    )
}