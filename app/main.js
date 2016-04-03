var app = angular.module('main', []);

app.controller('mainCtrl', function($scope) {
  var vm = $scope;

  // Initialize grid
  vm.initialize = function() {
    vm.grid = [];
    vm.empty = { x: 3, y: 3};

    for (var i = 0; i < 4; i++)
      vm.grid.push([1+4*i, 2+4*i, 3+4*i, 4+4*i]);

    vm.grid[3][3] = 0;

    vm.scramble();

    console.log(solve(vm.grid));
  }; 

  // Coordinates are adjacent to the empty square
  function adjacent(empty, x, y) {
    var _x = empty.x,
        _y = empty.y;
    return ((x-_x === 0 && Math.abs(y-_y) == 1) || (y-_y === 0 && Math.abs(x-_x) == 1)) && x >= 0 && x < 4 && y >= 0 && y < 4;
  }

  // Attempt to swap (x, y) with the empty square and return the new empty square if successful
  function move(grid, empty, x, y) {    
    if (adjacent(empty, x, y)) {
      grid[empty.y][empty.x] = grid[y][x];
      grid[y][x] = 0;
      return { x: x, y: y};          
    }
    return empty;
  }

  // Move the tile at (x, y) into the empty spot
  vm.move = function(x, y) {
    vm.empty = move(vm.grid, vm.empty, x, y);
  };

  // Scramble the grid
  vm.scramble = function() {
    for (var i = 0; i < 32; i++) {
      var x = vm.empty.x,
          y = vm.empty.y,
          _x = 0,
          _y = 0;

      if (Math.random() > 0.5)
        _x = 1;
      else
        _y = 1;

      if (Math.random() > 0.5) {
        _x *= -1;
        _y *= -1;
      }

      if (x+_x > 3 || x+_x < 0)
        _x *= -1;
      if (y+_y > 3 || y+_y < 0)
        _y *= -1;

      vm.move(x+_x, y+_y);
    }
  };

  // Get proper coordinate values associated with the number
  function getCoords(n) {
    return { x: (n-1) % 4, y: Math.floor((n-1) / 4) };
  }

  // Get the distance of the tile at (x, y) from its proper position
  function distance(grid, x, y) {
    var coords = getCoords(grid[y][x] || 16);

    return Math.abs(x-coords.x) + Math.abs(y-coords.y);
  }

  // Evaluate how solved the grid is (lower is better)
  function evaluate(grid) {
    
    var result = 0;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
        result += distance(grid, x, y);
      }
    }
    
    // Penalize for incomplete rows
    if (!(grid[0][0] == 1 && grid[0][1] == 2 && grid[0][2] == 3 && grid[0][3] == 4))
      result += 40;
//    else if (!(grid[1][0] == 5 && grid[1][1] == 6 && grid[1][2] == 7 && grid[1][3] == 8))
//      result += 20;
    
    // Penalize for incomplete columns
    if (!(grid[0][0] == 1 && grid[1][0] == 5 && grid[2][0] == 9 && grid[3][0] == 13))
      result += 40;
//    else if (!(grid[0][1] == 2 && grid[1][1] == 6 && grid[2][1] == 10 && grid[3][1] == 14))
//      result += 20;
    
    return result;
  }

  // Get the coordinates of the empty square
  function getEmpty(grid) {
    for (var x = 0; x < 4; x++)
      for (var y = 0; y < 4; y++)
        if (!grid[y][x])
          return { x: x, y: y };
  }

  // Get 1-move permutations
  function permutations(grid) {
    var empty = getEmpty(grid);
    var result = [];
    for (var x = -1; x <= 1; x++)
      for (var y = -1; y <= 1; y++) {
        var permutation = angular.copy(grid);
        if (move(permutation, empty, empty.x+x, empty.y+y))
          result.push(permutation);
      }        
    return result;
  }

  // Pops the element with the lowest number of steps and the lowest distance
  function popNextStep(states) {
    var lowest = 0;
    states.forEach(function(state, i) {
      if (state.history.length + state.value < states[lowest].history.length + states[lowest].value)
        lowest = i;
    });
    return states.splice(lowest, 1)[0];
  }

  // Generate unique ID based on a grid's state
  function getId(grid) {
    var id = 0;

    for (var x = 0; x < 4; x++)
      for (var y = 0; y < 4; y++)
        id += grid[y][x] * Math.pow(16, 4*y + x);

    return id;
  }

  // Solve the puzzle
  function solve(grid) {    
    var states = [{ grid: grid, value: evaluate(grid), history: [] }];    
    var gridIds = {};

    gridIds[getId(grid)] = 0;       

    var result;    

    while (states.length && !result) {            
      var next = popNextStep(states);

      console.log(next.value, next.history.length);

      permutations(next.grid).forEach(function(grid) {
        var id = getId(grid);
        var value = evaluate(grid);

        if (gridIds[id] && gridIds[id] <= value)
          return;

        gridIds[id] = value;

        var history = angular.copy(next.history);        
        history.push(grid);

        var state = { grid: grid, value: value, history: history };

        if (!value)
          result = state;
        else
          states.push(state);
      });
    }

    return result;
  }
});