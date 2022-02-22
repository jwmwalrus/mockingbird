import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    chatName: {
        type: String,
        trim: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    latestMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;
