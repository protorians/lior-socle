import {StorageApiService as CoreStorageApiService} from "@sentients/sdk/application/service/storage-api-service";
import {FetchResponseInterface} from "@sentients/sdk/domain/typing/response";
import {MediaListResultInterface, MediaLibraryInterface} from "@/modules/media-library/domain/cloud.interface";

export class CloudApiService extends CoreStorageApiService {

    static async getAll(options?: { limit?: number; page?: number }) {
        return await this.get<FetchResponseInterface<MediaListResultInterface>>('/storages/', options);
    }

    static async getMedia(id: string) {
        return await this.get<FetchResponseInterface<MediaLibraryInterface>>(`/storages/${id}`);
    }

    static async removeMedia(id: string) {
        return await this.delete(`/storages/${id}`);
    }
}
