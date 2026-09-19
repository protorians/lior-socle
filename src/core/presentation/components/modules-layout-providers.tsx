"use client"

import {Fragment} from "react";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";

/**
 * Rends dynamiquement les providers de layout déclarés par les modules
 * (`providers.layout` dans la `ModuleDeclarationInterface`).
 *
 * Chaque provider est autonome : il décide lui-même, selon l'activation du
 * module (`isEnabled`, `storeState`), du comportement à adopter au montage.
 * Ce composant remplace l'ancienne déclaration statique de providers modules
 * dans `src/app/layout.tsx`.
 */
export function ModulesLayoutProviders() {
    const modules = useModuleStore((state) => state.modules);

    const providers = modules
        .filter((module) => !!module.providers?.layout)
        .map((module) => module.providers!.layout!);

    return (
        <Fragment>
            {providers.map((Provider, index) => (
                <Provider key={index}/>
            ))}
        </Fragment>
    );
}