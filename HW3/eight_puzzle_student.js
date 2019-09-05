/*
================
8-puzzle problem
================
Construct a 3x3 grid, containing one blank(empty) space and one each of tiles labeled 1-8.
By exchanging tiles adjacent to the blank space with the blank space, achieve the desired configuration:
 1 2 3
 8   4
 7 6 5

State:
{
  grid : Array(3,3), Integers [0,8]
}
where grid is a 2D array whose indices correspond to the following grid positions:
 [0][0] [0][1] [0][2]
 [1][0] [1][1] [1][2]
 [2][0] [2][1] [2][2]
The value 0 is used to represent the blank space, and 1-8 for the corresponding labeled tiles.

Possible actions:
ID | Action
---+----------------------
 1 | Move tile above blank down (i.e., "move" blank up)
---+----------------------
 2 | Move tile below blank up (i.e., "move" blank down)
---+----------------------
 3 | Move tile left of blank right (i.e., "move" blank left)
---+----------------------
 4 | Move tile right of blank left (i.e., "move" blank right)
*/

//////////////////////////////////////////////////////////////////////////////
// Complete the following two functions

//Check if the given state is a goal state
//Returns: true if is goal state, false otherwise
function is_goal_state(state) {
  ++helper_eval_state_count; //Keep track of how many states are evaluated (DO NOT REMOVE!)

  const goal_state = [
    [1, 2, 3],
    [8, 0, 4],
    [7, 6, 5]
  ];

  for (var i = 0; i < goal_state.length; i++) {
    for (var j = 0; j < goal_state[i].length; j++) {
      if (state.grid[i][j] != goal_state[i][j]) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Computes the location of the blank.
 * 
 * @param {Array} state 
 * @returns {Array} location of blank in row by column
 */
function find_blank(state) {
  for (var i = 0; i < state.length; i++) {
    for (var j = 0; j < state[0].length; j++) {
      if (state[i][j] == 0) {
        return [i, j];
      }
    }
  }
}

//Find the list of actions that can be performed from the given state and the new
//states that result from each of those actions
//Returns: Array of successor objects (where each object has a valid actionID member and corresponding resultState member)
function find_successors(state) {
  ++helper_expand_state_count; //Keep track of how many states are expanded (DO NOT REMOVE!)
  
  let successors=[];
  const actions = {
    1: [-1, 0],
    2: [1, 0],
    3: [0, 1],
    4: [0, -1]
  }

  const blankPosition = find_blank(state);

  for (var i = 1; i < 5; i++) {
    let newState = {
      grid : state.grid.map(x => x.slice(0)) //Deep copy of grid
    };

    newBlankPosition = [
      blankPosition[0] + actions[i][0],
      blankPosition[1] + actions[i][1]
    ]

    valAtNewPosition = newState[newBlankPosition[0]][newBlankPosition[1]]
    newState[newBlankPosition[0]][newBlankPosition[1]] = 0;
    newState[blankPosition[0]][blankPosition[1]] = valAtNewPosition;
    
    successors.push({
      actionID : i,
      resultState : newState
    });
  }
  

  return successors;
}

//////////////////////////////////////////////////////////////////////////////
// Use these functions when developing your A* implementation

//Heuristic functions for the 8-puzzle problem
function calculate_heuristic(state) {
  //Total Manhattan distance heuristic
  let goal=[ [1, 2, 3], [8, 0, 4], [7, 6, 5] ];

  let g_pos=Array(9);
  let st_pos=Array(9);
  for(let j=0;j<3;++j)
    for(let i=0;i<3;++i) {
        g_pos[ goal[j][i] ]=[j,i];
        st_pos[ state.grid[j][i] ]=[j,i];
    }

  let h=0;
  for(let i=0;i<9;++i) {
    h+=Math.abs( st_pos[i][0]-g_pos[i][0] )+Math.abs( st_pos[i][1]-g_pos[i][1] );
  }
  return h;
}

/*
function calculate_heuristic(state) {
  //Misplaced tiles heuristic
  let goal=[ [1, 2, 3], [8, 0, 4], [7, 6, 5] ];

  let h=0;
  for(let j=0;j<3;++j)
    for(let i=0;i<3;++i) {
      if(state.grid[j][i]!=goal[j][i])
        ++h;
    }
  if(h>0) --h; //Account for miscounted blank
  return h;
}
*/

/*
function calculate_heuristic(state) {
  //Simplest heuristic (h(n)=0)
  return 0;
}
*/
