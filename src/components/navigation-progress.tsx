"use client"

import * as React from "react";
import {usePathname} from "next/navigation";
import {useIsFetching} from "@tanstack/react-query";
import {WaitingBar} from "@sentients/sdk/presentation/components/waiting-bar";
import {cn} from "@sentients/sdk/infrastructure/utilities/utils";

// Délai avant affichage : évite tout flash sur les navigations instantanées
const SHOW_DELAY_MS = 150;
// Filet de sécurité : la barre ne doit jamais rester bloquée à l'écran
const SAFETY_TIMEOUT_MS = 20_000;

/**
 Barre de progression de navigation globale, visible :
 - dès que l'utilisateur entame un changement de page (clic sur un lien
   interne ou navigation programmatique),
 - pendant que le serveur compile la page demandée (dev, compilation à la
   demande : le clic bloque jusqu'à la fin de compilation),
 puis masquée dès que la page cible est affichée.
 S'affiche aussi pendant les requêtes react-query en cours (comportement
 historique).
 */
export function NavigationProgress() {
    const isFetching = useIsFetching() > 0;

    const [navigating, setNavigating] = React.useState(false);
    const pathname = usePathname();

    const targetRef = React.useRef<string | null>(null);
    const showTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const safetyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const finish = React.useCallback(() => {
        if (showTimerRef.current) clearTimeout(showTimerRef.current);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        showTimerRef.current = null;
        safetyTimerRef.current = null;
        targetRef.current = null;
        setNavigating(false);
    }, []);

    React.useEffect(() => {
        const currentPath = () => window.location.pathname + window.location.search;

        const startNavigation = (path: string) => {
            if (path === currentPath()) return;
            targetRef.current = path;
            if (showTimerRef.current) clearTimeout(showTimerRef.current);
            showTimerRef.current = setTimeout(() => setNavigating(true), SHOW_DELAY_MS);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = setTimeout(finish, SAFETY_TIMEOUT_MS);
        };

        // 1. Clic sur un lien interne : signal immédiat, y compris pendant que
        //    le serveur compile la page suivante (aucun événement routeur tant
        //    que la compilation/RSC n'est pas prête).
        const onClickCapture = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = (event.target as Element | null)?.closest?.("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#")) return;
            if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
            let url: URL;
            try {
                url = new URL(anchor.href, window.location.href);
            } catch {
                return;
            }
            if (url.origin !== window.location.origin) return;
            startNavigation(url.pathname + url.search);
        };

        // 2. Navigations programmatiques (router.push…) : le routeur passe par
        //    l'History API au moment où il confirme la navigation.
        const wrap = (key: "pushState" | "replaceState") => {
            const original = window.history[key].bind(window.history);
            (window.history as any)[key] = (data: unknown, unused: string, url?: string | URL | null) => {
                try {
                    if (url != null) {
                        const parsed = new URL(String(url), window.location.href);
                        if (parsed.origin === window.location.origin) {
                            startNavigation(parsed.pathname + parsed.search);
                        }
                    }
                } catch {
                    // URL non parsable : ignorer silencieusement
                }
                const result = original(data, unused, url as never);
                // Navigation confirmée : masque dès que la cible est atteinte
                if (targetRef.current && currentPath() === targetRef.current) {
                    setTimeout(finish, 0);
                }
                return result;
            };
            return original;
        };

        const originalPush = wrap("pushState");
        const originalReplace = wrap("replaceState");

        document.addEventListener("click", onClickCapture, true);
        return () => {
            document.removeEventListener("click", onClickCapture, true);
            window.history.pushState = originalPush;
            window.history.replaceState = originalReplace;
            if (showTimerRef.current) clearTimeout(showTimerRef.current);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [finish]);

    // Filet complémentaire : la page cible est rendue (changement de route
    // détecté par le routeur) alors que le push n'aurait pas suffi.
    React.useEffect(() => {
        if (targetRef.current && window.location.pathname + window.location.search === targetRef.current) {
            finish();
        }
    }, [pathname, finish]);

    const visible = navigating || isFetching;

    return (
        <div
            aria-hidden={!visible}
            className={cn(
                "fixed top-0 left-0 right-0 z-9999 transition-opacity duration-300",
                visible ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
        >
            <WaitingBar/>
        </div>
    );
}
