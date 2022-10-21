const io = require("socket.io")();
const socketapi = {
    io: io
};

let hostUser;
let guestUser;

// Add your socket.io logic here!
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', (key, user, id) => {
        socket.join(key);

        let userHosting = false;

        console.log('host user is: ' + hostUser)

        // Host has not been set yet, set user to host.
        if (hostUser === undefined) {
            console.log('host set')
            hostUser = user; 
            userHosting = true;

        // Host has been set, set user to guest.
        } else if (hostUser !== undefined) { 
            guestUser = user;
            console.log('guest set');
        }

        // if (guestUser) {
        //     console.log('host dice: ')
        //     console.log(guestUser.setDice[1]);
        // }

        // if (hostUser) {
        //     console.log('host dice: ')
        //     console.log(hostUser.setDice[1]);
        // }
        

        io.to(key).emit('join room', user, userHosting, hostUser, guestUser, id);
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