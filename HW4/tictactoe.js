//Define the order in which to examine/expand possible moves
//(This affects alpha-beta pruning performance)
//let move_expand_order = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //Naive (linear) ordering
//let move_expand_order = [4, 0, 1, 2, 3, 5, 6, 7, 8]; //Better ordering?
let move_expand_order = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Optimal ordering
//let move_expand_order = [1, 3, 5, 7, 0, 2, 6, 8, 4]; // Worst ordering

// A mapping of all possible win conditions
const mapping = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

/////////////////////////////////////////////////////////////////////////////

function tictactoe_minimax(board, cpu_player, cur_player) {
  /***********************************************************
  * board: game state, an array representing a tic-tac-toe board
  * The positions correspond as follows
  * 0|1|2
  * -+-+-
  * 3|4|5 -> [ 0,1,2,3,4,5,6,7,8 ]
  * -+-+-
  * 6|7|8
  * For each board location, use the following:
  *  -1 if this space is blank
  *   0 if it is X
  *   1 if it is O
  *
  * cpu_player: Which piece is the computer designated to play
  * cur_player: Which piece is currently playing
  *   0 if it is X
  *   1 if it is O
  * So, to check if we are currently looking at the computer's
  * moves do: if(cur_player===cpu_player)
  *
  * Returns: Javascript object with 2 members:
  *   score: The best score that can be gotten from the provided game state
  *   move: The move (location on board) to get that score
  ***********************************************************/

  //BASE CASE
  if (is_terminal(board)) //Stop if game is over
    return {
      move: null,
      score: utility(board, cpu_player) //How good was this result for us?
    }

  let min_max_score = cur_player === cpu_player ? -Infinity : Infinity;
  let min_max_move = null;

  ++helper_expand_state_count; //DO NOT REMOVE
  //GENERATE SUCCESSORS
  for (let move of move_expand_order) { //For each possible move (i.e., action)
    if (board[move] != -1) continue; //Already taken, can't move here (i.e., successor not valid)

    let new_board = board.slice(0); //Copy
    new_board[move] = cur_player; //Apply move
    //Successor state: new_board

    //RECURSION
    // What will my opponent do if I make this move?
    let results = tictactoe_minimax(new_board, cpu_player, 1 - cur_player);

    //MINIMAX
    if (cur_player === cpu_player) {
      if (results.score > min_max_score) {
        min_max_score = results.score;
        min_max_move = move;
      }
    } else {
      if (results.score < min_max_score) {
        min_max_score = results.score;
        min_max_move = move;
      }
    }

  }

  //Return results gathered from all sucessors (moves).
  //Which was the "best" move?  
  return {
    move: min_max_move,
    score: min_max_score
  };
}

/**
 * Tests if the game is complete.
 * 
 * @param {Array} board that game board
 */
function is_terminal(board) {
  ++helper_eval_state_count; //DO NOT REMOVE

  let winner = get_win_value(board);
  let isFull = is_full(board);
  return winner >= 0 || isFull;
}

/**
 * A helper function which detects if the board
 * is filled or not.
 * 
 * @param {Array} board the game board
 */
function is_full(board) {
  let count = 0;
  for (var i = 0; i < board.length; i++) {
    if (board[i] != -1) {
      count++;
    }
  }
  return count == board.length;
}

/**
 * Returns which player won:
 * 0 for X
 * 1 for O
 * -1 if neither (not necessarily a draw)
 * 
 * @param {Array} board the game board as a list
 */
function get_win_value(board) {
  for (var i = 0; i < mapping.length; i++) {
    var check = [];
    for (var j = 0; j < mapping[i].length; j++) {
      check.push(board[mapping[i][j]]);
    }
    if (check.every((val, i, arr) => val === arr[0] && val != -1)) {
      return check[0];
    }
  }
  return -1;
}

/**
 * TASK: Implement the utility function
 *
 * Return the utility score for a given board, with respect to the indicated player
 *
 * Give score of 0 if the board is a draw
 * Give a positive score for wins, negative for losses.
 * Give larger scores for winning quickly or losing slowly
 * For example:
 *   Give a large, positive score if the player had a fast win (i.e., 5 if it only took 5 moves to win)
 *   Give a small, positive score if the player had a slow win (i.e., 1 if it took all 9 moves to win)
 *   Give a small, negative score if the player had a slow loss (i.e., -1 if it took all 9 moves to lose)
 *   Give a large, negative score if the player had a fast loss (i.e., -5 if it only took 5 moves to lose)
 * (DO NOT simply hard code the above 4 values, other scores are possible. Calculate the score based on the above pattern.)
 * (You may return either 0 or null if the game isn't finished, but this function should never be called in that case anyways.)
 *
 * Hint: You can find the number of turns by counting the number of non-blank spaces
 *       (Or the number of turns remaining by counting blank spaces.)
 * 
 * @param {Array} board the game board
 * @param {Number} player the current player
 */
function utility(board, player) {
  // Count the number of turns
  var turnsLeft = 0;
  for (var i = 0; i < board.length; i++) {
    if (board[i] == -1) {
      turnsLeft += 1;
    }
  }

  // Determine if we have a winner
  var score = 0;
  let winner = get_win_value(board);
  if (winner >= 0) {
    score = turnsLeft + 1;
    if (winner != player) {
      score *= -1;
    }
  }

  return score;
}

function tictactoe_minimax_alphabeta(board, cpu_player, cur_player, alpha, beta) {
  /***********************
  * TASK: Implement Alpha-Beta Pruning
  *
  * Once you are confident in your minimax implementation, copy it here
  * and add alpha-beta pruning. (What do you do with the new alpha and beta parameters/variables?)
  *
  * Hint: Make sure you update the recursive function call to call this function!
  ***********************/
  //BASE CASE
  if (is_terminal(board)) //Stop if game is over
    return {
      move: null,
      score: utility(board, cpu_player) //How good was this result for us?
    }

  let min_max_score = cur_player === cpu_player ? -Infinity : Infinity;
  let min_max_move = null;

  ++helper_expand_state_count; //DO NOT REMOVE
  //GENERATE SUCCESSORS
  for (let move of move_expand_order) { //For each possible move (i.e., action)
    if (board[move] != -1) continue; //Already taken, can't move here (i.e., successor not valid)

    let new_board = board.slice(0); //Copy
    new_board[move] = cur_player; //Apply move
    //Successor state: new_board

    //RECURSION
    // What will my opponent do if I make this move?
    let results = tictactoe_minimax_alphabeta(new_board, cpu_player, 1 - cur_player, alpha, beta);

    //MINIMAX
    if (cur_player === cpu_player) {
      if (results.score > alpha) {
        min_max_score = results.score;
        alpha = results.score;
        min_max_move = move;
      }
    } else {
      if (results.score < beta) {
        min_max_score = results.score;
        beta = results.score;
        min_max_move = move;
      }
    }

    if (alpha > beta) {
      break;
    }

  }

  //Return results gathered from all sucessors (moves).
  //Which was the "best" move?  
  return {
    move: min_max_move,
    score: min_max_score
  };
}

function debug(board, human_player) {
  /***********************
  * This function is run whenever you click the "Run debug function" button.
  *
  * You may use this function to run any code you need for debugging.
  * The current "initial board" and "human player" settings are passed as arguments.
  *
  * (For the purposes of grading, this function will be ignored.)
  ***********************/
  helper_log_write("Testing board:");
  helper_log_board(board);

  let tm = is_terminal(board);
  helper_log_write("is_terminal() returns " + (tm ? "true" : "false"));

  let u = utility(board, human_player);
  helper_log_write("utility() returns " + u + " (w.r.t. human player selection)");
}
