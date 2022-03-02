import 'dotenv/config';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import { Server as IOServer } from 'socket.io';

import './database.js';
import { requireLogin, postTrimmer } from './middleware.js';
import loginRoutes from './routes/login.js';
import registerRoutes from './routes/register.js';
import logoutRoutes from './routes/logout.js';

import mocksApiRoutes from './routes/api/mocks.js';
import usersApiRoutes from './routes/api/users.js';
import chatsApiRoutes from './routes/api/chats.js';
import messagesApiRoutes from './routes/api/messages.js';
import notificationsApiRoutes from './routes/api/notifications.js';

import mockRoutes from './routes/mock.js';
import profileRoutes from './routes/profile.js';
import searchRoutes from './routes/search.js';
import inboxRoutes from './routes/inbox.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const port = 3003;

const server = app.listen(port, () => console.info(`Server listening on port ${port}`));
const io = new IOServer(server, { pingTimeout: 60000 });

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
    express.static(path.resolve('node_modules/cropperjs/dist')),
    express.static(path.resolve('node_modules/socket.io/client-dist')),
);
app.use(
    '/uploads',
    express.static(path.resolve('uploads')),
);
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
}));

app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);

app.use('/api/mocks', mocksApiRoutes);
app.use('/api/users', usersApiRoutes);
app.use('/api/chats', chatsApiRoutes);
app.use('/api/messages', messagesApiRoutes);
app.use('/api/notifications', notificationsApiRoutes);

app.use('/mock', requireLogin, mockRoutes);
app.use('/profile', requireLogin, profileRoutes);
app.use('/search', requireLogin, searchRoutes);
app.use('/inbox', requireLogin, inboxRoutes);
app.use('/notifications', requireLogin, notificationsRoutes);

app.get('/', requireLogin, (req, res) => {
    const payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };
    res.status(200).render('home', payload);
});

io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join room', (room) => socket.join(room));
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing'));

    socket.on('new-message', (msg) => {
        const { chat } = msg;
        if (!chat.users) {
            console.error('Chat users not defned');
            return;
        }

        chat.users.forEach((u) => {
            if (u._id === msg.sender._id) {
                return;
            }

            socket.in(u._id).emit('message-received', msg);
            socket.in(u._id).emit('chat-message-received', msg);
        });
    });
});
