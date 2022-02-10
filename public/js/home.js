import common from './common.js';

const outputMocks = (mocks, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (mocks.length === 0) {
        const noResults = document.createElement('span');
        noResults.classList.add('noResults');
        noResults.textContent = 'Nothing to show';

        parent.appendChild(noResults);
        return;
    }

    mocks.forEach((p) => {
        const node = common.createMockHtml(p);
        parent.append(node);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/mocks');

        if (![200, 201].includes(res.status)) {
            throw new Error(res.statusText);
        }
        const mocks = await res.json();
        outputMocks(mocks, '.mocksContainer');
    } catch (e) {
        console.error(e);
    }
});
