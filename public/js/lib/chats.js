import { getUserLoggedIn, scrollIntoView } from './util.js';
import socket from './socket.js';

let typing = false;
let lastTypingTime = null;
const timerLength = 3000;

const createMessageHtml = (msgData, nextMsg, lastSenderId) => {
    const { sender } = msgData;
    const currentSenderId = sender._id;
    const nextSenderId = nextMsg ? nextMsg.sender._id : '';

    const isMine = msgData.sender._id === getUserLoggedIn()._id;
    const isFirst = lastSenderId !== currentSenderId;
    const isLast = nextSenderId !== currentSenderId;

    const body = document.createElement('span');
    body.classList.add('message-body');
    body.innerHTML = msgData.content.replaceAll(/\r|\n/g, '<br>');

    const msgc = document.createElement('div');
    msgc.classList.add('message-container');
    if (isFirst && !isMine) {
        const senderName = document.createElement('span');
        senderName.classList.add('sender-name');
        senderName.textContent = `${sender.firstName} ${sender.lastName}`;
        msgc.appendChild(senderName);
    }
    msgc.appendChild(body);

    const msg = document.createElement('li');
    msg.classList.add('message', isMine ? 'mine' : 'theirs');

    if (!isMine) {
        const imgc = document.createElement('div');
        imgc.classList.add('image-container');

        if (isLast) {
            const img = document.createElement('img');
            img.src = sender.profilePic;
            img.alt = 'User\'s profile picture';
            imgc.appendChild(img);
        }
        msg.appendChild(imgc);
    }

    msg.appendChild(msgc);

    if (isFirst) {
        msg.classList.add('first');
    }

    if (isLast) {
        msg.classList.add('last');
    }

    return msg;
};

const addChatMessage = (msgData, selector, nextMsg = null, lastSenderId = '') => {
    if (!msgData || !msgData._id) {
        console.error('Message is not valid');
        return;
    }

    const parent = document.querySelector(selector);

    const msg = createMessageHtml(msgData, nextMsg, lastSenderId);

    parent.append(msg);
};

const submitMessage = async (chatId) => {
    const textbox = document.querySelector('.input-textbox');
    const content = textbox.value.trim();
    if (!content) {
        return;
    }

    typing = false;
    socket.emit('stop-typing', chatId);

    textbox.value = '';

    const data = { chatId, content };
    try {
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }
        const newMsg = await res.json();
        addChatMessage(newMsg, '.chat-messages');

        if (socket.isConnected()) {
            socket.emit('new-message', newMsg);
        }

        scrollIntoView(['.message:last-child', '.input-textbox']);
    } catch (e) {
        textbox.value = content;
        console.error(e);
    }
};

const updateTyping = (chatId) => {
    if (!socket.isConnected) {
        return;
    }

    if (!typing) {
        typing = true;
        socket.emit('typing', chatId);
    }

    lastTypingTime = new Date().getTime();
    setTimeout(() => {
        const timeNow = new Date().getTime();
        if (typing && timeNow - lastTypingTime > timerLength) {
            typing = false;
            socket.emit('stop-typing', chatId);
        }
    }, timerLength);
};

export {
    addChatMessage,
    createMessageHtml,
    submitMessage,
    updateTyping,
};
