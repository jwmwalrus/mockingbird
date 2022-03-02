import { getUserLoggedIn } from './util.js';

const getOtherChatUsers = (users) => {
    if (users.length === 1) {
        return users;
    }
    const userLoggedIn = getUserLoggedIn();
    return users.filter((u) => u._id !== userLoggedIn._id);
};

const getChatImageHtml = (users) => {
    if (!users || users.length === 0) {
        throw new Error('Empty array of users provided to getChatImageHtml');
    }

    const createImage = (user) => {
        if (!user.profilePic) {
            throw new Error('Invalid user provided to createImage');
        }
        const img = document.createElement('img');
        img.src = user.profilePic;
        img.alt = 'User\'s profile pic';
        return img;
    };

    const container = document.createElement('div');
    container.classList.add('results-image-container');
    container.appendChild(createImage(users[0]));

    if (users.length > 1) {
        container.classList.add('group-chat-image');
        container.appendChild(createImage(users[1]));
    }

    return container;
};

const formatLatestMessage = (msg) => {
    const { sender } = msg;
    return `${sender.firstName} ${sender.lastName}: ${msg.content}`;
};

const createChatHtml = (chatData) => {
    const heading = document.createElement('span');
    heading.classList.add('heading', 'ellipsis');
    heading.textContent = chatData.chatName
        ?? getOtherChatUsers(chatData.users)
            .map((u) => `${u.firstName} ${u.lastName}`)
            .join();

    const subtext = document.createElement('span');
    subtext.classList.add('subtext', 'ellipsis');
    subtext.textContent = chatData.latestMessage
        ? formatLatestMessage(chatData.latestMessage)
        : '--';

    const details = document.createElement('div');
    details.classList.add('results-details-container', 'ellipsis');
    details.appendChild(heading);
    details.appendChild(subtext);

    const chat = document.createElement('a');
    chat.classList.add('results-list-item');
    chat.href = `/inbox/${chatData._id}`;
    chat.appendChild(getChatImageHtml(getOtherChatUsers(chatData.users)));
    chat.appendChild(details);
    return chat;
};

const outputChatList = (chatList, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (chatList.length === 0) {
        const noResults = document.createElement('span');
        noResults.classList.add('no-results');
        noResults.textContent = 'Nothing to show';

        parent.appendChild(noResults);
        return;
    }

    chatList.forEach((c) => {
        const node = createChatHtml(c);
        parent.append(node);
    });
};

export {
    getOtherChatUsers,
    outputChatList,
};
