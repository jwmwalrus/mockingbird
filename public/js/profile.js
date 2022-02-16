import common from './common.js';

const outputPinnedMock = (mocks, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';
    if (mocks.length === 0) {
        parent.style.display = 'none';
        return;
    }

    mocks.forEach(async (m) => {
        const node = await common.createMockHtml(m);
        parent.append(node);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const profileUserId = window.sessionStorage.getItem('profileUserId');
    const selectedTab = window.sessionStorage.getItem('selectedTab');

    if (selectedTab !== 'replies') {
        const search = new URLSearchParams();
        search.append('mockedBy', profileUserId);
        search.append('pinned', true);
        try {
            const res = await fetch(`/api/mocks?${search.toString()}`);
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`${res.statusText} - ${msg}`);
            }

            const mocks = await res.json();
            outputPinnedMock(mocks, '.pinnedMockContainer');
        } catch (e) {
            console.error(e);
        }
    }

    const search = new URLSearchParams();
    search.append('mockedBy', profileUserId);
    search.append('isReply', selectedTab === 'replies');

    try {
        const res = await fetch(`/api/mocks?${search.toString()}`);
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
