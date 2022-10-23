const io = require("socket.io")();
const socketapi = {
    io: io
};

// Room constructor.
function Room() {
    this.hostUser = null;
    this.guestUser = null;
    this.hostID = null;
    this.guestID = null;
}

let rooms = {};

// Add your socket.io logic here!
io.on('connection', (socket) => {
    console.log('a user connected');

    const socketID = socket.id;

    socket.on('join room', (key, user, id,) => {
        socket.join(key);

        let userHosting = false;


        // Room has not been created, make room and set user as host.
        if (rooms[key] === undefined || rooms[key]['hostUser'] === null) {
            rooms[key] = new Room();
            rooms[key]['hostUser'] = user; 
            rooms[key]['hostID'] = socketID; 
            userHosting = true;

        // Host has been set, set user to guest.
        } else if (rooms[key]['guestUser'] === null) { 
            rooms[key]['guestUser'] = user;
            rooms[key]['guestID'] = socketID; 
        }

        io.to(key).emit('join room', user, userHosting, rooms[key]['hostUser'], rooms[key]['guestUser'], id, rooms[key]);
    });

    // Clear both host and guest user.
    socket.on('disconnect', () => {
        console.log('user disconnected');

        Object.keys(rooms).forEach(key => {

            // If user was in a room, delete that room and send a 
            // message to their opponent.
            if (Object.values(rooms[key]).indexOf(socketID) > -1) {

                // If user was host, clear guest info, if user was
                // guest, promote to host.
                if (socketID !== rooms[key]['hostID']) {
                    console.log('user was hosting...')

                    rooms[key]['guestID'] = null;
                    rooms[key]['guestUser'] = null;

                // User was not host, promote to host and clear guest.
                } else {
                    console.log('user was guest, promoting...')

                    rooms[key]['hostID'] = rooms[key]['guestID'];
                    rooms[key]['hostUser'] = rooms[key]['guestUser'];

                    rooms[key]['guestID'] = null;
                    rooms[key]['guestUser'] = null;
                }

                io.to(key).emit('opponent left', rooms[key]);
                //delete rooms[key];

                console.log('room deleted')
            }
        });
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