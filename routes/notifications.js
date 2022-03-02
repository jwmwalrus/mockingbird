import express from 'express';

const router = express.Router();

const getPayload = (title, userLoggedIn) => ({
    pageTitle: title,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
});

router.get('/', (req, res) => {
    const payload = getPayload('Notifications', req.session.user);
    res.status(200).render('notifications', payload);
});

export default router;
