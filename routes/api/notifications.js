import express from 'express';

import Notification from '../../schemas/Notification.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const results = await Notification.find({
            userTo: req.session.user._id,
            notificationType: { $ne: 'new-message' },
        })
            .populate('userFrom')
            .populate('userTo')
            .sort({ createdAt: -1 });

        res.status(200).send(results);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/:id/opened', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(
            req.params.id,
            { opened: true },
        );
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/opened', async (req, res) => {
    try {
        await Notification.updateMany(
            { userTo: req.session.user._id },
            { opened: true },
        );
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
