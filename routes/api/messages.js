import express from 'express';

import Chat from '../../schemas/Chat.js';
import User from '../../schemas/User.js';
import Message from '../../schemas/Message.js';

const router = express.Router();

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
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: result });
        res.status(201).send(result);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
