import {ApiService} from "@sentients/sdk/infrastructure/utilities/api-service";

export class OrganizationDocumentTypesApiService extends ApiService {
    // Organization Document Types
    static async create(payload: any) {
        return await this.post('/organization-document-types/', payload);
    }

    static async getAll() {
        return await this.get('/organization-document-types/');
    }

    static async getById(id: string) {
        return await this.get(`/organization-document-types/${id}`);
    }

    static async update(id: string, payload: any) {
        return await this.put(`/organization-document-types/${id}`, payload);
    }

    static async deleteDocumentType(id: string) {
        return await this.delete(`/organization-document-types/${id}`);
    }
}
