'use client';

import React, {useEffect, useRef, useState} from 'react';
import {CheckCircle2, FileText, ImageIcon, Trash2, Upload, X} from 'lucide-react';
import {Button} from '@sentients/sdk/presentation/ui/button';
import {Progress} from '@sentients/sdk/presentation/ui/progress';
import {StorageApiService} from '@sentients/sdk/application/service/storage-api-service';
import {AppConfig} from '@sentients/sdk/domain/config/app.config';
import type {MediaStorageInterface, MediaUploadOptions} from '@sentients/sdk/domain/entities/media';
import type {CreateUserInterface} from '@/modules/identity/domain/users.interface';
import {formatFileSize} from '@sentients/sdk/infrastructure/utilities/format.util';
import {MediaUploadField} from "@sentients/sdk/presentation/uploading/media-upload-field";
import {UserMediaFieldConfig, UserMediaFieldKey} from "@sentients/sdk/domain/typing/user-media-upload";

export const USER_MEDIA_FIELDS: UserMediaFieldConfig[] = [
    {key: 'avatar', label: 'Avatar', description: 'Photo de profil de l\'utilisateur', type: 'avatar'},
    {
        key: 'idRecto',
        label: 'Recto de la pièce d\'identité',
        description: 'Face avant de la pièce d\'identité',
        type: 'recto'
    },
    {
        key: 'idVerso',
        label: 'Verso de la pièce d\'identité',
        description: 'Face arrière de la pièce d\'identité',
        type: 'verso'
    },
    {
        key: 'selfie',
        label: 'Selfie',
        description: 'Photo de l\'utilisateur tenant sa pièce d\'identité',
        type: 'selfie'
    },
];

interface MediaUploadStepProps {
    data: Partial<CreateUserInterface>;
    updateData: (newData: Partial<CreateUserInterface>) => void;
}

export function MediaUploadStep({data, updateData}: MediaUploadStepProps) {
    const handleChange = (key: UserMediaFieldKey) => (media?: MediaStorageInterface) => {
        updateData({[key]: media});
    };

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                Ces documents sont optionnels. Vous pourrez les ajouter ultérieurement.
            </p>
            {USER_MEDIA_FIELDS.map((field) => (
                <MediaUploadField
                    moduleKey={'user'}
                    key={field.key}
                    field={field}
                    value={data[field.key] as MediaStorageInterface | undefined}
                    onChange={handleChange(field.key)}
                />
            ))}
        </div>
    );
}
