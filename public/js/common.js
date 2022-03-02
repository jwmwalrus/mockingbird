import { addChatMessage } from './lib/chats.js';
import socket from './lib/socket.js';

document.addEventListener('DOMContentLoaded', async () => {
    socket.on('message-received', (msg) => {
        const elems = document.querySelectorAll('.chat-container');
        if (elems.length > 0) {
            addChatMessage(msg, '.chat-messages');
            return;
        }

        // TODO: pop-up
        console.log(`Must popup message: ${msg}`);
    });
});
