// Collapse or uncollapse the clicked panel.
const togglePanel = (target) => {
    const panel = target.parentElement;
    panel.classList.toggle('collapsed');
}

// Send friend request to passed user from logged in user.
const addFriend = (user) => {
    console.log(user);
    sendData({ username: user.username }, '/friends/add');

    // Update button's text to reflect friendship.
    const friendBtn = document.getElementById('add-friend-btn');
    const friendText = friendBtn.querySelector('.panel-header');

    if (friendText.innerText === 'Add Friend') {
        friendText.innerText = 'Request Sent';
    }
}

// Send friend request to passed user from logged in user.
const acceptFriend = (e, username) => {
    console.log(username);
    sendData({ username: username }, '/friends/accept');
}

// Send the data with data and action arguments.
const sendData = (data, action) => {
    const XHR = new XMLHttpRequest();
    const FD = new FormData();

    // Push our data into our FormData object
    for (const [name, value] of Object.entries(data)) {
        FD.append(name, value);
    }

    // Define what happens in case of error
    XHR.addEventListener('error', (event) => {
        console.log('Oops! Something went wrong.');
    });

    // Set up our request
    XHR.open('POST', action);

    // Send our FormData object; HTTP headers are set automatically
    XHR.send(FD);
}