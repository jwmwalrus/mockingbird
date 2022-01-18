const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
        return;
    }

    res.redirect('/login');
};

const postTrimmer = (req, res, next) => {
    if (req.method === 'POST') {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof (value) === 'string') {
                req.body[key] = value.trim();
            }
        }
    }
    next();
};

export {
    requireLogin,
    postTrimmer,
};
