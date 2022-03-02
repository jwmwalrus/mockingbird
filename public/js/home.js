import { outputMocks } from './lib/mocks.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const query = new URLSearchParams();
        query.append('followingOnly', true);
        const res = await fetch(`/api/mocks/?${query.toString()}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        outputMocks(await res.json(), '.mocks-container');
    } catch (e) {
        console.error(e);
    }
});
