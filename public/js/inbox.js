import { outputChatList } from './common/inbox.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/chats');

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        outputChatList(await res.json(), '.results-container');
    } catch (e) {
        console.error(e);
    }
});
