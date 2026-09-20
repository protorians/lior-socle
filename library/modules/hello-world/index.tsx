import {ModuleDeclarationInterface} from "@liorian/sdk/domain/entities/module.interface";
import {HelloWorldApiService} from "./application/service/hello-world-api-service";
import {HelloWorldWidget} from "./presentation/widgets/hello-world.widget";
import {HelloWorldHeaderProvider} from "./presentation/providers/hello-world-header.provider";
import {helloWorldAnalyticsRoutine} from "./infrastructure/routines/hello-world-analytics.routine";

const helloWorldModule: ModuleDeclarationInterface = {
    identifier: 'mod.liorian.helloworld',
    key: 'HELLO_WORLD',
    version: '1.0.0',
    name: 'Hello World',
    description: 'Module d\'exemple pour l\'onboarding des développeurs',
    icon: "WandSparklesIcon",
    logo: undefined,
    widgets: {
        analytics: HelloWorldWidget
    },
    service: {
        fetch: HelloWorldApiService
    },
    routines: [
        helloWorldAnalyticsRoutine
    ],
    uri: '/hello-world',
    isEnabled: true,
    isDefault: false,
    type: 'INTERNAL',
    category: 'SYSTEM',
    menu: {
        items: [
            {
                label: "Salutations",
                icon: "WandSparklesIcon",
                url: '/hello-world',
            },
        ]
    },
    providers: {
        layout: HelloWorldHeaderProvider
    },
}

export default helloWorldModule