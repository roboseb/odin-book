var socket = io();
// const roomKey = makeid(6);
const roomKey = '111111';
let currentKey = roomKey;

const userID = makeid(20);
let multi = false;

let host = false;

// If user is signed in, save die to their account, and deduct likes.
const userInfo = document.getElementById('user-info');
let user = userInfo.getAttribute('user');
if (user !== '') {
    user = JSON.parse(user);
}

// Basic setup for if playing multiplayer.
const keyBox = document.getElementById('key-box');
if (keyBox) multi = true;

const initialize = (() => {
    if (!multi) return;

    keyBox.innerText = `Current Room: ${roomKey}`;
    multi = true;
})();

// Initialize current room.
// if (multi) {
//     socket.emit('join room', roomKey, user, host);
// }

let hostSet = false;

// Socket listener for getting opponent information
socket.on('join room', (user, isHost, hostUser, guestUser, id, roomObj) => {

    if (id === userID && isHost  && !hostSet)  {
        console.log('this user is hosting');
        host = true;

        hostSet = true;
    } else if (!hostSet) {
        
        //If not hosting, take away the ability to start new game.
        const newGameButton = document.getElementById('new-game-btn');
        newGameButton.setAttribute('disabled', "");

        hostSet = true;
    }

    clearDice();

    let hostDice = hostUser ? hostUser.setDice : null;
    let guestDice = guestUser ? guestUser.setDice : null; 

    

    if (host) {
        generateDice(6, 'player', hostDice);
        generateDice(6, 'opponent', guestDice);
    } else {
        generateDice(6, 'player', guestDice);
        generateDice(6, 'opponent', hostDice)
    }

    console.log(roomObj);
    console.log(socket.id);

    updateUserDisplay(roomObj);
});

// Update displayed usernames with hosting info and names.
const updateUserDisplay = (roomObj) => {
    const opponentName = document.getElementById('opponent-username');
    const playerHosting = document.getElementById('player-hosting');
    const opponentHosting = document.getElementById('opponent-hosting');

    // Set hosting label for player and opponent.
    if (host) {
        playerHosting.innerText = '(Host)';
        opponentHosting.innerText = '(Guest)';
    } else {
        playerHosting.innerText = '(Guest)';
        opponentHosting.innerText = '(Host)';
    }

    // Get opponent's username if opponent is signed in.
    if (host && roomObj.guestUser) {
        opponentName.innerText = roomObj.guestUser.username;
    }

    if (!host && roomObj.hostUser) {
        opponentName.innerText = roomObj.hostUser.username;
    }
}

// Receive socket info for starting new game.
socket.on('new game', (newState) => {
    console.log('starting new game...')

    if (!host) {
        let playerDice = state.player.dice;
        let opponentDice = state.opponent.dice;

        let tempState = newState;
        tempState.player.dice = playerDice;
        tempState.opponent.dice = opponentDice;

        state = tempState;


        startGame(state.turn);
    }
});

// Roll a die when opponent sends dice rolling info.
socket.on('roll die', (die, newState) => {

    // Prevent double animating dice.
    if (state.turn === 'player') return;

    const box = document.getElementById('opponent-dice');
    const newDie = {
        die: box.querySelector(`#${die.id}`),
        position: die.position
    }

    animateRoll(newDie);
});

socket.on('keep die', (position, kept, newState) => {
    // Prevent double animating dice.
    if (state.turn === 'player') return;

    // Update local state based on opponent's keeps.
    updateState(newState);

    const box = document.getElementById('opponent-dice');
    const newDie = {
        die: box.querySelector(`#die-${position}`),
        position: position
    }

    kept ? animateKeep(newDie, 'Unkeep') : animateKeep(newDie, 'Keep');
    const handScore = document.getElementById('hand-score');

    handScore.innerText = state.opponent.tempScore + state.opponent.handScore;
});

socket.on('count die', (position, kept, newState) => {
    // Prevent double animating dice.
    if (state.turn === 'player') return;

    const box = document.getElementById('opponent-dice');
    const newDie = box.querySelector(`#die-${position}`);

    newDie.classList.add('counted');
});

// Animate opponent hovering over their dice.
socket.on('mouseenter', (index, currentHost, box) => {

    // Prevent animating dice for player hovering.
    if (host === currentHost) return;

    let playerBox;

    if (box === 'player-dice') {
        playerBox = document.getElementById('opponent-box');
    } else {
        playerBox = document.getElementById('player-box');
    }

    const die = playerBox.querySelector(`#die-${index}`);
    die.classList.add('hovered');
});

// Animate opponent ending hovering over their dice.
socket.on('mouseleave', (index, currentHost, box) => {

    // Prevent animating dice for player hovering.
    if (host === currentHost) return;

    let playerBox;

    if (box === 'player-dice') {
        playerBox = document.getElementById('opponent-box');
    } else {
        playerBox = document.getElementById('player-box');
    }

    const die = playerBox.querySelector(`#die-${index}`);
    die.classList.remove('hovered');
});

// Receive info after opponent has passed the turn.
socket.on('end turn', (newState, isHost) => {
    

    // Prevent player who passed from repassing turn.
    if (isHost === host) return;

    let playerDice = state.player.dice;
    let opponentDice = state.opponent.dice;

    let tempState = newState;
    tempState.player.dice = playerDice;
    tempState.opponent.dice = opponentDice;

    state = tempState;

    document.getElementById('player-score').innerText = state.player.score;
    document.getElementById('opponent-score').innerText = state.opponent.score;
    document.getElementById('hand-score').innerText = 0;

    setTurn(state.turn);
});

// Send a message to the current player if their opponent has left.
socket.on('opponent left', (roomObj) => {
    alert('Your opponent left!')

    host = true;

    const newGameButton = document.getElementById('new-game-btn');
    newGameButton.removeAttribute('disabled');



    updateUserDisplay(roomObj);
});

// Take state passed from opponent and take only relevant info.
const updateState = (opponentState) => {

    const newState = Object.create(opponentState);

    // Overwrite passed state with local dice DOM elements.
    Object.keys(newState.player.dice).forEach(die => {
        newState.player.dice[die].die = state.player.dice[die].die;
        newState.player.dice[die].roll = () => {
            const side = Math.ceil(Math.random() * 6);
            newState.player.dice[die].position = side;
            return side;
        }
    });

    Object.keys(newState.opponent.dice).forEach(die => {
        newState.opponent.dice[die].die = state.opponent.dice[die].die;
        newState.opponent.dice[die].roll = () => {
            const side = Math.ceil(Math.random() * 6);
            newState.opponent.dice[die].position = side;
            return side;
        }
    });

    state = newState;
}

// Generate a random id.
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

// Join a room using the inputted room key.
const joinRoom = () => {
    const keyInput = document.getElementById('join-game-input').value;
    keyBox.innerText = `Current Room: ${keyInput}`;

    currentKey = keyInput;
    host = false;

    socket.emit('join room', roomKey, user, userID);
}

// Add event listener to join game button.
const joinGameButton = document.getElementById('join-game-btn');
if (joinGameButton) {
    joinGameButton.addEventListener('click', () => joinRoom());
}

// Send a message to other users sharing the same current room.
const sendMessage = () => {
    const input = document.getElementById('message-input');
    socket.emit('message', input.value, currentKey);
}

// Add event listener to button for sending messages.
const sendMessageButton = document.getElementById('message-send-btn');
if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendMessage);
}

// Add socket listener for receiving messages.
socket.on('message', (text) => {
    addMessage(text);
});

// Add a message to the local list of messages.
const addMessage = (text) => {
    const messageBox = document.getElementById('messages');
    const message = document.createElement('li');
    message.innerText = text;
    messageBox.appendChild(message);
}

let state = {
    turn: null,
    running: false,
    lastTurn: false,
    player: {
        dice: {},
        score: 0,
        handScore: 0,
        tempScore: 0
    },
    opponent: {
        dice: {},
        score: 0,
        handScore: 0,
        tempScore: 0
    }
}

// Die constructor.
function Die(die) {

    // Roll the die to a random position.
    this.roll = () => {
        const side = Math.ceil(Math.random() * 6);
        this.position = side;
        return side;
    }

    this.rolled = false;
    this.counted = false;
    this.kept = false;
    this.position = 1;
    this.die = die;
}

// Create starting dice for the player and the opponent.
const generateDice = (count, player, dice) => {
    

    for (let i = 0; i < count; i++) {
        
        // If non-default die passed, use it, otherwise use default.
        if (dice && dice[i] !== null) {
            generateDie(`${player}-dice`, 'khaki', i + 1, dice[i]);
        } else {
            generateDie(`${player}-dice`, 'khaki', i + 1);
        }
    }
}

// Create a single die.
const generateDie = (box, color, index, customDie) => {

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
                pip.style.animationDelay = `${100 * j}ms`;
                pip.classList.add('pipped');
            }
        }

        // Append a custom die inlay if any.
        if (customDie) {
            const inlay = document.createElement('div');
            inlay.classList.add('inlay');
            inlay.style.backgroundImage = (`url('/images/inlays/inlay_${customDie.inlay}.png')`);
            dieFace.appendChild(inlay);
        }

        if (customDie && customDie.shine) {
            const shine = document.createElement('div');
            shine.classList.add('shine');
            dieFace.appendChild(shine);
        }

        // Add button for keeping die to each die face.
        const keepBtn = document.createElement('div');
        keepBtn.classList.add('keep-btn');

        const keepText = document.createElement('div');
        keepText.innerText = 'keep';
        keepText.classList.add('keep-text');
        keepBtn.appendChild(keepText);

        dieFace.appendChild(keepBtn);

        die.appendChild(dieFace);
    }

    // Add die to passed box argument.
    const container = document.getElementById(box);
    container.appendChild(die);


    // Add die to player or opponent object.
    const newDie = new Die(die);

    if (box === 'player-dice') {
        const index = Object.keys(state.player.dice).length;
        state.player.dice[`die${index}`] = newDie;

        // Click listener for rolling displayed die and die object.
        die.addEventListener('click', (e) => rollDie(state.player.dice[`die${index}`], e));

        // Add keep die function to all die's keep buttons.
        const keepBtns = Array.from(die.querySelectorAll('.keep-btn'));
        keepBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                keepDie(state.player.dice[`die${index}`], e);
            });
        });

    } else if (box === 'opponent-dice') {
        const index = Object.keys(state.opponent.dice).length;
        state.opponent.dice[`die${index}`] = newDie;

        // Click listener for rolling displayed die and die object.
        die.addEventListener('click', (e) => rollDie(state.opponent.dice[`die${index}`], e));

        // Add keep die function to all die's keep buttons.
        const keepBtns = Array.from(die.querySelectorAll('.keep-btn'));
        keepBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                keepDie(state.opponent.dice[`die${index}`], e);
            });
        });
    }

    // Animate player hovering over dice for the opponent.
    die.addEventListener('mouseenter', () => {
        // Don't emit if not playing in multiplayer.
        if (!multi) return;
        socket.emit('mouseenter', currentKey, index, host, box);
    });

    die.addEventListener('mouseleave', () => {
        // Don't emit if not playing in multiplayer.
        if (!multi) return;
        socket.emit('mouseleave', currentKey, index, host, box);
    });
}

// Check if the current player has gone bust after rolling all dice.
const processBust = () => {
    const dice = state[state.turn]['dice'];
    let allRolled = true;
    let diceArray = [];

    Object.keys(dice).forEach(die => {
        if (!dice[die].rolled) allRolled = false;

        if (dice[die].rolled && !dice[die].counted) {
            diceArray.push(dice[die].position);
        }
    });

    // Not all dice rolled, return;
    if (!allRolled) return;

    //sendModal('All have been rolled');


    if (updateHandScore(diceArray, false) === 0) {
        sendModal('BUST');
        endTurn(true);
    }
}

// Animate rolling dice, and update their states in player objects.
const rollDie = (dieObj, e) => {

    // Prevent rolling when game is not running.
    if (!state.running) return;

    // Prevent rolling on keep button click.
    if (e && !e.target.classList.contains('cube__face')) return;

    // Prevent rolling when not player's turn in multiplayer.
    if (e && multi && state.turn !== 'player') return;

    // Prevent rolling a kept die.
    if (dieObj.kept) return;

    // Prevent rerolling a die.
    if (dieObj.rolled) return;

    dieObj.roll();
    dieObj.rolled = true;

    animateRoll(dieObj);

    processBust();

    if (multi) {
        // Send id of rolled die for animation purposes.
        const object = {
            id: dieObj['die'].id,
            position: dieObj.position
        }

        socket.emit('roll die', currentKey, object, convertState(state));
    }
}

// Animate rolling die with a set end position.
const animateRoll = (dieObj) => {
    // Handle animations for rolling the die.
    dieObj.die.classList.remove('rolled-1', 'rolled-2', 'rolled-3', 'rolled-4', 'rolled-5', 'rolled-6', 'rolling');
    void dieObj.die.offsetWidth;

    dieObj.die.classList.add('rolling');
    setTimeout(() => {
        dieObj.die.classList.remove('rolling');
        dieObj.die.classList.add(`rolled-${dieObj.position}`, 'rolled');
    }, 500);
}

// Roll all of a player's available dice at once.
const rollAllDice = () => {

    // Prevent opponent rolling player dice in multiplayer.
    if (multi && state.turn === 'opponent') return;

    let dice;
    if (state.turn === 'player') {
        dice = state.player.dice;
    } else if (state.turn === 'opponent') {
        dice = state.opponent.dice;
    }

    // Add each newly rolled die to the hand array.
    Object.keys(dice).forEach(die => {

        if (!dice[die].rolled && !dice[die].kept) {
            rollDie(dice[die]);
        }
    });
}

// Add event listener to button for rolling all dice.
const rollDiceButton = document.getElementById('roll-dice-btn');
rollDiceButton.addEventListener('click', rollAllDice);

// Process points in current kept hand and update displayed score.
const updateHandScore = (dice, shouldDisplay) => {
    const scoreDisplay = document.getElementById('hand-score')
    let score = 0;
    let straight = true;

    console.log(dice);

    const counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };

    // Count up all instances of dice.
    dice.forEach(roll => {
        counts[roll]++;
    });

    // Check for a straight of dice.
    for (let i = 1; i < 7; i++) {
        if (!counts[i]) straight = false;
    }

    // Calculate score for triples and singles.
    Object.keys(counts).forEach(count => {
        if (counts[count] >= 3) {
            if (count === '1') {
                score += (1000 * (2 ** (counts[count] - 3)));
            } else {
                score += (parseInt(count) * 100) * (2 ** (counts[count] - 3));
            }
        } else if (count === '1') {
            score += 100 * counts[1];
        } else if (count === '5') {
            score += 50 * counts[5];
        }
    });

    if (straight) {
        score = 1000;
    }

    if (shouldDisplay) {
        scoreDisplay.innerText = score + state[state.turn]['handScore'];
        state[state.turn]['tempScore'] = score;
    }

    return score;
}

// Set die object to kept and style it.
const keepDie = (dieObj, e) => {

    // Prevent keeping opponent's dice in multiplayer.
    if (multi && state.turn !== 'player') return;

    // Deselect an already kept die;
    if (dieObj.kept) {
        dieObj.kept = false;
        animateKeep(dieObj, 'Keep')
    } else {
        dieObj.kept = true;
        animateKeep(dieObj, 'Unkeep')
    }

    // Convert dice objects into an array.
    let dice = [];
    for (let i = 0; i < 6; i++) {
        if (state[state.turn]['dice'][`die${i}`].kept &&
            !state[state.turn]['dice'][`die${i}`].counted) {
            dice.push(state[state.turn]['dice'][`die${i}`].position);
        }
    }

    updateHandScore(dice, true);

    const dieNumber = dieObj.die.id.slice(4, 5);

    // Don't emit if not playing in multiplayer.
    if (!multi) return;
    socket.emit('keep die', currentKey, dieNumber, dieObj.kept, convertState(state));
}

// Animate keeping a die.
const animateKeep = (dieObj, state) => {
    const target = dieObj.die.querySelector(`.cube__face--${dieObj.position}`);

    if (state === 'Keep') {
        dieObj.die.classList.remove('kept');
    } else if (state === 'Unkeep') {
        dieObj.die.classList.add('kept');
    }
    target.querySelector('.keep-text').innerText = state;
}

// Set a die to the unrolled state and unstyle it.
const unrollDie = (dieObj) => {
    dieObj.rolled = false;
    dieObj.die.classList.remove('rolled');
}

// Keep current player's hand and move to next roll.
const keepHand = () => {

    const dice = state[state.turn]['dice'];
    let hand = [];
    let allKept = true;

    if (checkHandValidity() === false) return;

    // If valid and not bust hand, reset temp score and add temp score
    // to hand score.
    state[state.turn]['handScore'] += state[state.turn]['tempScore'];
    state[state.turn]['tempScore'] = 0;

    // Add each newly rolled die to the hand array.
    // And reset rolled state on not kept dice.
    Object.keys(dice).forEach(die => {

        if (dice[die].rolled && dice[die].kept) {
            hand.push(dice[die].position);
            dice[die].counted = true;
            dice[die].die.classList.add('counted');

            // Send data to opponent for animation.
            const dieNumber = dice[die].die.id.slice(4, 5);

            if (multi) {
                socket.emit('count die', currentKey, dieNumber, dice[die].kept, convertState(state));
            }

        }

        if (!dice[die].kept) {
            unrollDie(dice[die]);
            allKept = false;
        }
    });

    // If all dice are kept , reset to a new hand.
    if (allKept) {
        resetDice(state.turn);
    }
}

// Add event listener to button for keeping hand.
const keepHandButton = document.getElementById('keep-hand-btn');
keepHandButton.addEventListener('click', keepHand);

// Check for several problems with current hand to prevent invalid keeps.
const checkHandValidity = () => {
    let diceLeft = false;
    let diceKept = false;
    let validHand = true;
    let straight = true;

    const dice = state[state.turn]['dice'];

    // Check for rolled dice in hand, and prevent keeping if some are left.
    Object.keys(dice).forEach(die => {
        if (!dice[die].rolled) {
            diceLeft = true;
        }
    });
    if (diceLeft) {
        sendModal('You have dice left to roll!');
        return false;
    }

    // If all dice rolled, check that at least 1 die was kept.
    Object.keys(dice).forEach(die => {
        if (dice[die].kept && !dice[die].counted) {
            diceKept = true;
        }
    });

    if (!diceKept) {
        sendModal('You need to keep at least one die!');
        return false;
    }

    // Check for invalid dice kept in hand.
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    Object.keys(dice).forEach(die => {
        if (dice[die].counted) return;
        if (dice[die].kept === false) return;
        counts[dice[die].position]++;
    });

    // Invalid hands keep more than 1 but less than 3 of non 5s/1s.
    Object.keys(counts).forEach(count => {
        if (count !== '1' && count !== '5' &&
            counts[count] > 0 && counts[count] < 3) {
            validHand = false;
        }

        if (counts[count] !== 1) straight = false;
    });

    if (straight) validHand = true;

    if (!validHand) {
        sendModal('Hand is invalid!');
        return false;
    }
}

// Check for a win after passing turn, and allow one more turn if true.
const checkForWin = () => {
    if (state.player.score >= 1000 || state.opponent.score >= 1000) {
        state.lastTurn = true;
        sendModal('Last turn!')
    }
}

// Set the current turn to the passed player.
const setTurn = (player) => {

    state.turn = player;

    // Reset current player's scores.
    state[player].handScore = 0;
    state[player].tempScore = 0;

    // Reset all current player's dice.
    resetDice(player);

    const playerBox = document.getElementById('player-box');
    const opponentBox = document.getElementById('opponent-box');

    playerBox.classList.remove('current-turn');
    opponentBox.classList.remove('current-turn');

    const board = document.getElementById(`${player}-box`);
    board.classList.add('current-turn');
}

// Reset all of passed player's dice and displayed dice.
const resetDice = (player) => {
    const dice = state[player]['dice'];

    Object.keys(dice).forEach(die => {

        dice[die]['die'].classList.remove('kept', 'rolled', 'counted',
            'rolled-1', 'rolled-2', 'rolled-3', 'rolled-4', 'rolled-5',
            'rolled-6');

        dice[die].position = 1;
        dice[die].rolled = false;
        dice[die].kept = false;
        dice[die].counted = false;
    });
}

// Animate the initial turn rolling.
const rollTurn = () => {
    let turn;

    const flip = Math.floor(Math.random() * 2);
    if (flip === 1) {
        return 'player';
    } else {
        return 'opponent';
    }

    // const localRoll = () => {
    //     setTurn(turn);
    //     turn === 'player' ? turn = 'opponent' : turn = 'player';
    // }

    // const interval = setInterval(localRoll, 150);
    // setTimeout(() => {
    //     clearInterval(interval);
    // }, 150)
}

// End the current turn, and then switch turn.
const endTurn = (bust) => {

    // Check for a valid hand.
    if (!bust && checkHandValidity() === false) return;

    // If not bust, update score and score display.
    if (!bust) {
        state[state.turn]['score'] += state[state.turn]['handScore'] + state[state.turn]['tempScore'];

        const display = document.getElementById(`${state.turn}-score`);
        display.innerText = state[state.turn]['score'];
    }

    // Switch the current turn.
    state[state.turn]['handScore'] = 0;
    state[state.turn]['tempScore'] = 0;

    document.getElementById('hand-score').innerText = 0;

    // If current turn is last, calculate winner on end of turn.
    if (state.lastTurn) {
        state.running = false;

        if (state['opponent']['score'] > state['player']['score']) {
            sendModal('Opponent has won!')
            console.log('Opponent has won!')
        } else if (state['player']['score'] > state['opponent']['score']) {
            sendModal('Player has won!')
            console.log('player has won!')
        } else {
            sendModal("It's a tie!")
        }

        return;
    }

    checkForWin();

    state.turn === 'player' ? setTurn('opponent') : setTurn('player');

    // Don't emit if not playing in multiplayer.
    if (!multi) return;
    socket.emit('end turn', currentKey, convertState(state), host);
}

// Add event listener to button for ending turn.
const endTurnButton = document.getElementById('end-turn-btn');
endTurnButton.addEventListener('click', () => endTurn(false));

// Display a Modal message.
let modalTimeout;
const sendModal = (message) => {
    clearTimeout(modalTimeout);

    const modal = document.getElementById('modal-message');
    modal.innerText = message;
    modal.parentElement.classList.remove('shown');
    void modal.parentElement.offsetHeight;
    modal.parentElement.classList.add('shown');

    modalTimeout = setTimeout(() => {
        modal.parentElement.classList.remove('shown');
    }, 2000);
}

// Reset all parts of game state.
const resetGame = (player) => {

    // If game resetting with a particular player, don't set turn to null.
    player ? null : state.turn = null;

    state.running = true;
    state.lastTurn = false;

    ['player', 'opponent'].forEach(option => {
        state[option].score = 0;
        state[option].handScore = 0;
        state[option].tempScore = 0;
    });

    resetDice('player');
    resetDice('opponent');

    const playerScore = document.getElementById('player-score');
    const opponentScore = document.getElementById('opponent-score');
    const handScore = document.getElementById('hand-score');

    playerScore.innerText = 0;
    opponentScore.innerText = 0;
    handScore.innerText = 0;

    sendModal('New game started');
}

// Start a game of saiko kismet.
const startGame = (player) => {

    if (!host) {
    }

    resetGame();


    //Choose a random player to begin.
    if (player) {
        setTurn(player);
    } else {
        setTurn(rollTurn());
    }

    if (host && multi) {
        socket.emit('new game', currentKey, convertState(state));
    }
};

// Add event listener to button for starting a new game.
const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', () => startGame(false));

// Convert state to be passed between players, to show the perspective shift.
const convertState = (oldState) => {

    // Copy oldstate but swap player and opponent data.
    let newState = {
        turn: state.turn,
        running: state.running,
        lastTurn: state.lastTurn,
        player: state.opponent,
        opponent: state.player,
    }

    if (newState.turn === 'player') {
        newState.turn = 'opponent';
    } else {
        newState.turn = 'player';
    }
    return newState;
}

// Generate six dice for each player.
const diceInit = (() => {

    let dice = null;

    // Set up custom dice if user is signed in.
    const userInfo = document.getElementById('user-info');
    if (userInfo.getAttribute('user') !== '') {
        let user = JSON.parse(userInfo.getAttribute('user'));
        dice = user.setDice;
    }

    generateDice(6, 'player', dice);
    generateDice(6, 'opponent');
})();

// Delete all dice objects in the DOM.
const clearDice = () => {
    const dice = Array.from(document.querySelectorAll('.die'));
    dice.forEach(die => {
        die.remove();
    });

    state.player.dice = {};
    state.opponent.dice = {};
}