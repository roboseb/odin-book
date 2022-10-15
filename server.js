const io = require("socket.io")();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', (key) => {
        socket.join(key);
        console.log(key);
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('new game', (name) => {
        io.emit('new game', name);
    });
});

module.exports = socketapi;