import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileUserId = window.sessionStorage.getItem('profileUserId');
    const selectedTab = window.sessionStorage.getItem('selectedTab');

    let querystr = `mockedBy=${profileUserId}`;

    querystr += '&isReply=' + (selectedTab === 'replies' ? '1' : '0');

    try {
        const res = await fetch(`/api/mocks?${querystr}`);
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
export default {};
