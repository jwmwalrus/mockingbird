import express from 'express';

import Chat from '../../schemas/Chat.js';
import User from '../../schemas/User.js';
import Message from '../../schemas/Message.js';
import Notification from '../../schemas/Notification.js';

const router = express.Router();

const insertNotifications = async (chat, msg) => {
    if (!chat.users || chat.users.length === 0) {
        return;
    }

    const senderId = msg.sender._id.toString();
    for await (const uid of chat.users.filter((x) => x !== senderId)) {
        Notification.insertNotification(
            uid,
            msg.sender._id,
            'new-message',
            chat._id,
        );
    }
};

router.post('/', async (req, res) => {
    if (!req.body.content || !req.body.chatId) {
        res.status(400).send('Invalid data passed into request');
        return;
    }

    const messageData = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId,
    };

    try {
        let result = await Message.create(messageData);
        result = await User.populate(result, { path: 'sender' });
        result = await User.populate(result, { path: 'readBy' });
        result = await Chat.populate(result, { path: 'chat' });
        result = await User.populate(result, { path: 'chat.users' });
        const chat = await Chat.findByIdAndUpdate(
            req.body.chatId,
            { latestMessage: result },
            { new: true },
        );

        await insertNotifications(chat, result);
        res.status(201).send(result);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
