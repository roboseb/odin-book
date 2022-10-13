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

const playerDice = {};
const enemyDice = {};

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

        die.appendChild(dieFace);
    }

    // Add die to passed box argument.
    const container = document.getElementById(box);
    container.appendChild(die);


    // Add die to player or opponent object.
    const newDie = new Die(die);

    if (box === 'player-dice') {
        const index = Object.keys(playerDice).length;
        playerDice[`die${index}`] = newDie;

        // Click listener for rolling displayed die and die object.
        die.addEventListener('click', () => rollDie(playerDice[`die${index}`]));
    } else if (box === 'opponent-dice') {
        const index = Object.keys(enemyDice).length;
        enemyDice[`die${index}`] = newDie;

        // Click listener for rolling displayed die and die object.
        die.addEventListener('click', () => rollDie(enemyDice[`die${index}`]));
    }
}

const rollDie = (dieObj) => {
    dieObj.roll();
    console.log(dieObj.position);

    dieObj.die.classList.remove('rolled-1', 'rolled-2', 'rolled-3', 'rolled-4', 'rolled-5', 'rolled-6',);
    void dieObj.die.offsetWidth;

    dieObj.die.classList.add('rolling');
    setTimeout(() => {
        dieObj.die.classList.remove('rolling');
        dieObj.die.classList.add(`rolled-${dieObj.position}`);
    }, 500);

}

generateDice(5);