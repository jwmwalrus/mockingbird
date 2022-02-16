import express from 'express';

import User from '../schemas/User.js';

const router = express.Router();

const getPayload = async (username, userLoggedIn) => {
    let profileUser;

    profileUser = await User.findOne({ username });
    if (profileUser == null) {
        profileUser = await User.findById(username);
        if (profileUser == null) {
            return {
                pageTitle: 'User not found',
                userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn),
            };
        }
    }

    return {
        pageTitle: profileUser.username,
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser,
    };
};

router.get('/', (req, res) => {
    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
    };
    res.status(200).render('profile', payload);
});

router.get('/:username', async (req, res) => {
    try {
        const payload = await getPayload(req.params.username, req.session.user);
        res.status(200).render('profile', payload);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:username/replies', async (req, res) => {
    try {
        const payload = await getPayload(req.params.username, req.session.user);
        payload.selectedTab = 'replies';
        res.status(200).render('profile', payload);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:username/following', async (req, res) => {
    try {
        const payload = await getPayload(req.params.username, req.session.user);
        payload.selectedTab = 'following';
        res.status(200).render('followersAndFollowing', payload);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

router.get('/:username/followers', async (req, res) => {
    try {
        const payload = await getPayload(req.params.username, req.session.user);
        payload.selectedTab = 'followers';
        res.status(200).render('followersAndFollowing', payload);
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});

export default router;
