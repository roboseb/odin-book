// Collapse or uncollapse the clicked panel.
const togglePanel = (target) => {
    const panel = target.parentElement;
    panel.classList.toggle('collapsed');
}

// Add event listeners to all panels.
const panels = Array.from(document.querySelectorAll('.panel-header'));
panels.forEach(header => {
    header.addEventListener('click', () => {
        togglePanel(header);
    });
});

let friendAdded = false

// Add event listener to button for adding a friend.
const addFriendButton = document.getElementById('add-friend-panel');
if (addFriendButton) {
    addFriendButton.addEventListener('click', () => {
        const user = JSON.parse(addFriendButton.getAttribute('user'));
        addFriend(user);
    })
}

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

// Add event listener to button for removing a friend.
const removeFriendButton = document.getElementById('remove-friend-btn');
if (removeFriendButton) {
    removeFriendButton.addEventListener('click', () => {
        const user = JSON.parse(removeFriendButton.getAttribute('user'));
        removeFriend(user);
    })
}

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

// Add event listener to button for removing a friend.
const acceptFriendButton = document.getElementById('accept-request-btn');
if (acceptFriendButton) {
    acceptFriendButton.addEventListener('click', (e) => {
        const request = JSON.parse(acceptFriendButton.getAttribute('request'));
        acceptFriend(e, request);
    })
}

// Send friend request to passed user from logged in user.
const acceptFriend = (e, username) => {
    sendData({ username: username }, '/friends/accept');
}

let likedComments = [];

// Like a comment.
const likeComment = (cmnt, event, username) => {
    const comment = JSON.parse(cmnt);
    const e = event.target

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

    if (e.innerText === 'Unlike') {
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
    const likeBox = e.parentElement.querySelector('.comment-like-count');
    likeBox.innerText = parseInt(likeBox.innerText) + likeMod;

    // Update text inside of like button.
    likeMod === 1 ? e.innerText = 'Unlike' : e.innerText = 'Like';
}

let likedPosts = [];

// Like a post.
const likePost = (p, event, username) => {
    const post = JSON.parse(p);
    const e = event.target;

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

    if (e.innerText === 'Unlike') {
        console.log('unliking....')

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
    const likeBox = e.parentElement.querySelector('.post-like-count');
    likeBox.innerText = parseInt(likeBox.innerText) + likeMod;

    // Update text inside of like button.
    likeMod === 1 ? e.innerText = 'Unlike' : e.innerText = 'Like';
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

    XHR.addEventListener('load', () => {
        console.log('request complete')
    })

    // Refresh the page once the DB data is updated.
    XHR.onreadystatechange = () => {

        // Prevent reloading page when like or unliking something.
        if (action === '/posts/like' || action === '/posts/unlike' ||
            action === '/comments/like' || action === '/comments/unlike') {
                return;
            }

        if (XHR.readyState == XMLHttpRequest.DONE) {
            window.location.reload();
        }
    }
}

// Create a single die.
const generateBasicDie = (box, color, index, customDie) => {
    const die = document.createElement('div');
    die.classList.add('cube', 'die');
    die.id = `die-${index}`;

    // Create each face of the die.
    for (let i = 1; i < 7; i++) {
        const dieFace = document.createElement('div');
        dieFace.classList.add('cube__face', `cube__face--${i}`);
        dieFace.style.backgroundColor = color;

        // Append a custom die base if any.
        if (customDie) {
            dieFace.style.backgroundImage = (`url('/images/bases/base_${customDie.base}.png')`)
            dieFace.classList.add('custom_face');
        }

        //Create each pip for each side of the die.
        for (let j = 1; j < i + 1; j++) {
            const pip = document.createElement('div');
            pip.classList.add('pip');
            dieFace.appendChild(pip);

            if (customDie) {
                pip.style.backgroundImage = (`url('/images/pips/pip_${customDie.pip}.png')`)
                pip.classList.add('custom_pip');
            }

            if (customDie && customDie.pipped) {
                pip.classList.add('pipped');
                pip.style.animationDelay = `${100 * j}ms`;
            }
        }

        // Append a custom die inlay if any.
        if (customDie) {
            const inlay = document.createElement('div');
            inlay.classList.add('inlay');
            inlay.style.backgroundImage = (`url('/images/inlays/inlay_${customDie.inlay}.png')`);
            dieFace.appendChild(inlay);
        }

        //  Add shine effect to a die with three matching parts.
        if (customDie && customDie.shine) {
            const shine = document.createElement('div');
            shine.classList.add('shine');
            dieFace.appendChild(shine);
        }

        die.appendChild(dieFace);
    }

    // Add die to passed box argument.
    const container = document.getElementById(box);
    container.appendChild(die);
}

// Add event listener to button for liking a comment
const likeCommentButtons = Array.from(document.querySelectorAll('.like-comment-btn'));
likeCommentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        likeComment(button.getAttribute('comment'), e, button.getAttribute('username'));
    });
});

// Add event listener to button for liking a post.
const likePostButtons = Array.from(document.querySelectorAll('.like-post-btn'));
likePostButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        likePost(button.getAttribute('post'), e, button.getAttribute('username'));
    });
});

let generatedDice = 1;
let credits = 0;

//Add event listener to button for buying and generating a new die.
const dieBuyButton = document.getElementById('buy-die-btn');
if (dieBuyButton) {
    dieBuyButton.addEventListener('click', () => {

        // Prevent purchasing a die with no credits.
        if (credits < 1) {
            dieBuyButton.classList.remove('unafford', 'cranked');
            void dieBuyButton.offsetHeight;
            dieBuyButton.classList.add('unafford');
            return;
        }

        credits--;
        const credDisplay = document.getElementById('gacha-credits');
        credDisplay.innerText = credits.toString().padStart(2, '0');


        lastDie = document.getElementById(`die-${generatedDice}`)
        lastDie.classList.add('stored');

        const skins = ['skull', 'heart', 'panel', 'hedron']

        const die = {
            pip: skins[Math.floor(Math.random() * skins.length)],
            inlay: skins[Math.floor(Math.random() * skins.length)],
            base: skins[Math.floor(Math.random() * skins.length)],
            shine: false,
            pipped: Math.floor(Math.random() * 4) === 1
        }

        // Add sparkle effect if die's parts all match.
        if (die.pip === die.inlay && die.pip === die.base) {
            die.shine = true;
        }

        generatedDice++;
        generateBasicDie('gacha-spout', 'khaki', generatedDice, die);

        dieBuyButton.classList.remove('cranked', 'unafford');
        void dieBuyButton.offsetHeight;
        dieBuyButton.classList.add('cranked');


        // If user is signed in, save die to their account, and deduct likes.
        const userInfo = document.getElementById('user-info');
        let user = userInfo.getAttribute('user');
        if (user !== '') {
            user = JSON.parse(user);
            sendData({ user: user, die: JSON.stringify(die) }, '/dice/add');
        }
    });
}

// Add event listener for spenting likes on dice tokens.
const slot = document.getElementById('gacha-slot');
if (slot) {
    slot.addEventListener('click', () => {
        slot.classList.remove('coined');
        void slot.offsetHeight;
        slot.classList.add('coined');

        credits++;
        const credDisplay = document.getElementById('gacha-credits');
        credDisplay.innerText = credits.toString().padStart(2, '0');
    });
}

const setDieButtons = Array.from(document.querySelectorAll('.set-die-btn'));
setDieButtons.forEach(button => {
    button.addEventListener('click', () => {
        const index = parseInt(button.id.slice(-5, -4));

        const userInfo = document.getElementById('user-info');
        let user = JSON.parse(userInfo.getAttribute('user'));

        let dieUsed = false;

        const targetDie = document.querySelector(`.scroller-${dieIndex}`)
        const dieObj = targetDie.getAttribute('die');

        Object.keys(user.setDice).forEach(slot => {
            if (user.setDice[slot] !== null && user.setDice[slot]._id ===
                JSON.parse(dieObj)._id) {
                dieUsed = true;
            }
        });

        if (dieUsed) {
            showModal('That die is already being used!')
            return;
        }

        sendData({ die: dieObj, index: index }, '/dice/set');
    });
});

// Add event listeners to buttons for cycling through user's dice.
let dieIndex = 0;

// Cycle backwards through a user's dice.
const lastDieButton = document.getElementById('last-die-btn');
if (lastDieButton) {
    lastDieButton.addEventListener('click', () => {
        dieIndex--;
        updateScroller();
    });
}

// Cycle forwards through a user's dice.
const nextDieButton = document.getElementById('next-die-btn');
if (nextDieButton) {
    nextDieButton.addEventListener('click', () => {
        dieIndex++;
        updateScroller();
    });
}

// Cycle through a user's dice on their profile page.
const updateScroller = () => {
    // Count all dice in scroller to see max position.
    const scrollers = Array.from(document.querySelectorAll('.scroller'));
    const scrollLength = scrollers.length;

    if (dieIndex > scrollLength - 1) dieIndex = scrollLength - 1;
    if (dieIndex < 0) dieIndex = 0;

    const targetDie = document.querySelector(`.scroller-${dieIndex}`)

    scrollers.forEach(die => {
        die.classList.remove('shown');
    });

    targetDie.classList.add('shown');

    const die = JSON.parse(targetDie.getAttribute('die'));

    // Update die details in detail panel.
    const pips = document.getElementById('pips-name');
    const base = document.getElementById('base-name');
    const inlay = document.getElementById('inlay-name');

    pips.innerText = die.pip;
    base.innerText = die.base;
    inlay.innerText = die.inlay;

    const pippedInfo = document.getElementById('pipped-info');
    const shineInfo = document.getElementById('shine-info');

    shineInfo.innerText = die.shine ? 'Shiny!' : 'Not shiny';
    pippedInfo.innerText = die.pipped ? 'Pipped!' : 'Not pipped';


    console.log(JSON.parse(targetDie.getAttribute('die')));
}

// Setup initial die details.
updateScroller();

// Display a Modal message.
let modalT;
const showModal = (message) => {
    clearTimeout(modalT);

    const modal = document.getElementById('modal-message');
    modal.innerText = message;
    modal.parentElement.classList.remove('shown');
    void modal.parentElement.offsetHeight;
    modal.parentElement.classList.add('shown');

    modalT = setTimeout(() => {
        modal.parentElement.classList.remove('shown');
    }, 2000);
}

// Add event listeners to buttons for unequiping dice.
const unequipButtons = Array.from(document.querySelectorAll('.unequip-btn'));
if (unequipButtons) {
    unequipButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(button.getAttribute('key'));
            sendData({key: button.getAttribute('key')}, '/dice/unequip');
        }); 
    });
}