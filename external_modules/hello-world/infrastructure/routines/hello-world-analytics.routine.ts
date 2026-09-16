import {Routine} from "@sentients/sdk/infrastructure/routines/routine";
import {HelloWorldApiService} from "../../application/service/hello-world-api-service";
import {HelloWorldAnalyticsInterface} from "../../domain/hello-world.interface";

export class HelloWorldAnalyticsRoutine extends Routine<HelloWorldAnalyticsInterface> {

    constructor() {
        super('hello-world.analytics', {
            icon: 'WandSparkles',
            name: 'Service Analytique Hello World en temps réel'
        });
    }

    async job(): Promise<HelloWorldAnalyticsInterface | undefined> {
        return new Promise(async (resolve) => {
            const response = await HelloWorldApiService.getAnalytics({
                granularity: this.granularity,
            });
            if (
                (!response) ||
                (!response.data) ||
                (!response.data.data)
            ) throw new Error('Impossible de charger les données analytiques du module Hello World');
            resolve(response.data.data);
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }

}

export const helloWorldAnalyticsRoutine = new HelloWorldAnalyticsRoutine();