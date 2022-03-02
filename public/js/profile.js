import './lib/profile.js';
import { createMockHtml, outputMocks } from './lib/mocks.js';

const outputPinnedMock = (mocks, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';
    if (mocks.length === 0) {
        parent.style.display = 'none';
        return;
    }

    mocks.forEach(async (m) => {
        const node = await createMockHtml(m);
        parent.append(node);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const profileUserId = window.sessionStorage.getItem('profileUserId');
    const selectedTab = window.sessionStorage.getItem('selectedTab');

    if (selectedTab !== 'replies') {
        const query = new URLSearchParams();
        query.append('mockedBy', profileUserId);
        query.append('pinned', true);
        try {
            const res = await fetch(`/api/mocks?${query.toString()}`);
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`${res.statusText} - ${msg}`);
            }

            outputPinnedMock(await res.json(), '.pinned-mock-container');
        } catch (e) {
            console.error(e);
        }
    }

    const query = new URLSearchParams();
    query.append('mockedBy', profileUserId);
    query.append('isReply', selectedTab === 'replies');

    try {
        const res = await fetch(`/api/mocks?${query.toString()}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        outputMocks(await res.json(), '.mocks-container');
    } catch (e) {
        console.error(e);
    }
});
