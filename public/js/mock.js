import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mockId = window.sessionStorage.getItem('mockId');

    try {
        const res = await fetch(`/api/mocks/${mockId}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const results = await res.json();
        common.outputMockWithReplies(results, '.mocksContainer');
    } catch (e) {
        console.error(e);
    }
});
