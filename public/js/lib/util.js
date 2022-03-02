const getUserLoggedIn = () => {
    const item = window.sessionStorage.getItem('userLoggedIn');
    if (!item) { return null; }
    return JSON.parse(item);
};

const scrollIntoView = (selector) => {
    const fn = (s) => {
        const e = s instanceof Element || s instanceof HTMLElement
            ? s
            : document.querySelector(s);

        if (!e) {
            console.error('element not found:', s);
            return;
        }

        e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    };

    if (Array.isArray(selector)) {
        selector.forEach(fn);
        return;
    }

    fn(selector);
};

const timeElapsed = (current, previous) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return 'Just now';

        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    return Math.round(elapsed / msPerYear) + ' years ago';
};

export {
    getUserLoggedIn,
    scrollIntoView,
    timeElapsed,
};
