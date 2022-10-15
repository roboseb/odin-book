var socket = io();
const roomKey = makeid(6);

// Initialize current room.
socket.emit('join room', roomKey);

function makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const keyBox = document.getElementById('key-box');
keyBox.innerText = `Your Key: ${roomKey}`;

// Join a room using the inputted room key.
const joinRoom = () => {
    const keyInput = document.getElementById('join-game-input').value;
    socket.emit('join room', keyInput);
}