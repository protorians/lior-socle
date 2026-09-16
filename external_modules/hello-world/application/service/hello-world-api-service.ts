import {ApiService} from "@sentients/sdk/infrastructure/utilities/api-service";
import {FetchResponseWithMetaInterface} from "@sentients/sdk/domain/typing/response";
import {
    CreateHelloWorldInterface,
    HelloWorldAnalyticsInterface,
    HelloWorldInterface,
    UpdateHelloWorldInterface,
} from "../../domain/hello-world.interface";

export class HelloWorldApiService extends ApiService {
    static async getAll(options?: Record<string, any>) {
        return await this.get<FetchResponseWithMetaInterface<HelloWorldInterface[]>>('/hello-world/', options);
    }

    static async getById(id: string) {
        return await this.get<FetchResponseWithMetaInterface<HelloWorldInterface>>(`/hello-world/${id}`);
    }

    static async create(payload: CreateHelloWorldInterface) {
        return await this.post<FetchResponseWithMetaInterface<HelloWorldInterface>>('/hello-world/', payload);
    }

    static async update(id: string, payload: UpdateHelloWorldInterface) {
        return await this.put<FetchResponseWithMetaInterface<HelloWorldInterface>>(`/hello-world/${id}`, payload);
    }

    static async archive(id: string) {
        return await this.delete<FetchResponseWithMetaInterface<HelloWorldInterface>>(`/hello-world/${id}`);
    }

    static async getAnalytics(options?: Record<string, any>) {
        return await this.get<FetchResponseWithMetaInterface<HelloWorldAnalyticsInterface>>('/hello-world/analytics', options);
    }
}