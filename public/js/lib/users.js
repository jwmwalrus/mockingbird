import { getUserLoggedIn } from './util.js';
import socket from './socket.js';

const handleFollows = async (btn) => {
    const userId = btn.getAttribute('data-user');
    try {
        const res = await fetch(`/api/users/${userId}/follow`, { method: 'PUT' });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const data = await res.json();
        let diff = 1;
        if (data.following.includes(userId)) {
            btn.classList.add('following');
            btn.innerText = 'Following';
            socket.emit('new-notification', userId);
        } else {
            btn.classList.remove('following');
            btn.innerText = 'Follow';
            diff = -1;
        }

        const label = document.getElementById('followers-value');
        if (label) {
            label.innerText = (Number(label.innerText) + diff).toString();
        }
    } catch (e) {
        console.error(e);
    }
};

const createUserHtml = async (userData, showFollowButton = false) => {
    const userLink = document.createElement('a');
    userLink.href = `/profile/${userData.username}`;
    userLink.textContent = `${userData.firstName} ${userData.lastName}`;

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = '@' + userData.username;

    const header = document.createElement('div');
    header.classList.add('header');
    header.appendChild(userLink);
    header.appendChild(username);

    const details = document.createElement('div');
    details.classList.add('user-details-container');
    details.appendChild(header);

    const img = document.createElement('img');
    img.src = userData.profilePic;
    img.alt = 'User Picture';
    const imgc = document.createElement('div');
    imgc.classList.add('user-image-container');
    imgc.appendChild(img);

    const user = document.createElement('div');
    user.classList.add('user');
    user.appendChild(imgc);
    user.appendChild(details);

    const userLoggedIn = getUserLoggedIn();
    if (showFollowButton && userData._id !== userLoggedIn._id) {
        const isFollowing = userLoggedIn.following
            && userLoggedIn.following.includes(userData._id);

        const followBtn = document.createElement('button');
        followBtn.setAttribute('data-user', userData._id);
        followBtn.textContent = isFollowing ? 'Following' : 'Follow';
        followBtn.classList.add('follow-button');
        if (isFollowing) {
            followBtn.classList.add('following');
        }
        followBtn.onclick = async () => { await handleFollows(followBtn); };

        const followBtnc = document.createElement('div');
        followBtnc.classList.add('follow-button-container');
        followBtnc.appendChild(followBtn);

        user.appendChild(followBtnc);
    }

    return user;
};

const outputUsers = (users, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (users.length === 0) {
        const noResults = document.createElement('span');
        noResults.classList.add('no-results');
        noResults.textContent = 'Nothing to show';

        parent.appendChild(noResults);
        return;
    }

    users.forEach(async (u) => {
        const node = await createUserHtml(u, true);
        parent.append(node);
    });
};

export {
    createUserHtml,
    handleFollows,
    outputUsers,
};
