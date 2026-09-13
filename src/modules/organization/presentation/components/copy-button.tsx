'use client';

import * as React from 'react';
import {Button} from '@sentients/sdk/presentation/ui/button';
import {toast} from 'sonner';
import {CheckIcon, CopyIcon} from 'lucide-react';

export function CopyButton({value, label}: { value: string; label?: string }) {
    const [copied, setCopied] = React.useState(false);

    const copy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopied(true);
        toast.success(label || 'Copié dans le presse-papiers');
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={copy}
        >
            {copied ? <CheckIcon className="size-3.5 text-emerald-500"/> : <CopyIcon className="size-3.5"/>}
        </Button>
    );
}
