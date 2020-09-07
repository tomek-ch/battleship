'use strict'

function Ship(length) {
    return {
        length,
        wasHit: [],
        sunk: false,
        hit(x, y) {
            this.wasHit.push(`${x}, ${y}`);
            this.isSunk();
        },
        isSunk() {
            if (this.wasHit.length === this.length) {
                this.sunk = true;
            }
        }
    };
}

function Gameboard() {
    const grid = [];
    const legalMoves = [];

    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
            row.push({ status: 'empty', available: true });
            legalMoves.push(`${i}, ${j}`);
        }
        grid.push(row);
    }

    return {
        legalMoves,
        grid,
        ships: [],
        placeShip(length, x, y, horizontal) {
            const ship = Ship(length);
            
            if (horizontal) {
                for (let i = 0; i < length; i ++) {
                    this.grid[x][y + i].ship = ship;
                    this.grid[x][y + i].status = 'ship';

                    this.grid[x][y + i].available = false;
                    if (this.grid[x - 1] && this.grid[x - 1][y + i]) this.grid[x - 1][y + i].available = false;
                    if (this.grid[x + 1] && this.grid[x + 1][y + i]) this.grid[x + 1][y + i].available = false;
                }
            } else {
                for (let i = 0; i < length; i ++) {
                    this.grid[x + i][y].ship = ship;
                    this.grid[x + i][y].status = 'ship';

                    this.grid[x + i][y].available = false;
                    if (this.grid[x + i] && this.grid[x + i][y - 1]) this.grid[x + i][y - 1].available = false;
                    if (this.grid[x + i] && this.grid[x + i][y + 1]) this.grid[x + i][y + 1].available = false;
                }
            }

            if (horizontal) {
                if (this.grid[x] && this.grid[x][y - 1]) this.grid[x][y - 1].available = false;
                if (this.grid[x] && this.grid[x][y + length]) this.grid[x][y + length].available = false;
            } else {
                if (this.grid[x - 1] && this.grid[x - 1][y]) {
                    this.grid[x - 1][y].available = false;
                }
                if (this.grid[x + length] && this.grid[x + length][y]) {
                    this.grid[x + length][y].available = false;
                }
            }

            this.ships.push(ship);
        },
        checkIfAvailable(length, x, y, horizontal) {
            if (horizontal) {
                for (let i = y; i <= y + length; i++) {
                    if (!this.grid[x] ||
                        !this.grid[x][i] ||
                        !this.grid[x][i].available) return false;
                }
            } else {
                for (let i = x; i <= x + length; i++) {
                    if (!this.grid[i] ||
                        !this.grid[i][y] ||
                        !this.grid[i][y].available) return false;
                }
            }
            
            return true;
        },
        placeShipRandomly(length) {

            const horizontal = Math.random() >= 0.5;
            
            const randomX = Math.floor(Math.random() * (10 - 0));
            const randomY = Math.floor(Math.random() * (10 - 0));

            if (this.checkIfAvailable(length, randomX, randomY, horizontal)) {
                this.placeShip(length, randomX, randomY, horizontal);
            } else this.placeShipRandomly(length);
        },
        placeASetOfShips() {
            for (let length of [5, 4, 3, 3, 2]) this.placeShipRandomly(length);
        },
        receiveAttack(x, y) {
            if (this.grid[x][y].status === 'ship') {
                this.grid[x][y].ship.hit(x, y);
                this.grid[x][y].status = 'hit';
            } else {
                this.grid[x][y].status = 'miss';
            }
            this.legalMoves.splice(this.legalMoves.indexOf(`${x}, ${y}`), 1);
        },
        checkShipsIfSunk() {
            for (let ship of this.ships) {
                if (!ship.sunk) return true;
            }
            return false;
        }
    };
}

function Player() {
    return {
        board: Gameboard(),
        score: 0
    }
}

function Game() {
    return {
        inProgress: true,
        currentTurn: true,
        player1: Player(),
        player2: Player(),
        shoot(coords) {
            const toBeAttacked = this.currentTurn ? 'player2' : 'player1';

            if (this.inProgress && this[toBeAttacked].board.legalMoves.includes(coords)) {
                const x = coords[0];
                const y = coords[3];

                this[toBeAttacked].board.receiveAttack(x, y);

                this.inProgress = this[toBeAttacked].board.checkShipsIfSunk();

                if (!this.inProgress) {
                    const winner = this.currentTurn ? 'player1' : 'player2';
                    this[winner].score++;
                }

                if (!this[toBeAttacked].board.grid[coords[0]][coords[3]].ship && this.inProgress) {
                    this.currentTurn = !this.currentTurn;
                }
            }
        },
        startGame() {
            this.player1.board = Gameboard();
            this.player2.board = Gameboard();
            
            this.player1.board.placeASetOfShips();
            this.player2.board.placeASetOfShips();

            this.inProgress = true;
            this.currentTurn = true;
        },
        cpuMove() {
            while (!this.currentTurn && this.inProgress) {
                const cpuMoves = this.player1.board.legalMoves;
                this.shoot(cpuMoves[Math.floor(Math.random() * cpuMoves.length)]);
            }
        }
    }
}

const Interface = {

    handleClick: e => {
        currentGame.shoot(`${e.target.dataset.x}, ${e.target.dataset.y}`);

        Interface.renderGrid(currentGame.player2);
        
        currentGame.cpuMove();
        Interface.renderGrid(currentGame.player1);

        if (!currentGame.inProgress) {
            const winner = currentGame.currentTurn ?  'You win!' : 'You lose!';

            const replay = document.createElement('i');
            replay.classList.toggle('fas');
            replay.classList.toggle('fa-redo-alt');
            replay.addEventListener('click', () => {
                currentGame.startGame();
                Interface.renderGrid(currentGame.player1);
                Interface.renderGrid(currentGame.player2);
                document.querySelector('.game-over').textContent = '';
            });
            
            document.querySelector('.game-over').textContent = winner;
            document.querySelector('.game-over').appendChild(replay);
            
            document.querySelector('.your-score').textContent = `You: ${currentGame.player1.score}`;
            document.querySelector('.cpu-score').textContent = `CPU: ${currentGame.player2.score}`;
        }
    },

    renderGrid(player) {
        const selector = player === currentGame.player1 ? '.your-board' : '.enemy-board';
        document.querySelector(selector).textContent = '';

        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {

                const square = document.createElement('div');

                let className = 'empty';
                if (player.board.grid[i][j].status === 'hit') {
                    className = 'hit';
                } else if (player.board.grid[i][j].status === 'miss') {
                    className = 'miss';
                }
                if (player.board.grid[i][j].status === 'ship') {
                    if (player === currentGame.player1) className = 'ship';
                }
                if (player.board.grid[i][j].status === 'hit') {
                    if (player.board.grid[i][j].ship.sunk) className = 'sunk';
                }

                square.classList.toggle(className);

                square.dataset.x = i;
                square.dataset.y = j;

                row.push(square);
            }
            if (player === currentGame.player2) {
                for (let square of row) square.addEventListener('click', this.handleClick);
            }
            for (let square of row) document.querySelector(selector).appendChild(square);
        }
    }
}



const currentGame = Game();

currentGame.startGame();

Interface.renderGrid(currentGame.player1);
Interface.renderGrid(currentGame.player2);

// module.exports = {
//     Ship,
//     Gameboard,
//     Player,
//     Game,
//     Interface
// };