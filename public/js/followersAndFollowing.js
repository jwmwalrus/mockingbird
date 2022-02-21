import { outputUsers } from './common/users.js';

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
        outputUsers(user[selectedTab], '.results-container');
    } catch (e) {
        console.error(e);
    }
});
