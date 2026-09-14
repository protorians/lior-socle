import type {NextConfig} from "next";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {networkInterfaces} from "node:os";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(projectRoot, '../..');

function getLanIp(): string | undefined {
    for (const interfaces of Object.values(networkInterfaces())) {
        for (const iface of interfaces ?? []) {
            if (iface.family === "IPv4" && !iface.internal) return iface.address;
        }
    }
}

const allowedDevOrigins = ["localhost", "127.0.0.1"];
const lanIp = getLanIp();
if (lanIp) allowedDevOrigins.push(lanIp);

// Static export (`output: 'export'`): generates a static `out/` folder served by
// Tauri (frontendDist) or any static host. No Node server is required.
// The API and WebSocket are reached directly through their public hosts
// (NEXT_PUBLIC_CORE_API_HOST / NEXT_PUBLIC_CORE_SOCKET_HOST), so `rewrites`
// (unsupported by static export) are unnecessary.
const nextConfig: NextConfig = {
    allowedDevOrigins,
    output: 'export',
    images: {unoptimized: true},
    transpilePackages: ['@sentients/sdk'],
    turbopack: {
        root: workspaceRoot,
    },
};

export default nextConfig;
