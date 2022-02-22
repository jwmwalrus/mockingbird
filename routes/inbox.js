import express from 'express';
import mongoose from 'mongoose';

import Chat from '../schemas/Chat.js';
import User from '../schemas/User.js';

const router = express.Router();

const getChatByUserId = async (userLoggedInId, otherUserId) => Chat.findOneAndUpdate({
    isGroupChat: false,
    users: {
        $size: 2,
        $all: [
            { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
            { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
    },
}, {
    $setOnInsert: { users: [userLoggedInId, otherUserId] },
}, {
    new: true,
    upsert: true,
})
    .populate('users');

const getPayload = (title, userLoggedIn) => ({
    pageTitle: title,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
});

router.get('/', (req, res) => {
    const payload = getPayload('Inbox', req.session.user);
    res.status(200).render('inbox', payload);
});

router.get('/new', (req, res) => {
    const payload = getPayload('New chat', req.session.user);
    res.status(200).render('chatnew', payload);
});

router.get('/:id', async (req, res) => {
    const { _id: userId } = req.session.user;
    const { id: chatId } = req.params;
    const errorMessage = 'Chat does not exist or user does not have permission to access it';

    const payload = getPayload('Chat', req.session.user);
    if (!mongoose.isValidObjectId(chatId)) {
        payload.errorMessage = errorMessage;
        res.status(200).render('chat', payload);
        return;
    }

    try {
        let chat = await Chat.findOne({
            _id: chatId,
            users: { $elemMatch: { $eq: userId } },
        })
            .populate('users');

        if (!chat) {
            const user = await User.findById(chatId);
            if (!user) {
                payload.errorMessage = errorMessage;
                res.status(200).render('chat', payload);
                return;
            }
            chat = await getChatByUserId(userId, chatId);
        }

        payload.chat = chat;
        res.status(200).render('chat', payload);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
