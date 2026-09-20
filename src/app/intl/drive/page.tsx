import {Suspense} from "react";
import PublicPosMenuView from "../../../../library/modules/pos-management/presentation/views/public-pos-menu.view";

export default function PublicPosMenuPage() {
    return (
        <Suspense fallback={null}>
            <PublicPosMenuView/>
        </Suspense>
    );
}
