import { outputMockWithReplies } from './common/mocks.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mockId = window.sessionStorage.getItem('mockId');

    try {
        const res = await fetch(`/api/mocks/${mockId}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        outputMockWithReplies(await res.json(), '.mocks-container');
    } catch (e) {
        console.error(e);
    }
});
