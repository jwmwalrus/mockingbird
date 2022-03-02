import { io } from '../../static/socket.io.esm.min.js';

import { getUserLoggedIn } from './util.js';

class Socket {
    constructor() {
        this.socket = io('http://localhost:3003');

        this.socket.emit('setup', getUserLoggedIn());

        this.socket.on('connected', () => {
            console.info('Socket is connected');
        });
    }

    emit(evt, payload = null) {
        if (payload) {
            this.socket.emit(evt, payload);
            return;
        }
        this.socket.emit(evt);
    }

    isConnected() {
        return this.socket.connected;
    }

    on(evt, cb) {
        this.socket.on(evt, cb);
    }
}

const socket = new Socket();

export default socket;
