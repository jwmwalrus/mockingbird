import express from 'express';
import mongoose from 'mongoose';

import Chat from '../../schemas/Chat.js';
import User from '../../schemas/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const results = await Chat.find({
            users: {
                $elemMatch: { $eq: req.session.user._id },
            },
        })
            .populate('users')
            .sort({ updatedAt: -1 });

        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await Chat.findOne({
            _id: req.params.id,
            users: { $elemMatch: { $eq: req.session.user._id } },
        })
            .populate('users');

        res.status(200).send(result);
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

    try {
        const chatData = {
            users: ids.map((x) => mongoose.Types.ObjectId(x)),
            isGroupChat: true,
        };

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

export default router;
