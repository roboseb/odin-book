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

    socket.on('new game', (key, state) => {
        io.to(key).emit('new game', state);
    });

    socket.on('roll die', (key, die, state) => {
        io.to(key).emit('roll die', die, state);
    })

    socket.on('keep die', (key, position, kept, state) => {
        console.log('keeping...')
        console.log(state)
        io.to(key).emit('keep die', position, kept, state);
    })

    socket.on('count die', (key, position, kept, state) => {
        console.log('counting...')
        io.to(key).emit('count die', position, kept, state);
    })

    socket.on('mouseenter', (key, index, host, box) => {
        io.to(key).emit('mouseenter', index, host, box);
    });

    socket.on('mouseleave', (key, index, host, box) => {
        io.to(key).emit('mouseleave', index, host, box);
    });

    socket.on('end turn', (key, state, host) => {
        io.to(key).emit('end turn', state, host);
    });

    // Send a message to all users in the current room.
    socket.on('message', (text, key) => {
        io.to(key).emit('message', text);
    });
});

module.exports = socketapi;