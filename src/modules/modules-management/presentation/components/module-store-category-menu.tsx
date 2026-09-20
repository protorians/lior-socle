"use client"

import {SettingsLayout} from "@/library/modules/pos-management/presentation/components/settings-layout";
import {
    ModuleCategory,
    MODULE_CATEGORY_LABELS,
    MODULE_CATEGORY_ICONS,
} from "@liorian/sdk/domain/enums/module-category.enum";

interface ModuleStoreCategoryMenuProps {
    categories: ModuleCategory[];
    active: ModuleCategory | 'ALL';
    onSelect: (category: ModuleCategory | 'ALL') => void;
}

export function ModuleStoreCategoryMenu({categories, active, onSelect}: ModuleStoreCategoryMenuProps) {
    return (
        <SettingsLayout.Menu className="flex flex-col gap-6">
            <SettingsLayout.MenuItem
                href="#apps"
                label="Tous"
                icon="LayoutGrid"
                active={active === 'ALL'}
                onClick={() => onSelect('ALL')}
            />
            {categories.map(category => (
                <SettingsLayout.MenuItem
                    key={category}
                    href="#apps"
                    label={MODULE_CATEGORY_LABELS[category]}
                    icon={MODULE_CATEGORY_ICONS[category]}
                    active={active === category}
                    onClick={() => onSelect(category)}
                />
            ))}
        </SettingsLayout.Menu>
    );
}