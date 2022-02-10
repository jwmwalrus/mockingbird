import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy(() => res.redirect('/login'));
    }
});

export default router;
