import {execSync} from "node:child_process";

// Next.js `output: 'export'` is the default, generating a static `out/` folder
// served by Tauri (frontendDist). No proxy/middleware hack is required anymore.
execSync("bun run build", {
    stdio: "inherit",
});