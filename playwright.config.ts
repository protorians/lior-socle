import {defineConfig, devices} from "@playwright/test";

/**
 * S-032 — Tests E2E du module CRM (frontend `sentient-manager`).
 *
 * Le serveur Web (`next dev`) est lancé automatiquement sur le port 5010.
 * Les spécifications se connectent à l'application avec une session injectée
 * (cookie `token` + session localStorage) et interceptent les appels à l'API
 * backend (`http://localhost:5711/api`) via des mocks de route : aucun serveur
 * backend ni base de données n'est requis.
 */
export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    expect: {timeout: 15_000},
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        baseURL: "http://localhost:5010",
        trace: "on-first-retry",
        locale: "fr-FR",
    },
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"]},
        },
    ],
    webServer: {
        command: "bun run dev",
        url: "http://localhost:5010",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
    },
});
