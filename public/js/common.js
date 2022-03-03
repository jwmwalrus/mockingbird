import { createChatHtml } from './lib/inbox.js';
import { addChatMessage } from './lib/chats.js';
import { createNotificationHtml, refreshBadge } from './lib/notifications.js';
import socket from './lib/socket.js';

const showPopup = async (type, entityId = null) => {
    let fn;
    let url;
    switch (type) {
        case 'chats':
            fn = createChatHtml;
            url = `/api/chats/${entityId}`;
            break;
        case 'notifications':
            fn = createNotificationHtml;
            url = '/api/notifications/latest';
            break;
        default:
            return;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const node = fn(await res.json());
        node.style.opacity = 1;

        const parent = document.getElementById('notification-list');
        parent.prepend(node);

        setTimeout(() => {
            node.style.transition = '400ms';
            node.style.opacity = 0;
        }, 5000);
    } catch (e) {
        console.error(e);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    socket.on('message-received', (msg) => {
        refreshBadge('chats');

        const elem = document.querySelector(`[data-room="${msg.chat._id}"]`);
        if (elem) {
            addChatMessage(msg, '.chat-messages');
            return;
        }

        showPopup('chats', msg.chat._id ?? msg.chat);
    });

    socket.on('notification-received', () => {
        refreshBadge('notifications');
        showPopup('notifications');
    });

    refreshBadge('chats');
    refreshBadge('notifications');
});
