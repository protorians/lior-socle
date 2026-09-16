"use client"

import * as React from "react";
import {useModuleStore} from "@sentients/sdk/infrastructure/stores/module.store";
import {routines} from "@sentients/sdk/infrastructure/routines/routine.hook";
import {helloWorldAnalyticsRoutine} from "../../infrastructure/routines/hello-world-analytics.routine";

/**
 * Exemple de provider de layout fourni par un module.
 *
 * Déclaré via `providers.layout` dans `index.tsx`, il est rendu dynamiquement
 * par <ModulesLayoutProviders/> dans `src/app/layout.tsx`.
 *
 * Il maintient la routine « hello world analytics » active tant que le module
 * est chargé (déclaré) et activé (isEnabled: true). C'est le point d'accroche
 * idéal pour brancher des comportements globaux liés au module : notifications,
 * synchronisation temps réel, raccourcis clavier, etc.
 */
export function HelloWorldHeaderProvider() {
    const helloWorldEnabled = useModuleStore(
        (state) => state.modules.find((module) => module.identifier === "mod.sentients.helloworld")?.isEnabled ?? false,
    );

    React.useEffect(() => {
        if (!helloWorldEnabled) {
            routines.remove(helloWorldAnalyticsRoutine.id);
            return;
        }

        // La routine est persistante : elle survit aux changements de module.
        // On s'assure qu'elle est bien en file et que la boucle globale tourne.
        if (!routines.exists(helloWorldAnalyticsRoutine.id)) {
            routines.enqueue(helloWorldAnalyticsRoutine);
        }
        routines.start(helloWorldAnalyticsRoutine.id);
        routines.run().catch(() => {
            // échec silencieux : onFail de la routine gère l'état
        });
    }, [helloWorldEnabled]);

    return null;
}