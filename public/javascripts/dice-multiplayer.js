var socket = io();
const roomKey = makeid(6);
let currentRoom = roomKey;

const keyBox = document.getElementById('key-box');
keyBox.innerText = `Current Room: ${roomKey}`;

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

// Join a room using the inputted room key.
const joinRoom = () => {
    const keyInput = document.getElementById('join-game-input').value;
    socket.emit('join room', keyInput);
    keyBox.innerText = `Current Room: ${keyInput}`;

    currentRoom = keyInput;
}

// Send a message to other users sharing the same current room.
const sendMessage = () => {
    const input = document.getElementById('message-input');
    socket.emit('message', input.value, currentRoom);
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

let diceMade = false;

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
const generateDice = (count) => {
    for (let i = 0; i < count; i++) {
        generateDie('player-dice', 'khaki')
        generateDie('opponent-dice', 'khaki')
    }
}

// Create a single die.
const generateDie = (box, color) => {
    const die = document.createElement('div');
    die.classList.add('cube');

    // Create each face of the die.
    for (let i = 1; i < 7; i++) {
        const dieFace = document.createElement('div');
        dieFace.classList.add('cube__face', `cube__face--${i}`);
        dieFace.style.backgroundColor = color;

        //Create each pip for each side of the die.
        for (let j = 1; j < i + 1; j++) {
            const pip = document.createElement('div');
            pip.classList.add('pip');
            dieFace.appendChild(pip);
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
    // Prevent rolling on keep button click.
    if (e && !e.target.classList.contains('cube__face')) return;

    // Prevent rolling a kept die.
    if (dieObj.kept) return;

    // Prevent rerolling a die.
    if (dieObj.rolled) return;

    dieObj.roll();
    dieObj.rolled = true;

    // Handle animations for rolling the die.
    dieObj.die.classList.remove('rolled-1', 'rolled-2', 'rolled-3', 'rolled-4', 'rolled-5', 'rolled-6', 'rolling');
    void dieObj.die.offsetWidth;

    dieObj.die.classList.add('rolling');
    setTimeout(() => {
        dieObj.die.classList.remove('rolling');
        dieObj.die.classList.add(`rolled-${dieObj.position}`, 'rolled');
    }, 500);

    processBust();
}

// Roll all of a player's available dice at once.
const rollAllDice = () => {
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

// Process points in current kept hand and update displayed score.
const updateHandScore = (dice, shouldDisplay) => {
    const scoreDisplay = document.getElementById('hand-score')
    let score = 0;
    let straight = true;

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

    // Deselect an already kept die;
    if (dieObj.kept) {
        dieObj.kept = false;
        dieObj.die.classList.remove('kept');
        e.target.innerText = 'Keep';
    } else {
        dieObj.kept = true;
        dieObj.die.classList.add('kept');
        e.target.innerText = 'Unkeep';
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
        turn = 'player';
    } else {
        turn = 'opponent';
    }

    const rollTurn = () => {
        setTurn(turn);
        turn === 'player' ? turn = 'opponent' : turn = 'player';
    }

    const interval = setInterval(rollTurn, 150);
    setTimeout(() => {
        clearInterval(interval);
    }, 150)
}

// End the current turn, and then switch turn.
const endTurn = (bust) => {

    // Check for a valid hand.
    if (!bust && checkHandValidity() === false) return;

    // If not bust, update score and score display.
    if (!bust) {
        state[state.turn]['score'] += state[state.turn]['handScore'] + state[state.turn]['tempScore'];

        console.log(state[state.turn]['score']);

        const display = document.getElementById(`${state.turn}-score`);
        display.innerText = state[state.turn]['score'];
    }

    // Switch the current turn.
    state[state.turn]['handScore'] = 0;
    state[state.turn]['tempScore'] = 0;

    document.getElementById('hand-score').innerText = 0;

    // If current turn is last, calculate winner on end of turn.
    if (state.lastTurn) {

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
}

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
const resetGame = () => {
    state.turn = null;
    state.running = false;
    state.lastTurn = false;

    ['player', 'opponent'].forEach(player => {
        state[player].score = 0;
        state[player].handScore = 0;
        state[player].tempScore = 0;
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
const startGame = () => {
    if (!diceMade) {
        generateDice(6);
        diceMade = true;
    }

    resetGame();
    rollTurn();
};