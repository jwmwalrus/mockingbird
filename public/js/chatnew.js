import { getUserLoggedIn } from './common/util.js';
import { createUserHtml } from './common/users.js';

const selectedUsers = new Map();

const updateSelectedUsersHtml = () => {
    document.querySelectorAll('.selected-user')
        .forEach((x) => x.remove());

    const boxdiv = document.getElementById('selected-users');

    const keys = Array.from(selectedUsers.keys());
    for (let i = keys.length - 1; i >= 0; i -= 1) {
        const user = selectedUsers.get(keys[i]);
        const span = document.createElement('span');
        span.classList.add('selected-user');
        span.textContent = `${user.firstName} ${user.lastName}`;
        boxdiv.prepend(span);
    }
};

const selectUser = (user) => {
    selectedUsers.set(user._id, user);
    updateSelectedUsersHtml();

    const box = document.getElementById('user-search-textbox');
    box.value = '';
    box.focus();

    const container = document.querySelector('.results-container');
    container.innerHTML = '';

    document.getElementById('create-chat-button').disabled = false;
};

const outputSelectableUsers = (results, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (results.length === 0) {
        const span = document.createElement('span');
        span.classList.add('no-results');
        span.textContent = 'No results';
        parent.appendChild(span);
        return;
    }

    const userLoggedIn = getUserLoggedIn();

    results.forEach(async (result) => {
        if (result._id === userLoggedIn._id || selectedUsers.has(result._id)) {
            return;
        }

        const node = await createUserHtml(result, false);
        node.onclick = () => selectUser(result);

        parent.append(node);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('user-search-textbox');
    const createChatBtn = document.getElementById('create-chat-button');
    const container = document.querySelector('.results-container');

    let timer = null;
    let prevVal = '';
    searchBox.onkeydown = async (evt) => {
        clearTimeout(timer);

        if (prevVal === '' && (evt.code === 'Backspace' || evt.keyCode === 8)) {
            selectedUsers.delete(Array.from(selectedUsers.keys()).pop());
            updateSelectedUsersHtml();
            container.innerHTML = '';
            createChatBtn.disabled = selectedUsers.size === 0;
            return;
        }

        prevVal = evt.target.value;

        timer = setTimeout(async () => {
            const value = evt.target.value.trim();

            if (value === '') {
                container.innerHTML = '';
                return;
            }

            try {
                const query = new URLSearchParams();
                query.append('search', value);

                const res = await fetch(`/api/users/?${query.toString()}`);
                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(`${res.statusText} - ${msg}`);
                }
                outputSelectableUsers(await res.json(), '.results-container');
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    };

    createChatBtn.onclick = async () => {
        const data = {
            users: Array.from(selectedUsers.keys()),
        };

        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`${res.statusText} - ${msg}`);
            }

            const chat = await res.json();
            window.location.href = `/inbox/${chat._id}`;
        } catch (e) {
            console.error(e);
        }
    };
});
