import { io } from '../../static/socket.io.esm.min.js';

import { getUserLoggedIn } from './util.js';

class Socket {
    constructor() {
        this.socket = io('http://localhost:3003');

        this.socket.emit('setup', getUserLoggedIn());

        this.socket.on('connected', () => {
            console.info('Socket is connected');
        });

        this.socket.on('message-received', (msg) => {
            const elems = document.querySelectorAll('.chat-container');
            if (elems.length > 0) {
                return;
            }

            // TODO: pop-up
            console.log('Must popup message');
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
