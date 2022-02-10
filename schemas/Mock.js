import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MockSchema = new Schema({
    content: {
        type: String,
        trim: true,
    },
    mockedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pinned: Boolean,
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    remockUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    remockData: {
        type: Schema.Types.ObjectId,
        ref: 'Mock',
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Mock',
    },
}, { timestamps: true });

const Mock = mongoose.model('Mock', MockSchema);

export default Mock;
