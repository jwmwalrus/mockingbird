import common from './common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileUserId = window.sessionStorage.getItem('profileUserId');
    const selectedTab = window.sessionStorage.getItem('selectedTab');

    try {
        const res = await fetch(`/api/users/${profileUserId}/${selectedTab}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const user = await res.json();
        common.outputUsers(user[selectedTab], '.resultsContainer');
    } catch (e) {
        console.error(e);
    }
});
