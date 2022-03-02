import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notificationType: String,
    opened: {
        type: Boolean,
        default: false,
    },
    entityId: Schema.Types.ObjectId,
}, { timestamps: true });

NotificationSchema.statics.insertNotification = async (
    userTo,
    userFrom,
    notificationType,
    entityId,
) => {
    const data = {
        userTo,
        userFrom,
        notificationType,
        entityId,
    };

    try {
        await Notification.deleteOne(data);
        return Notification.create(data);
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
