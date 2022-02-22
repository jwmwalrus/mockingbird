import { getOtherChatUsers } from './common/inbox.js';

document.addEventListener('DOMContentLoaded', async () => {
    const chatId = window.sessionStorage.getItem('chatId');

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
});
