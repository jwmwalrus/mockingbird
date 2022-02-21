import { outputUsers } from './common/users.js';
import { outputMocks } from './common/mocks.js';

const doSearch = async (value, searchType) => {
    const endpoint = searchType === 'users' ? 'users' : 'mocks';
    const query = new URLSearchParams();
    query.append('search', value);
    try {
        const res = await fetch(`/api/${endpoint}/?${query.toString()}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const results = await res.json();
        if (endpoint === 'users') {
            outputUsers(results, '.results-container');
        } else {
            outputMocks(results, '.results-container');
        }
    } catch (e) {
        console.error(e);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('search-box');
    const container = document.querySelector('.results-container');
    const searchType = searchBox.getAttribute('data-search');
    let timer = null;
    searchBox.onkeydown = (evt) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            const value = evt.target.value.trim();
            if (value === '') {
                container.innerHTML = '';
                return;
            }
            await doSearch(value, searchType);
        }, 1000);
    };
});
