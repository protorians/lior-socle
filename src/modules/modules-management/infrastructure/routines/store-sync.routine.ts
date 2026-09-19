import {Routine} from "@liorian/sdk/infrastructure/routines/routine";
import {ModuleActivationApiService} from "@liorian/sdk/application/service/module-activation-api.service";
import {authUserConnectedStore} from "@liorian/sdk/infrastructure/stores/auth-user-connected.store";
import {useModuleStore} from "@liorian/sdk/infrastructure/stores/module.store";
import {ModuleStoreSyncResultInterface} from "@liorian/sdk/domain/entities/module-activation.interface";
import {RoutineInterface} from "@liorian/sdk/domain/typing/routine.types";

export interface StoreSyncDataRoutine {
    syncedAt?: string;
    results?: ModuleStoreSyncResultInterface["modules"];
}

export class StoreSyncRoutine extends Routine<StoreSyncDataRoutine>
    implements RoutineInterface<StoreSyncDataRoutine> {

    persist = true;

    constructor() {
        super('store.sync', {
            icon: 'RefreshCw',
            name: 'Synchronisation du store',
        });
    }

    async job(): Promise<StoreSyncDataRoutine | undefined> {
        return new Promise(async (resolve) => {
            const organizationId = authUserConnectedStore.getState().currentOrganization?.id;
            const modules = useModuleStore.getState().modules;

            if (!organizationId || modules.length === 0) {
                resolve({syncedAt: new Date().toISOString(), results: []});
                return;
            }

            const response = await ModuleActivationApiService.syncModules(organizationId, {
                managerVersion: "1.0.0",
                modules: modules.map(m => ({
                    id: m.identifier,
                    version: m.version,
                    enabled: !!m.isEnabled,
                    type: m.type,
                })),
            });

            const results = response?.data?.data?.modules;
            if (!Array.isArray(results)) {
                resolve({syncedAt: new Date().toISOString(), results: []});
                return;
            }

            const {updateModuleState, setModuleInstalled} = useModuleStore.getState();
            const nextStates: Record<string, string> = {};
            results.forEach(r => {
                let state = r.status;
                if (state === 'active') {
                    state = r.revoked ? 'revoked' : (r.expired ? 'expired' : 'enabled');
                }
                if (r.updateRequired) state = 'incompatible';
                if (!r.platformSupported) state = 'platform_unsupported';
                if (r.updateAvailable) state = 'update_available';
                nextStates[r.id] = state;
            });

            Object.entries(nextStates).forEach(([id, state]) => {
                updateModuleState(id, state as any);
                setModuleInstalled(id, ['enabled', 'installed', 'update_available'].includes(state));
            });

            resolve({
                syncedAt: new Date().toISOString(),
                results,
            });
        })
    }

    onFail(error: Error) {
        this.setOption('icon', 'MessageCircleWarning')
    }
}

export const storeSyncRoutine = new StoreSyncRoutine();
