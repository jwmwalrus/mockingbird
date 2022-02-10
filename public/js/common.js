const getUserLoggedIn = () => {
    const item = window.sessionStorage.getItem('userLoggedIn');
    if (!item) { return null; }
    return JSON.parse(item);
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

const handleLikes = async (btn, mockData) => {
    try {
        const res = await fetch(`/api/mocks/${mockData._id}/like`, {
            method: 'PUT',
        });
        const mock = await res.json();
        const str = mock.likes.length > 0 ? mock.likes.length.toString() : '';
        const span = btn.querySelector('span');
        if (span) {
            span.textContent = str;
        }

        const user = getUserLoggedIn();
        if (user && mock.likes.includes(user._id)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    } catch (e) {
        console.error(e);
    }
};

const handleRemocks = async (btn, mockData) => {
    try {
        const res = await fetch(`/api/mocks/${mockData._id}/remock`, {
            method: 'POST',
        });
        const mock = await res.json();
        const str = mock.remockUsers.length > 0 ? mock.remockUsers.length.toString() : '';
        const span = btn.querySelector('span');
        if (span) {
            span.textContent = str;
        }

        const user = getUserLoggedIn();
        if (user && mock.remockUsers.includes(user._id)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    } catch (e) {
        console.error(e);
    }
};

const setMocOnReplyModal = (node, id) => {
    const parent = document.querySelector('#originalMockContainer');
    parent.innerHTML = '';
    parent.append(node);

    document.querySelector('#replyTextarea').value = '';

    const btn = document.querySelector('#submitReplyBtn');
    btn.setAttribute('data-id', id.toString());
    btn.disabled = true;
};

const createMockHtml = (mockData, outstanding = false) => {
    if (!mockData) {
        console.error('There is no mock data to create HTML');
        return null;
    }

    const isRemock = mockData.remockData !== undefined;
    const isReply = mockData.replyTo !== undefined && mockData.replyTo._id !== undefined;

    const remockedBy = isRemock ? mockData.mockedBy.username : null;
    const replyTo = isReply ? mockData.replyTo?.mockedBy.username : null;

    const data = isRemock ? mockData.remockData : mockData;

    const { mockedBy } = data;
    if (mockedBy._id === undefined) {
        console.error('User object not populated');
        return null;
    }

    const displayName = `${mockedBy.firstName} ${mockedBy.lastName}`;
    const user = getUserLoggedIn();

    const img = document.createElement('img');
    const imgc = document.createElement('div');
    img.src = mockedBy.profilePic;
    imgc.classList.add('userImageContainer');
    imgc.appendChild(img);

    const profileLink = document.createElement('a');
    profileLink.classList.add('displayName');
    profileLink.href = '/profile/%{mockedBy.username}';
    profileLink.textContent = displayName;

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = '@' + mockedBy.username;

    const tstamp = document.createElement('span');
    tstamp.classList.add('date');
    tstamp.textContent = timeElapsed(new Date(), new Date(data.createdAt));

    const header = document.createElement('div');
    header.classList.add('mockHeader');
    header.appendChild(profileLink);
    header.appendChild(username);
    header.appendChild(tstamp);

    const bodyContent = document.createElement('span');
    const body = document.createElement('div');
    bodyContent.textContent = data.content;
    body.classList.add('mockBody');
    body.appendChild(bodyContent);

    const btn1 = document.createElement('button');
    const btn1c = document.createElement('div');
    btn1.innerHTML = '<i class="fas fa-comment"></i>';
    btn1.setAttribute('data-bs-toggle', 'modal');
    btn1.setAttribute('data-bs-target', '#replyModal');
    btn1c.classList.add('mockBtnContainer');
    btn1c.appendChild(btn1);

    const btn2 = document.createElement('button');
    const btn2c = document.createElement('div');
    btn2.innerHTML = `
        <i class="fas fa-retweet"></i>
        <span>${data.remockUsers.length || ''}</span>
    `;
    btn2.classList.add('remockBtn');
    if (user && data.remockUsers.includes(user._id)) {
        btn2.classList.add('active');
    }
    btn2.onclick = () => { handleRemocks(btn2, data); };
    btn2c.classList.add('mockBtnContainer', 'green');
    btn2c.appendChild(btn2);

    const btn3 = document.createElement('button');
    const btn3c = document.createElement('div');
    btn3.innerHTML = `
        <i class="fas fa-heart"></i>
        <span>${data.likes.length || ''}</span>
    `;
    btn3.classList.add('likeBtn');
    if (user && data.likes.includes(user._id)) {
        btn3.classList.add('active');
    }
    btn3.onclick = () => { handleLikes(btn3, data); };
    btn3c.classList.add('mockBtnContainer', 'red');
    btn3c.appendChild(btn3);

    const footer = document.createElement('div');
    footer.classList.add('mockFooter');
    footer.appendChild(btn1c);
    footer.appendChild(btn2c);
    footer.appendChild(btn3c);

    const content = document.createElement('div');
    content.classList.add('mockContentContainer');
    content.appendChild(header);
    if (replyTo) {
        const replying = document.createElement('div');
        replying.classList.add('replyFlag');
        replying.innerHTML = `
            Replying to <a href="/profile/${replyTo}">@${replyTo}</a>
        `;
        content.appendChild(replying);
    }
    content.appendChild(body);
    content.appendChild(footer);

    const main = document.createElement('div');
    main.classList.add('mainContentContainer');
    main.appendChild(imgc);
    main.appendChild(content);

    const action = document.createElement('div');
    action.classList.add('mockActionContainer');
    if (remockedBy) {
        const remocker = document.createElement('span');
        remocker.innerHTML = `
            <i class="fas fa-retweet"></i>
            Remocked by <a href="/profile/${remockedBy}">@${remockedBy}</a>
        `;
        action.appendChild(remocker);
    }

    const mock = document.createElement('div');
    mock.classList.add('mock');
    if (outstanding) {
        mock.classList.add('outstanding');
    }
    mock.onclick = (evt) => {
        if (evt.target.tagName !== 'DIV') { return; }
        window.location.href = '/mocks/' + data._id;
    };
    mock.appendChild(action);
    mock.appendChild(main);

    btn1.onclick = () => { setMocOnReplyModal(mock.cloneNode(true), data._id); };

    return mock;
};

const outputMocks = (mocks, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (mocks.length === 0) {
        const noResults = document.createElement('span');
        noResults.classList.add('noResults');
        noResults.textContent = 'Nothing to show';

        parent.appendChild(noResults);
        return;
    }

    mocks.forEach((p) => {
        const node = createMockHtml(p);
        parent.append(node);
    });
};

const outputMockWithReplies = (results, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (results.replyTo) {
        const node = createMockHtml(results.replyTo);
        parent.append(node);
    }

    const node = createMockHtml(results.mock, true);
    parent.append(node);

    results.replies.forEach((p) => {
        const node = createMockHtml(p);
        parent.append(node);
    });
};

const onTextareaInput = (evt, submitBtn) => {
    const value = evt.target.value.trim();
    submitBtn.disabled = value === '';
};

const submitMock = async (textarea, submitBtn) => {
    const data = {
        content: textarea.value,
    };

    const replyTo = submitBtn.getAttribute('data-id');
    if (replyTo) {
        data.replyTo = replyTo;
    }

    try {
        const res = await fetch('/api/mocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (![200, 201].includes(res.status)) {
            throw new Error(res.statusText);
        }
        const newMock = await res.json();

        if (newMock.replyTo) {
            window.location.reload();
            return;
        }

        const node = createMockHtml(newMock);
        const parent = document.querySelector('.mocksContainer');
        parent.prepend(node);

        textarea.value = '';
        submitBtn.disabled = true;
    } catch (e) {
        console.error(e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const submitMockBtn = document.getElementById('submitMockBtn');
    const mockTextarea = document.getElementById('mockTextarea');

    if (mockTextarea) {
        mockTextarea.oninput = (evt) => onTextareaInput(evt, submitMockBtn);
    }

    if (submitMockBtn) {
        submitMockBtn.onclick = async () => { await submitMock(mockTextarea, submitMockBtn); };
    }

    const submitReplyBtn = document.getElementById('submitReplyBtn');
    const replyTextarea = document.getElementById('replyTextarea');

    if (replyTextarea) {
        replyTextarea.oninput = (evt) => onTextareaInput(evt, submitReplyBtn);
    }

    if (submitReplyBtn) {
        submitReplyBtn.onclick = async () => { await submitMock(replyTextarea, submitReplyBtn); };
    }
});

export default {
    createMockHtml,
    outputMocks,
    outputMockWithReplies,
    timeElapsed,
};
