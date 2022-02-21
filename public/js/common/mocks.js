import { timeElapsed, getUserLoggedIn } from './util.js';

const handleLikes = async (btn, mockData) => {
    try {
        const res = await fetch(`/api/mocks/${mockData._id}/like`, { method: 'PUT' });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

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
        const res = await fetch(`/api/mocks/${mockData._id}/remock`, { method: 'POST' });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

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

const setDeleteMockModal = (id) => {
    const btn = document.getElementById('delete-mock-button');
    btn.setAttribute('data-id', id.toString());
};

const setPinMockModal = (id, pinned) => {
    const btn = document.getElementById('pin-mock-button');
    const label = document.getElementById('confirm-pin-modal-label');
    label.textContent = pinned ? 'Unpin this mock?' : 'Pin this mock?';
    btn.textContent = pinned ? 'Unpin' : 'Pin';
    btn.setAttribute('data-id', id.toString());
    btn.setAttribute('data-pinval', pinned ? '0' : '1');
};

const setReplyMockModal = (node, id) => {
    const parent = document.getElementById('original-mock-container');
    parent.innerHTML = '';
    parent.append(node);

    document.getElementById('reply-mock-textarea').value = '';

    const btn = document.getElementById('submit-reply-mock-button');
    btn.setAttribute('data-id', id.toString());
    btn.disabled = true;
};

const createMockHtml = async (mockData, outstanding = false) => {
    if (!mockData) {
        console.error('There is no mock data to create HTML');
        return null;
    }

    const isRemock = !!mockData.remockData;
    const isReply = mockData.replyTo && mockData.replyTo._id !== undefined;

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
    imgc.classList.add('user-image-container');
    imgc.appendChild(img);

    const profileLink = document.createElement('a');
    profileLink.classList.add('display-name');
    profileLink.href = `/profile/${mockedBy.username}`;
    profileLink.textContent = displayName;

    const username = document.createElement('span');
    username.classList.add('username');
    username.textContent = '@' + mockedBy.username;

    const tstamp = document.createElement('span');
    tstamp.classList.add('date');
    tstamp.textContent = timeElapsed(new Date(), new Date(data.createdAt));

    const header = document.createElement('div');
    header.classList.add('mock-header');
    header.appendChild(profileLink);
    header.appendChild(username);
    header.appendChild(tstamp);
    if (data.mockedBy._id === getUserLoggedIn()._id) {
        const pinBtn = document.createElement('button');
        pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
        pinBtn.setAttribute('data-id', data._id);
        pinBtn.setAttribute('data-bs-toggle', 'modal');
        pinBtn.setAttribute('data-bs-target', '#confirm-pin-modal');
        pinBtn.classList.add('pin-button');
        if (data.pinned) {
            pinBtn.classList.add('active');
        }
        pinBtn.onclick = () => { setPinMockModal(data._id, data.pinned); };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.setAttribute('data-id', data._id);
        deleteBtn.setAttribute('data-bs-toggle', 'modal');
        deleteBtn.setAttribute('data-bs-target', '#delete-mock-modal');
        deleteBtn.onclick = () => { setDeleteMockModal(data._id); };

        header.appendChild(pinBtn);
        header.appendChild(deleteBtn);
    }

    const bodyContent = document.createElement('span');
    const body = document.createElement('div');
    bodyContent.textContent = data.content;
    body.classList.add('mock-body');
    body.appendChild(bodyContent);

    const btn1 = document.createElement('button');
    const btn1c = document.createElement('div');
    btn1.innerHTML = '<i class="fas fa-comment"></i>';
    btn1.setAttribute('data-bs-toggle', 'modal');
    btn1.setAttribute('data-bs-target', '#reply-mock-modal');
    btn1c.classList.add('mock-button-container');
    btn1c.appendChild(btn1);

    const btn2 = document.createElement('button');
    const btn2c = document.createElement('div');
    btn2.innerHTML = `
        <i class="fas fa-retweet"></i>
        <span>${data.remockUsers.length || ''}</span>
    `;
    btn2.classList.add('remock-button');
    if (user && data.remockUsers.includes(user._id)) {
        btn2.classList.add('active');
    }
    btn2.onclick = async () => { await handleRemocks(btn2, data); };
    btn2c.classList.add('mock-button-container', 'green');
    btn2c.appendChild(btn2);

    const btn3 = document.createElement('button');
    const btn3c = document.createElement('div');
    btn3.innerHTML = `
        <i class="fas fa-heart"></i>
        <span>${data.likes.length || ''}</span>
    `;
    btn3.classList.add('like-button');
    if (user && data.likes.includes(user._id)) {
        btn3.classList.add('active');
    }
    btn3.onclick = async () => { await handleLikes(btn3, data); };
    btn3c.classList.add('mock-button-container', 'red');
    btn3c.appendChild(btn3);

    const footer = document.createElement('div');
    footer.classList.add('mock-footer');
    footer.appendChild(btn1c);
    footer.appendChild(btn2c);
    footer.appendChild(btn3c);

    const content = document.createElement('div');
    content.classList.add('mock-content-container');
    if (data.pinned) {
        const pinnedText = document.createElement('div');
        pinnedText.classList.add('pinned-mock-text');
        pinnedText.innerHTML = '<i class="fas fa-thumbtack"></i><span>Pinned mock</span>';
        content.appendChild(pinnedText);
    }
    content.appendChild(header);
    if (replyTo) {
        const replying = document.createElement('div');
        replying.classList.add('reply-flag');
        replying.innerHTML = `
            Replying to <a href="/profile/${replyTo}">@${replyTo}</a>
        `;
        content.appendChild(replying);
    }
    content.appendChild(body);
    content.appendChild(footer);

    const main = document.createElement('div');
    main.classList.add('main-content-container');
    main.appendChild(imgc);
    main.appendChild(content);

    const action = document.createElement('div');
    action.classList.add('mock-action-container');
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
        window.location.href = '/mock/' + data._id;
    };
    mock.appendChild(action);
    mock.appendChild(main);

    btn1.onclick = () => { setReplyMockModal(mock.cloneNode(true), data._id); };

    return mock;
};

const outputMocks = (mocks, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (mocks.length === 0) {
        const noResults = document.createElement('span');
        noResults.classList.add('no-results');
        noResults.textContent = 'Nothing to show';

        parent.appendChild(noResults);
        return;
    }

    mocks.forEach(async (m) => {
        const node = await createMockHtml(m);
        parent.append(node);
    });
};

const outputMockWithReplies = async (results, selector) => {
    const parent = document.querySelector(selector);
    parent.innerHTML = '';

    if (results.replyTo) {
        const node = await createMockHtml(results.replyTo);
        parent.append(node);
    }

    const node = await createMockHtml(results.mock, true);
    parent.append(node);

    results.replies.forEach(async (m) => {
        const node = await createMockHtml(m);
        parent.append(node);
    });
};

const onTextareaInput = (evt, submitBtn) => {
    const value = evt.target.value.trim();
    submitBtn.disabled = value === '';
};

const pinMock = async (btn) => {
    const mockId = btn.getAttribute('data-id');
    const pinval = btn.getAttribute('data-pinval');
    if (!mockId) {
        console.error('The `data-id` attribute does not contain the id to pin mock');
        return;
    }

    try {
        const res = await fetch(`/api/mocks/${mockId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinned: pinval === '1' }),
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }
        window.location.reload();
    } catch (e) {
        console.error(e);
    }
};

const deleteMock = async (btn) => {
    const mockId = btn.getAttribute('data-id');
    if (!mockId) {
        console.error('The `data-id` attribute does not contain the id to delete mock');
        return;
    }

    try {
        const res = await fetch(`/api/mocks/${mockId}`, { method: 'DELETE' });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }
        window.location.reload();
    } catch (e) {
        console.error(e);
    }
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
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.statusText} - ${msg}`);
        }

        const newMock = await res.json();

        if (newMock.replyTo) {
            window.location.reload();
            return;
        }

        const node = await createMockHtml(newMock);
        const parent = document.querySelector('.mocks-container');
        parent.prepend(node);

        textarea.value = '';
        submitBtn.disabled = true;
    } catch (e) {
        console.error(e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const submitMockBtn = document.getElementById('submit-mock-button');
    const mockTextarea = document.getElementById('mock-textarea');

    if (mockTextarea) {
        mockTextarea.oninput = (evt) => onTextareaInput(evt, submitMockBtn);
    }

    if (submitMockBtn) {
        submitMockBtn.onclick = async () => { await submitMock(mockTextarea, submitMockBtn); };
    }

    const submitReplyBtn = document.getElementById('submit-reply-mock-button');
    const replyTextarea = document.getElementById('reply-mock-textarea');

    if (replyTextarea) {
        replyTextarea.oninput = (evt) => onTextareaInput(evt, submitReplyBtn);
    }

    if (submitReplyBtn) {
        submitReplyBtn.onclick = async () => { await submitMock(replyTextarea, submitReplyBtn); };
    }

    const pinMockBtn = document.getElementById('pin-mock-button');
    if (pinMockBtn) {
        pinMockBtn.onclick = async () => { await pinMock(pinMockBtn); };
    }

    const deleteMockBtn = document.getElementById('delete-mock-button');
    if (deleteMockBtn) {
        deleteMockBtn.onclick = async () => { await deleteMock(deleteMockBtn); };
    }
});

export {
    createMockHtml,
    outputMocks,
    outputMockWithReplies,
};
