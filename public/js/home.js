import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/mocks');
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const mocks = await res.json();
        common.outputMocks(mocks, '.mocksContainer');
    } catch (e) {
        console.error(e);
    }
});
