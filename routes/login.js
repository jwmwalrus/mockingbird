import express from 'express';
import bcrypt from 'bcrypt';

import User from '../schemas/User.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).render('login');
});

router.post('/', async (req, res) => {
    const { logUsername, logPassword } = req.body;
    const payload = { ...req.body };

    if (!(req.body.logUsername && req.body.logPassword)) {
        payload.errorMessage = 'Make sure each field has a valid value';
        res.status(200).render('login', payload);
        return;
    }

    let user;
    try {
        user = await User.findOne({
            $or: [
                { username: logUsername },
                { email: logUsername },
            ],
        });

        if (!user) {
            throw new Error('Incorrect credentials');
        }
        const matches = await bcrypt.compare(logPassword, user.password);
        if (!matches) {
            throw new Error('Incorrect credentials');
        }
    } catch (e) {
        payload.errorMessage = e.message;
        res.status(200).render('login', payload);
        return;
    }

    req.session.user = user;
    res.redirect('/');
});

export default router;
