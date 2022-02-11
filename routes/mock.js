import express from 'express';

const router = express.Router();

router.get('/:id', (req, res) => {
    const payload = {
        pageTitle: 'View Mock',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        mockId: req.params.id,
    };
    res.status(200).render('mock', payload);
});

export default router;
