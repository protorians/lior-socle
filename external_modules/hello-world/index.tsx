import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {HelloWorldApiService} from "./application/service/hello-world-api-service";
import {HelloWorldWidget} from "./presentation/widgets/hello-world.widget";
import {HelloWorldHeaderProvider} from "./presentation/providers/hello-world-header.provider";
import {helloWorldAnalyticsRoutine} from "./infrastructure/routines/hello-world-analytics.routine";

const helloWorldModule: ModuleDeclarationInterface = {
    identifier: 'mod.sentients.helloworld',
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
    requirements: {
        'organization': '>=1.0.0',
        'identity': '>=1.0.0',
    },
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
dependencies: {
        '@sentients/sdk': '^0.19.0',
        '@tanstack/react-query': '^5.101.2',
        '@tanstack/react-table': '^8.21.3',
        'date-fns': '^4.4.0',
        'lucide-react': '^1.21.0',
        'next': '^16.0.0',
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        'sonner': '^2.0.7',
    },
    devDependencies: {
        '@types/node': '^25.9.3',
        '@types/react': '^19.2.17',
        '@types/react-dom': '^19.2.3',
        'typescript': '^6.0.3',
    },
}

export default helloWorldModule