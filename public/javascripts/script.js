// Collapse or uncollapse the clicked panel.
const togglePanel = (target) => {
    const panel = target.parentElement;
    panel.classList.toggle('collapsed');
}

let friendAdded = false

// Send friend request to passed user from logged in user.
const addFriend = (user) => {
    if (friendAdded) {
        alert('already added as friend');
        return;
    }

    friendAdded = true;

    sendData({ username: user.username }, '/friends/add');

    // Update button's text to reflect friendship.
    const friendBtn = document.getElementById('add-friend-btn');
    const friendText = friendBtn.querySelector('.panel-header');

    if (friendText.innerText === 'Add Friend') {
        friendText.innerText = 'Request Sent';
    }
}

let friendRemoved = false;

// Send friend request to passed user from logged in user.
const removeFriend = (user) => {

    if (friendRemoved) {
        alert('already removed from friends');
        return;
    }

    friendRemoved = true;

    sendData({ username: user.username }, '/friends/remove');

    // Update button's text to reflect friendship.
    const friendBtn = document.getElementById('remove-friend-btn');
    const friendText = friendBtn.querySelector('.panel-header');

    if (friendText.innerText === 'Remove friend') {
        friendText.innerText = 'Friend removed';
    }
}

// Send friend request to passed user from logged in user.
const acceptFriend = (e, username) => {
    sendData({ username: username }, '/friends/accept');
}

let likedComments = [];

// Like a comment.
const likeComment = (comment, e, username) => {

    // Add comment to likedComments, and process its liked state.
    if (!likedComments.some(e => e._id === comment._id)) {

        let newComment = {
            liked: comment.likedUsers.some(e => e.username === username) ? true : false,
            _id: comment._id
        }

        likedComments.push(newComment);
    }

    // Prevent liking a comment multiple times.
    let likeMod = 1;
    let route = '/comments/like';

    if (likedComments.some(e => e._id === comment._id && e.liked === true)) {
        likeMod = -1;
        route = '/comments/unlike';

        // Remove comment from liked comments.
        const index = likedComments.findIndex(p => p._id == comment._id);
        likedComments[index].liked = false;

    } else {
        // Add comment to liked comments.
        const index = likedComments.findIndex(p => p._id == comment._id);
        likedComments[index].liked = true;
    }

    sendData({ id: comment._id, username: comment.username }, route);

    // Locally update the displayed like count.
    const likeBox = e.target.parentElement.querySelector('.comment-like-count');
    likeBox.innerText = parseInt(likeBox.innerText) + likeMod;

    // Update text inside of like button.
    likeMod === 1 ? e.target.innerText = 'Unlike' : e.target.innerText = 'Like';
}

let likedPosts = [];

// Like a post.
const likePost = (post, e, username) => {

    // Add post to likedPosts, and process its liked state.
    if (!likedPosts.some(e => e._id === post._id)) {

        let newPost = {
            liked: post.likedUsers.some(e => e.username === username) ? true : false,
            _id: post._id
        }

        likedPosts.push(newPost);
    }

    // Prevent liking a post multiple times.
    let likeMod = 1;
    let route = '/posts/like';

    if (likedPosts.some(e => e._id === post._id && e.liked === true)) {
        likeMod = -1;
        route = '/posts/unlike';

        // Remove post from liked posts.
        const index = likedPosts.findIndex(p => p._id == post._id);
        likedPosts[index].liked = false;

    } else {
        // Add post to liked posts.
        const index = likedPosts.findIndex(p => p._id == post._id);
        likedPosts[index].liked = true;
    }

    sendData({ id: post._id, username: post.username }, route);

    // Locally update the displayed like count.
    const likeBox = e.target.parentElement.querySelector('.post-like-count');
    likeBox.innerText = parseInt(likeBox.innerText) + likeMod;

    // Update text inside of like button.
    likeMod === 1 ? e.target.innerText = 'Unlike' : e.target.innerText = 'Like';
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