import {
    FileArchiveIcon,
    FileAudioIcon,
    FileCodeIcon,
    FileIcon,
    FileImageIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FileVideoIcon,
    LucideProps,
} from "lucide-react";
import {MediaLabelService} from "@sentients/sdk/infrastructure/utilities/media-label.service";

function extensionOf(filename?: string): string {
    return (filename?.split(".").pop() ?? "").toLowerCase();
}

function documentIconFor(mime: string, extension: string) {
    const ext = extension.toLowerCase();
    const type = (mime || "").toLowerCase();

    if (type.includes("zip") || type.includes("compress") || type.includes("rar") || type.includes("tar") || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return FileArchiveIcon;
    }
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv") || ["xls", "xlsx", "csv"].includes(ext)) {
        return FileSpreadsheetIcon;
    }
    if (type.includes("json") || type.includes("xml") || type.includes("html") || type.includes("javascript") || ["js", "ts", "json", "xml", "html", "css", "py", "sh"].includes(ext)) {
        return FileCodeIcon;
    }
    return FileTextIcon;
}

export function CloudMediaIcon({mime, filename, ...props}: { mime?: string; filename?: string } & LucideProps) {
    const extension = extensionOf(filename);
    const section = MediaLabelService.sectionFor({mime: mime ?? "", extension});

    const Icon = (() => {
        switch (section) {
            case "image":
                return FileImageIcon;
            case "video":
                return FileVideoIcon;
            case "audio":
                return FileAudioIcon;
            case "document":
                return documentIconFor(mime ?? "", extension);
            default:
                return FileIcon;
        }
    })();

    return <Icon {...props}/>;
}
