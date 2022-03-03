import express from 'express';
import mongoose from 'mongoose';

import Chat from '../../schemas/Chat.js';
import User from '../../schemas/User.js';
import Message from '../../schemas/Message.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let results = await Chat.find({
            users: {
                $elemMatch: { $eq: req.session.user._id },
            },
        })
            .populate('users')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        results = await User.populate(results, { path: 'latestMessage.sender' });

        if (req.query.unreadOnly && req.query.unreadOnly === 'true') {
            results = results.filter(
                (r) => r.latestMessage
                && (!r.latestMessage.readBy
                    || !r.latestMessage.readBy.includes(req.session.user._id)),
            );
        }

        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        let result = await Chat.findOne({
            _id: req.params.id,
            users: { $elemMatch: { $eq: req.session.user._id } },
        })
            .populate('users')
            .populate('latestMessage');

        result = await User.populate(result, { path: 'latestMessage.sender' });

        res.status(200).send(result);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id/messages', async (req, res) => {
    try {
        const results = await Message.find({ chat: req.params.id })
            .populate('sender')
            .populate('readBy');

        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.post('/', async (req, res) => {
    if (!req.body.users || req.body.users.length === 0) {
        res.status(400).send('Missing users');
        return;
    }

    const ids = [...req.body.users];
    ids.push(req.session.user._id);

    const chatData = {
        users: ids.map((x) => mongoose.Types.ObjectId(x)),
        isGroupChat: true,
    };

    try {
        let result = await Chat.create(chatData);
        result = await User.populate(result, { path: 'users' });
        res.status(201).send(result);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/:id', async (req, res) => {
    const payload = req.body;

    try {
        const chat = await Chat.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true },
        );
        if (!chat) {
            throw new Error('Chat does not exist or cannot be updated');
        }
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/:id/messages/read', async (req, res) => {
    try {
        await Message.updateMany(
            { chat: req.params.id },
            { $addToSet: { readBy: req.session.user._id } },
        );
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
