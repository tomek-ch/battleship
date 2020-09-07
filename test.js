const battleship = require('./index.js');

test('Creates a ship with length 2', () => {
    const ship = battleship.Ship(2);
    expect(ship.length).toBe(2);
    expect(ship.sunk).toBe(false);
    expect(ship.wasHit).toEqual([]);
  });

test('Sinks the ship', () => {
    const ship = battleship.Ship(2);
    ship.hit(1, 2);
    ship.hit(2, 2);
    ship.isSunk();
    expect(ship.sunk).toBe(true);
  });

test('Creates a 10 x 10 board', () => {
    const board = battleship.Gameboard();
    expect(board.grid.length).toBe(10);
    for (let row of board.grid) expect(row.length).toBe(10);
  });

test('Places a new ship on the gameboard', () => {
    const board = battleship.Gameboard();
    board.placeShip(2, 6, 9);
    expect(board.grid[6][9].ship.length).toBe(2);
    expect(board.grid[6][9].ship.sunk).toBe(false);
    expect(board.grid[6][9].ship.wasHit).toEqual([]);
  });

test('Places a 2 squares long ship on the gameboard', () => {
    const board = battleship.Gameboard();
    board.placeShip(2, 6, 9);
    expect(board.grid[6][9].ship.length).toBe(2);
    expect(board.grid[7][9].ship.length).toBe(2);
  });

test('Attacks and sinks a ship on the gameboard', () => {
    const board = battleship.Gameboard();
    board.placeShip(1, 6, 9);
    board.receiveAttack(6, 9);
    expect(board.grid[6][9].ship.wasHit[0]).toBe('6, 9');
    expect(board.grid[6][9].ship.sunk).toBe(true);
  });

test('Attacks and misses', () => {
    const board = battleship.Gameboard();
    board.receiveAttack(6, 9);
    expect(board.legalMoves.includes('6, 9')).toBe(false);
  });

test('Creates a new player', () => {
    const player = battleship.Player();
    expect(player.board.grid.length).toBe(10);
  });

  test('Creates a new game', () => {
    const currentGame = battleship.Game();
    expect(currentGame.player1.board.grid.length).toBe(10);
    expect(currentGame.player2.board.grid.length).toBe(10);

    currentGame.player1.board.placeShip(3, 5, 5);
    expect(typeof currentGame.player1.board.grid[5][5]).toBe('object');

    currentGame.player1.board.receiveAttack(5, 5);
    expect(currentGame.player1.board.grid[5][5].ship.sunk).toBe(false);
    currentGame.player1.board.receiveAttack(6, 5);
    expect(currentGame.player1.board.grid[5][5].ship.sunk).toBe(false);
    currentGame.player1.board.receiveAttack(7, 5);
    expect(currentGame.player1.board.grid[5][5].ship.sunk).toBe(true);
  });

  test('Switches turns', () => {
    const game = battleship.Game();
    game.player1.board.placeShip(1, 0, 0, false);
    game.player2.board.placeShip(1, 0, 0, false);

    expect(game.player2.board.legalMoves.includes('6, 9')).toBe(true);
    game.shoot('6, 9');
    expect(game.player2.board.legalMoves.includes('6, 9')).toBe(false);

    expect(game.currentTurn).toBe(false);

    expect(game.player1.board.legalMoves.includes('6, 9')).toBe(true);
    game.shoot('6, 9');
    expect(game.player1.board.legalMoves.includes('6, 9')).toBe(false);
  });

  test("Illegal move doesn't take effect", () => {
    const game = battleship.Game();

    game.shoot('6, 9');
    game.shoot('6, 9');
    game.shoot('6, 9');
    expect(game.currentTurn).toBe(true);
  });

  test('Game ends', () => {
    const game = battleship.Game();

    game.player2.board.ships = [{sunk: true}];
    game.shoot(`0, 0`);
    expect(game.inProgress).toBe(false);
  })