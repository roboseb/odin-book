var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

const state = {
    turn: null,
    player: {
        dice: {},
        points: 0
    },
    opponent: {
        dice: {},
        points: 0
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
    this.selected = false;
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
            button.addEventListener('click', () => {
                keepDie(state.player.dice[`die${index}`]);
            });
        });
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
const updateHandScore = (dice) => {
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
        counts[roll] ++;
    });

    // Check for a straight of dice.
    for (let i = 1; i < 7; i++) {
        if (!counts[i]) straight = false;
    }

    if (straight) {
        score = 1000;
        console.log(score);
        return;
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

    scoreDisplay.innerText = score;


    console.log(score);
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
        if (state[state.turn]['dice'][`die${i}`].kept) {
            dice.push(state[state.turn]['dice'][`die${i}`].position);
        }
    }

    console.log(dice);
    updateHandScore(dice);
}

// Set a die to the unrolled state and unstyle it.
const unrollDie = (dieObj) => {
    dieObj.rolled = false;
    dieObj.die.classList.remove('rolled');
}

// Keep current player's hand and move to next roll.
const keepHand = () => {
    console.log('keeping hand');
    let dice;
    let hand = [];
    let diceLeft = false;

    if (state.turn === 'player') {
        dice = state.player.dice;
    } else if (state.turn === 'opponent') {
        dice = state.opponent.dice;
    }

    // Check for rolled dice in hand, and prevent keeping if some are left.
    Object.keys(dice).forEach(die => {

        if (!dice[die].rolled) {
            diceLeft = true;
        }
    });

    if (diceLeft) {
        sendModal('You have dice left to roll!');
        return;
    }

    // Add each newly rolled die to the hand array.
    // And reset rolled state on not kept dice.
    Object.keys(dice).forEach(die => {

        if (dice[die].rolled && dice[die].kept) {
            hand.push(dice[die].position);
        }

        if (!dice[die].kept) {
            unrollDie(dice[die]);
        }
    });

    console.log(hand);
}

// Set the current turn to the passed player.
const setTurn = (player) => {
    state.turn = player;

    const playerBox = document.getElementById('player-box');
    const opponentBox = document.getElementById('opponent-box');

    playerBox.classList.remove('current-turn');
    opponentBox.classList.remove('current-turn');

    const board = document.getElementById(`${player}-box`);
    board.classList.add('current-turn');

    // Prevent interacting with the board of the other player.
    if (state.turn === 'player') {
        opponentBox.style.pointerEvents = 'none'
    } else if (state.turn === 'opponent') {
        playerBox.style.pointerEvents = 'all'
    }
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
    }, 2000)
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

// Handle initializing game board, and roll for turn.
const startGame = (() => {
    generateDice(6);
    //rollTurn();

    setTurn('player');
})();



