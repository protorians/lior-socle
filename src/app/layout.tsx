import {Manrope} from "next/font/google";

import "./globals.css";
import {Toaster} from "@sentients/sdk/presentation/ui/sonner";
import {AuthProvider} from "@sentients/sdk/infrastructure/providers/auth.provider";
import {ModulesDefinition} from "@/modules";
import {QueryProvider} from "@sentients/sdk/infrastructure/providers/query.provider";
import {AuthGuard} from "@sentients/sdk/infrastructure/providers/auth-guard.provider";
import {PushNotificationsProvider} from "@sentients/sdk/presentation/components/push-notifications.provider";
import {ModulesSwitcherProvider} from "@sentients/sdk/infrastructure/providers/modules-switcher.provider";
import {ModulesRoutinesProvider} from "@sentients/sdk/infrastructure/providers/modules-routines.provider";
import {ModulesGuardProvider} from "@sentients/sdk/infrastructure/providers/modules-guard.provider";
import {ModuleUsageProvider} from "@sentients/sdk/infrastructure/providers/module-usage.provider";
import {ModulesLayoutProviders} from "@/core/presentation/components/modules-layout-providers";
import ModalPortal from "@sentients/sdk/presentation/modals/components/ModalPortal";
import {FloatingUpload} from "@sentients/sdk/presentation/components/floating-upload";
import {cn, ThemePreferColorSchemeProvider} from "@sentients/sdk";
import {TooltipProvider} from "@sentients/sdk/presentation/ui/tooltip";
import {NavigationProgress} from "@/components/navigation-progress";

const manrope = Manrope({subsets: ['latin'], variable: '--font-sans'});

export const metadata = {
    title: 'Sentient',
    description: 'CMS frontend for Sentient dashboard',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="fr" className={cn(manrope.variable, "")} suppressHydrationWarning>
        <head>
            <link rel="stylesheet" href="/assets/fonts/font-awesome/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/bold-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/regular-rounded/all.css"/>
            <link rel="stylesheet" href="/assets/fonts/uicons/solid-rounded/all.css"/>
            {/* Inline script to apply theme early to avoid flash */}
            <script
                dangerouslySetInnerHTML={{__html: `
                  (function() {
                    const STORAGE_KEY = '@theme-preferences';
                    try {
                      const raw = window.localStorage.getItem(STORAGE_KEY);
                      const cache = raw ? JSON.parse(raw) : {};
                      let themeName = cache.themeName || 'system';
                      let preferSystem = cache.preferSystem !== undefined ? cache.preferSystem : true;
                      let colorScheme = cache.colorScheme || 'light';
                      // resolve colorScheme if system
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if (themeName === 'system' && preferSystem) {
                        colorScheme = prefersDark ? 'dark' : 'light';
                      }
                      const element = document.documentElement;
                      // remove all theme classes
                      const themeNames = ['system', 'mokoto', 'flame', 'sky', 'orangecode'];
                      for (let i = 0; i < themeNames.length; i++) {
                        const t = themeNames[i];
                        element.classList.remove('theme-' + t);
                      }
                      // add theme class if not system
                      if (themeName !== 'system') {
                        element.classList.add('theme-' + themeName);
                      }
                      element.classList.remove('light', 'dark');
                      element.classList.add(colorScheme);
                    } catch (e) { console.warn('Failed to apply theme early', e); }
                  })();
                `}}
            />
        </head>
        <body>
        <AuthProvider>
            <QueryProvider>
                <NavigationProgress/>
                <ModulesDefinition/>
                <AuthGuard>
                    <ModulesSwitcherProvider/>
                    <ModulesRoutinesProvider/>
                    <ModuleUsageProvider/>
                    <ModulesLayoutProviders/>
                    <ModulesGuardProvider>
                        <ThemePreferColorSchemeProvider/>
                        <PushNotificationsProvider/>
                        <TooltipProvider>
                            {children}
                            <ModalPortal/>
                            <FloatingUpload/>
                        </TooltipProvider>
                    </ModulesGuardProvider>
                </AuthGuard>
                <Toaster/>
            </QueryProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
