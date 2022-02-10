import express from 'express';
import bcrypt from 'bcrypt';

import User from '../schemas/User.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).render('register');
});

router.post('/', async (req, res) => {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
    } = req.body;
    const payload = { ...req.body };

    if (!(firstName && lastName && username && email && password)) {
        payload.errorMessage = 'Make sure each field has a valid value';
        res.status(200).render('register', payload);
        return;
    }

    let newUser;
    try {
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            if (user.email === email) {
                throw new Error('Email already in use');
            }
            throw new Error('Username already in use');
        }

        const data = {
            firstName,
            lastName,
            username,
            email,
            password,
        };
        data.password = await bcrypt.hash(password, 10);
        newUser = await User.create(data);
    } catch (e) {
        console.error(e);
        payload.errorMessage = e.message;
        res.status(200).render('register', payload);
        return;
    }

    req.session.user = newUser;
    res.redirect('/');
});

export default router;
