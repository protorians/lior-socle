import {Page, expect} from "@playwright/test";

/**
 * S-032 — Helper d'authentification et de mock d'API pour les specs E2E CRM.
 *
 * Les routes `/crm/**` sont protégées (cookie `token` côté proxy + session
 * localStorage + sélection d'organisation). Pour tester le déroulé UI réel,
 * on pilote un vrai login : navigation vers la route cible → redirection vers
 * `/auth/sign-in` → soumission du formulaire → choix de l'organisation → retour
 * sur la route cible. Les appels à l'API backend (`http://localhost:5711/api`)
 * sont interceptés par des fixtures locales : aucun backend ni base de données
 * n'est requis.
 *
 * Un seul handler par route de secours (`/crm/**` et endpoints d'auth) est
 * enregistré, et la réponse est dispatchée selon le pathname de la requête.
 * Cela évite toute ambiguïté de précédence entre patterns Playwright exacts et
 * globs.
 */

const API_ORIGIN = "http://localhost:5711/api";

export interface MockedApiSpec {
    data: unknown;
    statusCode?: number;
    message?: string;
}

const IDENTIFIER = "jean@acme.fr";
const PASSWORD = "e2e-password";
const ORG_NAME = "Acme";

function envelope(spec: MockedApiSpec) {
    return {statusCode: spec.statusCode ?? 200, message: spec.message ?? "ok", data: spec.data};
}

function defaultForMethod(method: string): MockedApiSpec {
    const data = method === "GET" ? [] : method === "DELETE" ? null : {};
    return {data, statusCode: 200, message: "ok"};
}

/**
 * Enregistre un routeur CRM unique: chaque route listée dans `routes` (clé =
 * suffixe de pathname, ex. "/crm/pipeline") répond avec sa fixture; toute autre
 * requête `/crm/**` reçoit une réponse par défaut (GET → [], POST → {}).
 */
export async function mockCrmRouter(page: Page, routes: Record<string, MockedApiSpec | ((method: string) => MockedApiSpec)>) {
    await page.route(`${API_ORIGIN}/crm/**`, (route) => {
        const {pathname} = new URL(route.request().url());
        const crmPath = pathname.replace(/^\/api/, "");
        const method = route.request().method();
        const spec = typeof routes[crmPath] === "function" ? (routes[crmPath] as (m: string) => MockedApiSpec)(method) : routes[crmPath];
        route.fulfill({json: envelope((spec as MockedApiSpec) ?? defaultForMethod(method))});
    });
}

/** Enregistre les endpoints d'authentification mockés (login + sélection d'org). */
export async function mockAuthApi(page: Page) {
    await page.route(`${API_ORIGIN}/auth/sign-in`, (route) => {
        route.fulfill({
            json: envelope({
                data: {
                    user: {
                        id: "user-1",
                        firstname: "Jean",
                        lastname: "Dupont",
                        email: IDENTIFIER,
                        permissions: {
                            Deal: {read: true},
                            Lead: {read: true},
                            Contact: {read: true},
                        },
                    },
                    token: "e2e.token.real",
                    device: "e2e-device",
                    organizations: [{id: "org-1", name: ORG_NAME}],
                },
            }),
        });
    });
    await page.route(`${API_ORIGIN}/auth/sessions`, (route) => {
        route.fulfill({json: envelope({data: []})});
    });
    await page.route(`${API_ORIGIN}/organizations/public/*/api/access`, (route) => {
        route.fulfill({json: envelope({data: {publicKeys: ["e2e-api-key"]}})});
    });
}

/**
 * Authentification complète côté app (login réel + sélection d'organisation)
 * via des endpoints d'auth mockés. À appeler APRÈS avoir enregistré les mocks
 * CRM du spec concerné via `mockCrmRouter`.
 */
export async function loginAndGoto(page: Page, targetPath: string) {
    await mockAuthApi(page);

    // Navigation vers la route cible : le proxy redirige vers /auth/sign-in.
    await page.goto(targetPath);
    await expect(page.getByRole("textbox", {name: "exemple@email.com"})).toBeVisible({timeout: 15_000});

    await page.getByRole("textbox", {name: "exemple@email.com"}).fill(IDENTIFIER);
    await page.getByPlaceholder("••••••••").fill(PASSWORD);
    await page.getByRole("button", {name: "Se connecter"}).click();

    // Sélection de l'organisation puis retour vers la route cible.
    await expect(page.getByRole("button", {name: new RegExp(ORG_NAME)})).toBeVisible({timeout: 15_000});
    await page.getByRole("button", {name: new RegExp(ORG_NAME)}).click();

    // La sélection d'org redirige vers /dashboard (callbackUrl non préservé par
    // le proxy). On attend la fin de la sélection, puis on atteint la route cible.
    await page.waitForURL((url) => !url.pathname.startsWith("/auth/select-organization"), {timeout: 20_000});
    await page.goto(targetPath);
}
