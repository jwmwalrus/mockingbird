import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const query = new URLSearchParams();
        query.append('followingOnly', true);
        const res = await fetch(`/api/mocks/?${query.toString()}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const mocks = await res.json();
        common.outputMocks(mocks, '.mocks-container');
    } catch (e) {
        console.error(e);
    }
});
