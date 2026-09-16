import {test, expect} from "@playwright/test";
import {mockCrmRouter, loginAndGoto} from "./support/auth";

const PIPELINE = {
    id: "org-1",
    name: "Canaux de vente",
    stages: [
        {id: "prospect-new", name: "Nouveau prospect", type: "PROSPECT", system: true, order: 0},
        {id: "prospect-qualified", name: "Prospect qualifié", type: "PROSPECT", system: true, order: 1},
        {id: "client", name: "Client", type: "CLIENT", system: true, order: 4},
        {id: "perdu", name: "Perdu", type: "PERDU", system: true, order: 5},
    ],
};

const KANBAN = [
    {id: "k1", title: "Prospect Acme", stageId: "prospect-new", type: "PROSPECT"},
    {id: "k2", title: "Client Beta", stageId: "client", type: "CLIENT", amount: 25000},
];

test.describe("S-032 AC-2 — Suivi (pipeline / kanban)", () => {
    test.beforeEach(async ({page}) => {
        await mockCrmRouter(page, {
            "/crm/pipeline": {data: PIPELINE},
            "/crm/kanban": {data: KANBAN},
        });
    });

    test("affiche le pipeline et les fiches du kanban", async ({page}) => {
        await loginAndGoto(page, "/crm/suivi");
        await expect(page.getByRole("heading", {name: "Suivi"})).toBeVisible();

        // Les étapes du pipeline sont présentes.
        await expect(page.getByText("Nouveau prospect").first()).toBeVisible();
        await expect(page.getByText("Prospect qualifié").first()).toBeVisible();

        // Les fiches kanban sont rendues dans leurs colonnes respectives.
        await expect(page.getByText("Prospect Acme")).toBeVisible();
        await expect(page.getByText("Client Beta")).toBeVisible();
    });

    test("recherche une fiche dans la barre de recherche du pipeline", async ({page}) => {
        await loginAndGoto(page, "/crm/suivi");
        await page.getByPlaceholder("Rechercher une fiche…").fill("Beta");
        await expect(page.getByText("Client Beta")).toBeVisible();
        await expect(page.getByText("Prospect Acme")).not.toBeVisible();
    });
});
