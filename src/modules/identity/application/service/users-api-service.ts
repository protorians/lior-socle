import {ApiService} from "@liorian/sdk/infrastructure/utilities/api-service";
import {CreateUserInterface, UserAnalyticsInterface} from "@/modules/identity/domain/users.interface";
import {FetchResponseInterface, FetchResponseWithMetaInterface, PaginationWithSearchOptions} from "@liorian/sdk/domain/typing/response";
import {ActivitiesType} from "@liorian/sdk/domain/entities/activities.interface";
import {GetAllUsersFilterOptions, UserFilter, UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import type {MediaStorageInterface} from "@liorian/sdk/domain/entities/media";
import {CreateUserPayloadInterface} from "@/modules/identity/domain/payload.interface";

export class UsersApiService extends ApiService {
    // Users
    static async getAll(options?: GetAllUsersFilterOptions) {
        return await this.get<FetchResponseWithMetaInterface<UserInterface[]>>('/users/', options);
    }

    static async create(payload: CreateUserInterface & { organizationId: string }) {
        return await this.post<FetchResponseInterface<UserInterface>>('/users', payload);
    }

    static async getById(id: string) {
        return await this.get(`/users/${id}`);
    }

    static async update(id: string, payload: Omit<Partial<CreateUserInterface>, 'avatar'> & { avatar?: MediaStorageInterface | null }) {
        return await this.put<FetchResponseInterface<UserInterface>>(`/users/${id}`, payload);
    }

    static async findByContact(payload: CreateUserPayloadInterface) {
        return await this.post<FetchResponseInterface<UserInterface>>('/users/find-by-contact', payload);
    }

    static async updateUserStatus(id: string, payload: { status: string }) {
        return await this.patch(`/users/${id}/status`, payload);
    }

    static async getAnalytics(params?: { granularity?: string; startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.granularity) query.set('granularity', params.granularity);
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        const queryStr = query.toString();
        return await this.get<FetchResponseInterface<UserAnalyticsInterface>>(
            `/users/analytics${queryStr ? '?' + queryStr : ''}`
        );
    }

    // User Preferences
    static async createPreference(payload: any) {
        return await this.post('/user-preferences/', payload);
    }

    static async getAllPreferences() {
        return await this.get('/user-preferences/');
    }

    static async getPreferenceByUserId(userId: string) {
        return await this.get(`/user-preferences/user/${userId}`);
    }

    static async updatePreference(id: string, payload: any) {
        return await this.put(`/user-preferences/${id}`, payload);
    }

    static async deletePreference(id: string) {
        return await this.delete(`/user-preferences/${id}`);
    }

    // User Activities
    static async getAllActivities() {
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/');
    }

    static async getMyActivities() {
        return await this.get<FetchResponseInterface<ActivitiesType>>('/user-activities/me');
    }

    static async getActivityAnalytics(params?: { granularity?: string; startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.granularity) query.set('granularity', params.granularity);
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        const queryStr = query.toString();
        return await this.get(`/user-activities/analytics${queryStr ? '?' + queryStr : ''}`);
    }

    static async deleteUnique(id: string) {
        return await this.delete(`/users/${id}/delete`);
    }

    static async deleteMany(ids: string[]) {
        return await this.delete(`/users/deleteMany`, {
            ids: ids
        });
    }
}
