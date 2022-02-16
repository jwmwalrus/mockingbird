import express from 'express';

const router = express.Router();

const getPayload = (userLoggedIn) => ({
    pageTitle: 'Search',
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
});

router.get('/', (req, res) => {
    const payload = getPayload(req.session.user);
    res.status(200).render('search', payload);
});

router.get('/:selectedTab', (req, res) => {
    const payload = getPayload(req.session.user);
    payload.selectedTab = req.params.selectedTab;
    res.status(200).render('search', payload);
});

export default router;
