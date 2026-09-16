import {test, expect} from "@playwright/test";
import {mockCrmRouter, loginAndGoto} from "./support/auth";

const REMINDERS = [
    {
        id: "r1",
        title: "Relancer Acme",
        description: "Appel de suivi commercial",
        scheduledAt: new Date(Date.now() + 3600e3).toISOString(),
        status: "PENDING",
        recurrence: "WEEKLY",
        lead: {id: "k1", title: "Prospect Acme", owner: {id: "user-1", firstname: "Jean", lastname: "Dupont"}},
    },
    {
        id: "r2",
        title: "Devis Beta",
        scheduledAt: new Date(Date.now() + 86400e3).toISOString(),
        status: "CANCELLED",
        recurrence: "NONE",
    },
];

test.describe("S-032 AC-3 — Rappels (liste + statuts)", () => {
    test.beforeEach(async ({page}) => {
        await mockCrmRouter(page, {
            "/crm/reminders": {data: REMINDERS},
        });
    });

    test("affiche la liste des rappels avec leur statut", async ({page}) => {
        await loginAndGoto(page, "/crm/rappels");
        await expect(page.getByRole("heading", {name: "Rappels"})).toBeVisible();
        await expect(page.getByText("Relancer Acme")).toBeVisible();
        await expect(page.getByText("Devis Beta")).toBeVisible();
    });

    test("affiche un rappel planifié et lié à une fiche", async ({page}) => {
        await loginAndGoto(page, "/crm/rappels");
        await expect(page.getByText("Relancer Acme")).toBeVisible();
        await expect(page.getByText(/Affaire : Prospect Acme/)).toBeVisible();
    });
});
