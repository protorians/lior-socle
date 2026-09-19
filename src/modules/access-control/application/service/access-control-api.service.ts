import {ApiService} from "@liorian/sdk/infrastructure/utilities/api-service";
import {FetchResponseInterface} from "@liorian/sdk/domain/typing/response";
import {RolesSummaryType} from "@/modules/access-control/domain/entities/roles.interface";

export class AccessControlApiService extends ApiService {
    // Roles
    static async createCustomRole(payload: any) {
        return await this.post('/access-control/roles/custom', payload);
    }

    static async createRoleFromConfig(payload: any) {
        return await this.post('/access-control/roles/from-config', payload);
    }

    static async getRoleById(id: string) {
        return await this.get(`/access-control/roles/${id}`);
    }

    static async updateRole(id: string, payload: any) {
        return await this.put(`/access-control/roles/${id}`, payload);
    }

    static async deleteRole(id: string) {
        return await this.delete(`/access-control/roles/${id}`);
    }

    static async getRolesByOrg(orgId: string) {
        return await this.get(`/access-control/organizations/${orgId}/roles`);
    }

    // Assignments
    static async assignRole(payload: any) {
        return await this.post('/access-control/assignments', payload);
    }

    static async removeAssignment(payload: any) {
        return await this.delete('/access-control/assignments', payload);
    }

    static async getUserRolesInOrg(userId: string, orgId: string) {
        return await this.get(`/access-control/users/${userId}/organizations/${orgId}/roles`);
    }

    // Initialization
    static async initializeDefaults(orgId: string) {
        return await this.post(`/access-control/organizations/${orgId}/initialize-defaults`);
    }

    // Defaults
    static async getDefaultsList() {
        return await this.get('/access-control/defaults/list');
    }

    static async getDefaultsInfo() {
        return await this.get('/access-control/defaults/info');
    }

    static async getDefaultRole(roleName: string) {
        return await this.get(`/access-control/defaults/${roleName}`);
    }

    // Domains
    static async getDomainsList() {
        return await this.get('/access-control/domains/list');
    }

    static async getRolesByDomain(domain: string) {
        return await this.get(`/access-control/domains/${domain}/roles`);
    }

    // Comparison & Summary
    static async compareRoles() {
        return await this.get('/access-control/compare');
    }

    static async getSummary() {
        return await this.get<FetchResponseInterface<RolesSummaryType>>('/access-control/summary');
    }

    // Permissions
    static async hasPermission(userId: string, orgId: string, permission: string) {
        return await this.get(`/access-control/users/${userId}/organizations/${orgId}/has-permission`, { permission });
    }

    static async getDomainAccess(userId: string, orgId: string) {
        return await this.get(`/access-control/users/${userId}/organizations/${orgId}/domain-access`);
    }
}
