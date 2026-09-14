"use client"

import {SearchIcon} from "lucide-react";
import {Input} from "@sentients/sdk/presentation/ui/input";

interface ModuleStoreSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export function ModuleStoreSearch({value, onChange}: ModuleStoreSearchProps) {
    return (
        <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"/>
            <Input
                className="h-12 rounded-2xl pl-12 pr-4 text-base shadow-sm"
                placeholder="Rechercher des applications et services..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}