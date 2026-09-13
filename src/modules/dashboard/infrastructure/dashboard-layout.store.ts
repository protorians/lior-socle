"use client"

import {create} from "zustand";
import {toast} from "sonner";
import {ModuleDeclarationInterface} from "@sentients/sdk/domain/entities/module.interface";
import {
    createWidgetId,
    DashboardLayoutConfig,
    DashboardWidgetEntry
} from "@/modules/dashboard/domain/dashboard-layout.interface";
import {DashboardLayoutService} from "@/modules/dashboard/infrastructure/dashboard-layout.service";

interface DashboardLayoutState {
    widgets: DashboardWidgetEntry[]
    isLoaded: boolean
    isSaving: boolean
    isAddPanelOpen: boolean
    _saveTimeout: ReturnType<typeof setTimeout> | null

    hydrate: (userId: string, modules: ModuleDeclarationInterface[]) => Promise<void>
    addWidget: (moduleId: string, widgetKey: string, userId: string) => void
    removeWidget: (id: string, userId: string) => void
    toggleWidget: (id: string, userId: string) => void
    reorderWidgets: (movedId: string, overId: string, userId: string) => void
    hasWidget: (moduleId: string, widgetKey: string) => boolean
    isHiddenWidget: (moduleId: string, widgetKey: string) => boolean
    openAddPanel: () => void
    closeAddPanel: () => void
}

function buildConfig(widgets: DashboardWidgetEntry[]): DashboardLayoutConfig {
    return {version: 1, widgets};
}

const DEFAULT_USER_MODULE_ID = 'mod.sentients.identity';

function initFromModules(modules: ModuleDeclarationInterface[]): DashboardWidgetEntry[] {
    const entries: DashboardWidgetEntry[] = [];
    let order = 0;
    for (const mod of modules) {
        if (!mod.isEnabled || typeof mod.widgets !== 'object' || !mod.widgets) continue;
        for (const widgetKey of Object.keys(mod.widgets)) {
            entries.push({
                identifier: createWidgetId(mod.identifier, widgetKey),
                moduleId: mod.identifier,
                widgetKey,
                order: order++,
                enabled: true,
            });
        }
    }
    return entries;
}

function initDefaultFromModules(modules: ModuleDeclarationInterface[]): DashboardWidgetEntry[] {
    const mod = modules.find(m => m.identifier === DEFAULT_USER_MODULE_ID);
    if (!mod || !mod.isEnabled || typeof mod.widgets !== 'object' || !mod.widgets) return [];
    return Object.keys(mod.widgets).map((widgetKey, index) => ({
        identifier: createWidgetId(mod.identifier, widgetKey),
        moduleId: mod.identifier,
        widgetKey,
        order: index,
        enabled: true,
    }));
}

export const useDashboardLayoutStore = create<DashboardLayoutState>()((setState, getState) => ({
    widgets: [],
    isLoaded: false,
    isSaving: false,
    isAddPanelOpen: false,
    _saveTimeout: null,

    hydrate: async (userId, modules) => {
        const existing = await DashboardLayoutService.getLayout(userId);
        if (existing && existing.widgets.length > 0) {
            const allAvailable = initFromModules(modules);
            const savedIds = new Set(existing.widgets.map(w => w.identifier));
            const newWidgets = allAvailable
                .filter(w => !savedIds.has(w.identifier))
                .map(w => ({...w, enabled: false}));
            const merged: DashboardWidgetEntry[] = [
                ...existing.widgets,
                ...newWidgets,
            ];
            setState({widgets: merged, isLoaded: true});
        } else {
            setState({widgets: initDefaultFromModules(modules), isLoaded: true});
        }
    },

    addWidget: (moduleId, widgetKey, userId) => {
        const id = createWidgetId(moduleId, widgetKey);
        const {widgets} = getState();
        const existing = widgets.find(w => w.identifier === id);
        if (existing) {
            if (existing.enabled) return;
            const updated = widgets.map(w =>
                w.identifier === id ? {...w, enabled: true} : w
            );
            setState({widgets: updated});
            scheduleSave(userId, updated, getState);
            return;
        }
        const maxOrder = widgets.reduce((max, w) => Math.max(max, w.order), -1);
        const updated = [...widgets, {
            identifier: id,
            moduleId,
            widgetKey,
            order: maxOrder + 1,
            enabled: true,
        }];
        setState({widgets: updated});
        scheduleSave(userId, updated, getState);
    },

    removeWidget: (id, userId) => {
        const updated = getState().widgets.filter(w => w.identifier !== id);
        setState({widgets: updated});
        scheduleSave(userId, updated, getState);
    },

    toggleWidget: (id, userId) => {
        const updated = getState().widgets.map(w =>
            w.identifier === id ? {...w, enabled: !w.enabled} : w
        );
        setState({widgets: updated});
        scheduleSave(userId, updated, getState);
    },

    reorderWidgets: (movedId, overId, userId) => {
        const {widgets} = getState();
        const sorted = [...widgets].sort((a, b) => a.order - b.order);
        const enabled = sorted.filter(w => w.enabled);

        const movedIndex = enabled.findIndex(w => w.identifier === movedId);
        const overIndex = enabled.findIndex(w => w.identifier === overId);
        if (movedIndex === -1 || overIndex === -1) return;

        const [moved] = enabled.splice(movedIndex, 1);
        enabled.splice(overIndex, 0, moved);

        const enabledById = new Map(enabled.map(w => [w.identifier, w]));
        const updated = sorted.map(w => {
            if (!w.enabled) return w;
            const reordered = enabledById.get(w.identifier);
            if (reordered) return reordered;
            return w;
        }).map((w, i) => ({...w, order: i}));

        setState({widgets: updated});
        scheduleSave(userId, updated, getState);
    },

    hasWidget: (moduleId, widgetKey) => {
        return getState().widgets.some(w => w.moduleId === moduleId && w.widgetKey === widgetKey);
    },

    isHiddenWidget: (moduleId, widgetKey) => {
        const widget = getState().widgets.find(w => w.moduleId === moduleId && w.widgetKey === widgetKey);
        return !!widget && !widget.enabled;
    },

    openAddPanel: () => setState({isAddPanelOpen: true}),
    closeAddPanel: () => setState({isAddPanelOpen: false}),
}));

function scheduleSave(
    userId: string,
    widgets: DashboardWidgetEntry[],
    getState: () => DashboardLayoutState
) {
    const prev = getState()._saveTimeout;
    if (prev) clearTimeout(prev);
    const timeout = setTimeout(async () => {
        useDashboardLayoutStore.setState({isSaving: true});
        try {
            await DashboardLayoutService.saveLayout(userId, buildConfig(widgets));
        } catch {
            toast.error("Impossible de sauvegarder la personnalisation du tableau de bord");
        } finally {
            useDashboardLayoutStore.setState({isSaving: false, _saveTimeout: null});
        }
    }, 600);
    useDashboardLayoutStore.setState({_saveTimeout: timeout});
}
