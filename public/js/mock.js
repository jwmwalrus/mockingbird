import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const mockId = window.sessionStorage.getItem('mockId');

    try {
        const res = await fetch(`/api/mocks/${mockId}`);

        if (![200, 201].includes(res.status)) {
            throw new Error(res.statusText);
        }
        const results = await res.json();
        common.outputMockWithReplies(results, '.mocksContainer');
    } catch (e) {
        console.error(e);
    }
});
