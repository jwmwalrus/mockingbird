import 'dotenv/config';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';

import './database.js';
import { requireLogin, postTrimmer } from './middleware.js';
import loginRoute from './routes/loginRoutes.js';
import registerRoute from './routes/registerRoutes.js';

const app = express();
const port = 3003;

app.listen(port, () => console.info(`Server listening on port ${port}`));

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(postTrimmer);
app.use(express.static(path.resolve('public')));
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
}));

app.use('/login', loginRoute);
app.use('/register', registerRoute);

app.get('/', requireLogin, (req, res) => {
    const payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
    };
    res.status(200).render('home', payload);
});
