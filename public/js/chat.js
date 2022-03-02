import { scrollIntoView } from './lib/util.js';
import { addChatMessage, submitMessage, updateTyping } from './lib/chats.js';
import { getOtherChatUsers } from './lib/inbox.js';
import socket from './lib/socket.js';

document.addEventListener('DOMContentLoaded', async () => {
    const chatId = window.sessionStorage.getItem('chatId');

    socket.emit('join-room', chatId);
    socket.on('typing', () => {
        document.querySelector('.typing-dots').style.display = 'block';
    });
    socket.on('stop-typing', () => {
        document.querySelector('.typing-dots').style.display = 'none';
    });

    const chatNameBtn = document.getElementById('chat-name-button');
    chatNameBtn.onclick = async () => {
        const chatName = document.getElementById('chat-name-textbox').value.trim();
        const data = {
            chatName,
        };
        try {
            const res = await fetch(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`${res.statusText} - ${msg}`);
            }

            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    };

    const textbox = document.querySelector('.input-textbox');
    textbox.onkeydown = async (evt) => {
        updateTyping(chatId);

        if (evt.shiftKey) {
            return;
        }
        if (evt.code !== 'Enter' || evt.keyCode !== 13) {
            return;
        }

        evt.preventDefault();

        submitMessage(chatId);
    };

    const sendMsgBtn = document.querySelector('.send-message-button');
    sendMsgBtn.onclick = async () => submitMessage(chatId);

    try {
        const res = await fetch(`/api/chats/${chatId}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const chatData = await res.json();

        const chatName = document.getElementById('chat-name');
        chatName.textContent = chatData.chatName
        ?? getOtherChatUsers(chatData.users)
            .map((u) => `${u.firstName} ${u.lastName}`)
            .join();
    } catch (e) {
        console.error(e);
    }

    try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const messages = await res.json();
        let lastSenderId = '';
        messages.forEach((m, idx) => {
            const nextMsg = idx < messages.length ? messages[idx + 1] : null;
            addChatMessage(m, '.chat-messages', nextMsg, lastSenderId);
            lastSenderId = m.sender._id;
        });

        document.querySelector('.loading-spinner-container').remove();
        document.querySelector('.chat-container').style.visibility = 'visible';
        // scrollIntoView(['.message:last-child', '.input-textbox']);
        scrollIntoView('.message:last-child');
    } catch (e) {
        console.error(e);
    }
});
