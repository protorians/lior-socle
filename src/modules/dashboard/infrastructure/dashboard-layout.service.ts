import {UserPreferencesApiService} from "@sentients/sdk/application/service/user-preferences-api.service";
import {
    DashboardLayoutConfig,
    DASHBOARD_LAYOUT_LABEL
} from "@/modules/dashboard/domain/dashboard-layout.interface";

export class DashboardLayoutService {

    static async getLayout(userId: string): Promise<DashboardLayoutConfig | null> {
        const raw = await UserPreferencesApiService.getValue(userId, DASHBOARD_LAYOUT_LABEL);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && Array.isArray(parsed.widgets)) {
                return parsed as DashboardLayoutConfig;
            }
        } catch {
        }
        return null;
    }

    static async saveLayout(userId: string, config: DashboardLayoutConfig): Promise<void> {
        await UserPreferencesApiService.setValue(userId, DASHBOARD_LAYOUT_LABEL, JSON.stringify(config));
    }

}
