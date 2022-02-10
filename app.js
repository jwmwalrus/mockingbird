import 'dotenv/config';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';

import './database.js';
import { requireLogin, postTrimmer } from './middleware.js';
import loginRoutes from './routes/login.js';
import mockRoutes from './routes/mocks.js';
import registerRoutes from './routes/register.js';
import logoutRoutes from './routes/logout.js';
import mocksApiRoutes from './routes/api/mocks.js';

const app = express();
const port = 3003;

app.listen(port, () => console.info(`Server listening on port ${port}`));

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(postTrimmer);
app.use(express.static(path.resolve('public')));
app.use(
    '/static',
    express.static(path.resolve('node_modules/bootstrap/dist')),
    express.static(path.resolve('node_modules/jquery/dist')),
    express.static(path.resolve('node_modules/@fortawesome/fontawesome-free')),
);
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
}));

app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);
app.use('/mocks', requireLogin, mockRoutes);

app.use('/api/mocks', mocksApiRoutes);

app.get('/', requireLogin, (req, res) => {
    const payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };
    res.status(200).render('home', payload);
});
