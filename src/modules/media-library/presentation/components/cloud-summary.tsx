"use client"

import {useMemo} from "react";
import {AnalyticsSection} from "@liorian/sdk/presentation/analytics-section";
import {MediaLabelService} from "@liorian/sdk/infrastructure/utilities/media-label.service";
import {formatFileSize} from "@liorian/sdk/infrastructure/utilities/format.util";
import {MediaLibraryInterface} from "@/modules/media-library/domain/cloud.interface";

export interface CloudSummaryProps {
    data: MediaLibraryInterface[];
    total?: number;
}

export function CloudSummary({data, total = 0}: CloudSummaryProps) {
    const stats = useMemo(() => {
        let size = 0;
        const sections = new Set<string>();

        for (const media of data) {
            size += media.metadata?.size ?? 0;
            const extension = media.filename?.split(".").pop() ?? "";
            sections.add(MediaLabelService.sectionFor({mime: media.type, extension}));
        }

        return {size, sectionCount: sections.size};
    }, [data]);

    return (
        <AnalyticsSection
            items={[
                {
                    label: 'Fichiers',
                    value: total,
                    title: <>Fichiers stockés</>,
                    description: <>Le nombre total de fichiers de l'organisation</>,
                },
                {
                    label: 'Affichés',
                    value: data.length,
                    title: <>Fichiers affichés</>,
                    description: <>Le nombre de fichiers sur la page actuelle</>,
                },
                {
                    label: 'Taille',
                    value: formatFileSize(stats.size),
                    title: <>Taille affichée</>,
                    description: <>La taille cumulée des fichiers de la page</>,
                },
                {
                    label: 'Catégories',
                    value: stats.sectionCount,
                    title: <>Catégories</>,
                    description: <>Le nombre de catégories représentées</>,
                },
            ]}
        />
    );
}
