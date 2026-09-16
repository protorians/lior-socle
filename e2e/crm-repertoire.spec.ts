import {test, expect} from "@playwright/test";
import {mockCrmRouter, loginAndGoto} from "./support/auth";

const CONTACTS = [
    {id: "c1", firstname: "Jean", lastname: "Dupont", email: "jean@acme.fr", phone: "0600000001", jobTitle: "CTO", type: "CONTACT"},
    {id: "c2", firstname: "Marie", lastname: "Martin", email: "marie@acme.fr", phone: "0600000002", jobTitle: "CMO", type: "CLIENT"},
];

const COMPANIES = [
    {id: "co1", name: "Acme SAS", industry: "Tech", type: "ENTREPRISE"},
    {id: "co2", name: "Beta SARL", industry: "Conseil", type: "ENTREPRISE"},
];

test.describe("S-032 AC-1 — Répertoire (liste + import CSV + aperçu)", () => {
    test.beforeEach(async ({page}) => {
        await mockCrmRouter(page, {
            "/crm/contacts": {data: CONTACTS},
            "/crm/companies": {data: COMPANIES},
            "/crm/contacts/import/preview": {
                statusCode: 200,
                data: {
                    total: 2,
                    create: 1,
                    dedup: 1,
                    error: 0,
                    rows: [
                        {row: 1, action: "CREATE", type: "CONTACT", message: "", data: {firstname: "Paul", lastname: "Durand"}},
                        {row: 2, action: "DEDUP", type: "CONTACT", message: "Contact déjà présent (email)", data: {firstname: "Jean", lastname: "Dupont"}},
                    ],
                },
            },
        });
    });

    test("affiche le répertoire et les entrées de contact", async ({page}) => {
        await loginAndGoto(page, "/crm/repertoire");
        await expect(page.getByRole("heading", {name: "Répertoire"})).toBeVisible();
        await expect(page.getByText("Jean Dupont")).toBeVisible();
        await expect(page.getByText("jean@acme.fr")).toBeVisible();
    });

    test("importe un CSV, mappe les colonnes et affiche l'aperçu (dry-run)", async ({page}) => {
        await loginAndGoto(page, "/crm/repertoire");
        await page.getByRole("button", {name: "Importer"}).click();

        // Sélection du fichier CSV : en-têtes Prénom/Nom/Email auto-détectés.
        await page.locator('input[type="file"]').setInputFiles({
            name: "contacts.csv",
            mimeType: "text/csv",
            buffer: Buffer.from("Prénom,Nom,Email\nPaul,Durand,paul@acme.fr\nJean,Dupont,jean@acme.fr\n"),
        });

        // L'aperçu (dry-run) est proposé dès qu'une ligne est mappée.
        await expect(page.getByRole("button", {name: /Aperçu/})).toBeEnabled();
        await page.getByRole("button", {name: /Aperçu/}).click();

        // Résultat de l'aperçu : totaux CREATE / DEDUP et lignes détaillées.
        await expect(page.getByText("Aperçu de l'import")).toBeVisible();
        await expect(page.getByText("Paul Durand")).toBeVisible();
        await expect(page.getByText("Jean Dupont")).toBeVisible();
    });
});
