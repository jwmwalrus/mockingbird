import express from 'express';

import Mock from '../../schemas/Mock.js';
import User from '../../schemas/User.js';

const router = express.Router();

const getMocks = async (filter) => {
    let results = await Mock.find(filter)
        .populate('mockedBy')
        .populate('remockData')
        .populate('replyTo')
        .sort({ createdAt: -1 });
    results = await User.populate(results, { path: 'remockData.mockedBy' });
    results = await User.populate(results, { path: 'replyTo.mockedBy' });
    return results;
};

router.get('/', async (req, res) => {
    const filter = req.query;
    if (filter.isReply !== undefined) {
        const isReply = filter.isReply === '1';
        filter.replyTo = { $exists: isReply };
        delete filter.isReply;
    }
    try {
        const mocks = await getMocks(filter);
        res.status(200).send(mocks);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:id', async (req, res) => {
    const mockId = req.params.id;
    try {
        const mocks = await getMocks({ _id: mockId });
        if (mocks.length > 0) {
            const result = {
                mock: mocks[0],
            };

            if (mocks[0].replyTo) {
                result.replyTo = mocks[0].replyTo;
            }

            result.replies = await getMocks({ replyTo: mockId });

            res.status(200).send(result);
            return;
        }
        res.status(200).send(null);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.post('/', async (req, res) => {
    if (!req.body.content) {
        res.status(400).send('Missing content');
        return;
    }

    const mockData = {
        content: req.body.content,
        mockedBy: req.session.user,
    };
    if (req.body.replyTo) {
        mockData.replyTo = req.body.replyTo;
    }

    try {
        let newMock = await Mock.create(mockData);
        newMock = await User.populate(newMock, { path: 'mockedBy' });
        res.status(201).send(newMock);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.post('/:id/remock', async (req, res) => {
    const mockId = req.params.id;
    const { user } = req.session;
    const userId = user._id;

    try {
        const deletedMock = await Mock.findOneAndDelete({ mockedBy: userId, remockData: mockId });
        const option = deletedMock ? '$pull' : '$addToSet';

        let remock = deletedMock;
        if (!remock) {
            remock = await Mock.create({ mockedBy: userId, remockData: mockId });
        }

        req.session.user = await User.findByIdAndUpdate(
            userId,
            { [option]: { retweets: remock._id } },
            { new: true },
        );
        const mock = await Mock.findByIdAndUpdate(
            mockId,
            { [option]: { remockUsers: userId } },
            { new: true },
        );
        res.status(200).send(mock);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.put('/:id/like', async (req, res) => {
    const mockId = req.params.id;
    const { user } = req.session;
    const userId = user._id;

    const isLiked = user.likes && user.likes.includes(mockId);

    try {
        const option = isLiked ? '$pull' : '$addToSet';
        req.session.user = await User.findByIdAndUpdate(
            userId,
            { [option]: { likes: mockId } },
            { new: true },
        );
        const mock = await Mock.findByIdAndUpdate(
            mockId,
            { [option]: { likes: userId } },
            { new: true },
        );
        res.status(200).send(mock);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Mock.findOneAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
