"use client"

import {useRef, useState} from "react";
import {CloudUploadIcon} from "lucide-react";
import {useUploadStore} from "@sentients/sdk/infrastructure/stores/upload.store";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";

export function CloudUploadDropzone() {
    const inputRef = useRef<HTMLInputElement>(null);
    const addFiles = useUploadStore((state) => state.addFiles);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = (fileList: FileList | File[] | null) => {
        if (!fileList || fileList.length === 0) return;
        addFiles(Array.from(fileList), {module: 'media-library'});
    };

    return (
        <div
            data-slot="cloud-upload-dropzone"
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30",
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
        >
            <CloudUploadIcon className="size-8 text-primary"/>
            <p className="text-sm font-medium">Glissez-déposez vos fichiers ici</p>
            <p className="text-xs text-muted-foreground">ou cliquez pour parcourir vos fichiers</p>
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
