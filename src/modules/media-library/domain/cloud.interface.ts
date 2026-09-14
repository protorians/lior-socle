export interface MediaLibraryInterface {
    id: string;
    filename: string;
    type: string;
    organizationId?: string;
    metadata?: Record<string, any>;
    status?: boolean;
    isDocument?: boolean;
    isPublic?: boolean;
    url?: string | null;
    label?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MediaPaginationMetaInterface {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}

export interface MediaListResultInterface {
    data: MediaLibraryInterface[];
    meta: MediaPaginationMetaInterface;
}

export type MediaSectionFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';
