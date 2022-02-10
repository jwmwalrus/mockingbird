import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/mocks');

        if (![200, 201].includes(res.status)) {
            throw new Error(res.statusText);
        }
        const mocks = await res.json();
        common.outputMocks(mocks, '.mocksContainer');
    } catch (e) {
        console.error(e);
    }
});
