const CLIENT_STATES = new Map();
const CLIENT_STATE_TTL = 10000;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object' || !event.source) return;

    if (message.type === 'CLIENT_STATE') {
        if (message.active) {
            CLIENT_STATES.set(event.source.id, {
                timestamp: Date.now(),
            });
        } else {
            CLIENT_STATES.delete(event.source.id);
        }
    }
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        const raw = event.data.json();
        if (typeof raw === 'object' && raw !== null) {
            payload = raw;
        } else {
            payload = { body: raw };
        }
    } catch {
        payload = { body: event.data.text() };
    }

    event.waitUntil((async () => {
        const activeClient = await findForegroundActiveClient();

        if (activeClient) {
            activeClient.postMessage({ type: 'NOTIFICATION_RECEIVED', payload });
            return;
        }

        const data = payload;
        const options = {
            body: data.body || 'Vous avez une nouvelle notification',
            icon: data.icon || '/assets/logo/icon.png',
            badge: data.badge || '/assets/logo/icon.png',
            tag: data.tag,
            vibrate: data.vibrate || [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                url: data.url || '/',
                ...data.data,
            },
            actions: data.actions || [],
        };

        await self.registration.showNotification(data.title || 'Liorian Dashboard', options);
    })());
});

async function findForegroundActiveClient() {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const now = Date.now();

    for (const client of windowClients) {
        if (!client.focused || client.visibilityState !== 'visible') continue;

        const state = CLIENT_STATES.get(client.id);
        if (state && now - state.timestamp < CLIENT_STATE_TTL) {
            return client;
        }
    }

    return null;
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});

self.addEventListener('notificationclose', (event) => {
    event.notification.close();
});
