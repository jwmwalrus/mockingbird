import { markNotificationAsRead, outputNotificstionList } from './lib/lib.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }
        await outputNotificstionList(await res.json(), '.results-container');
    } catch (e) {
        console.error(e);
    }

    const markAllBtn = document.getElementById('mark-notifications-as-read');
    markAllBtn.onclick = () => markNotificationAsRead();
});
