import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import multer from 'multer';

import User from '../../schemas/User.js';
import Notification from '../../schemas/Notification.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });
const getUsers = async (filter) => {
    const results = await User.find(filter)
        .populate('remocks')
        .populate('following')
        .populate('followers')
        .sort({ createdAt: -1 });
    return results;
};

router.get('/', async (req, res) => {
    let filter = req.query;
    if (filter.search !== undefined) {
        filter = {
            $or: [
                { firstName: { $regex: filter.search, $options: 'i' } },
                { lastName: { $regex: filter.search, $options: 'i' } },
                { username: { $regex: filter.search, $options: 'i' } },
            ],
        };
    }
    try {
        const user = await getUsers(filter);
        res.status(200).send(user);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id/following', async (req, res) => {
    try {
        const users = await getUsers({ _id: req.params.id });
        res.status(200).send(users.length > 0 ? users[0] : null);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id/followers', async (req, res) => {
    try {
        const users = await getUsers({ _id: req.params.id });
        res.status(200).send(users.length > 0 ? users[0] : null);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.post('/profilepicture', upload.single('croppedImage'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('Error uploading file');
        return;
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tmpPath = req.file.path;
    const targetPath = path.resolve('.' + filePath);
    try {
        const error = await fs.rename(tmpPath, targetPath);
        if (error) {
            throw error;
        }
        req.session.user = await User.findByIdAndUpdate(
            req.session.user._id,
            { profilePic: filePath },
            { new: true },
        );
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.post('/coverphoto', upload.single('croppedImage'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('Error uploading file');
        return;
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tmpPath = req.file.path;
    const targetPath = path.resolve('.' + filePath);
    try {
        const error = await fs.rename(tmpPath, targetPath);
        if (error) {
            throw error;
        }
        req.session.user = await User.findByIdAndUpdate(
            req.session.user._id,
            { coverPhoto: filePath },
            { new: true },
        );
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/:id/follow', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).send('User does not exist');
            return;
        }

        const isFollowing = user.followers && user.followers.includes(req.session.user._id);
        const option = isFollowing ? '$pull' : '$addToSet';

        req.session.user = await User.findByIdAndUpdate(
            req.session.user._id,
            { [option]: { following: userId } },
            { new: true },
        );
        await User.findByIdAndUpdate(
            userId,
            { [option]: { followers: req.session.user._id } },
        );

        if (!isFollowing) {
            await Notification.insertNotification(
                userId,
                req.session.user._id,
                'follow',
                req.session.user._id,
            );
        }
        res.status(200).send(req.session.user);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
