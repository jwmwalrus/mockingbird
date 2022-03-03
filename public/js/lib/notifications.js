const getNotificationText = (notifData) => {
    const { userFrom: from } = notifData;

    if (!from || !from.firstName || !from.lastName) {
        throw new Error('User from data not populated');
    }

    const fromName = `${from.firstName} ${from.lastName}`;
    switch (notifData.notificationType) {
        case 'remock':
            return `${fromName} remocked your mock`;
        case 'mock-like':
            return `${fromName} likes one of your mocks`;
        case 'reply':
            return `${fromName} replied to one of your mocks`;
        case 'follow':
            return `${fromName} followed you`;
        default:
    }

    return '';
};

const getNotificationUrl = (notifData) => {
    switch (notifData.notificationType) {
        case 'remock':
            // fallthrough
        case 'mock-like':
            // fallthrough
        case 'reply':
            return `/mock/${notifData.entityId}`;
        case 'follow':
            return `/profile/${notifData.entityId}`;
        default:
    }

    return '#';
};

const markNotificationAsRead = async (notifId = null, callback = null) => {
    let cb = callback;
    if (!cb) {
        cb = () => window.location.reload();
    }

    const url = notifId ? `/api/notifications/${notifId}/opened` : '/api/notifications/opened';

    try {
        const res = await fetch(url, { method: 'PUT' });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        cb();
    } catch (e) {
        console.error(e);
    }
};

const createNotificationHtml = (notifData) => {
    const details = document.createElement('span');
    details.classList.add('ellipsis');
    details.textContent = getNotificationText(notifData);

    const detailsc = document.createElement('div');
    detailsc.classList.add('results-details-container', 'ellipsis');
    detailsc.appendChild(details);

    const img = document.createElement('img');
    img.src = notifData.userFrom.profilePic;

    const imgc = document.createElement('div');
    imgc.classList.add('results-image-container');
    imgc.appendChild(img);

    const notif = document.createElement('a');
    notif.classList.add('results-list-item', 'notification');
    const href = getNotificationUrl(notifData);
    if (!notifData.opened) {
        notif.classList.add('active');
        notif.onclick = async (evt) => {
            evt.preventDefault();
            await markNotificationAsRead(
                notifData._id,
                () => { window.location = href; },
            );
        };
    }
    notif.href = href;
    notif.appendChild(imgc);
    notif.appendChild(detailsc);
    return notif;
};

const outputNotificstionList = async (notifications, selector) => {
    const parent = document.querySelector(selector);

    if (notifications.length === 0) {
        const span = document.createElement('span');
        span.classList.add('no-results');
        span.textContent = 'Nothing to show';
        parent.appendChild(span);
        return;
    }

    notifications.forEach(async (n) => {
        const node = await createNotificationHtml(n);
        parent.appendChild(node);
    });
};

const refreshBadge = async (type) => {
    let badgeId;
    switch (type) {
        case 'chats':
            badgeId = 'messages-badge';
            break;
        case 'notifications':
            badgeId = 'notifications-badge';
            break;
        default:
            return;
    }
    try {
        const query = new URLSearchParams();
        query.append('unreadOnly', true);

        const res = await fetch(`/api/${type}/?${query.toString()}`);
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }
        const data = await res.json();
        const badge = document.getElementById(badgeId);
        badge.innerText = data.length.toString();
        if (data.length > 0) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    } catch (e) {
        console.error(e);
    }
};

export {
    createNotificationHtml,
    markNotificationAsRead,
    outputNotificstionList,
    refreshBadge,
};
