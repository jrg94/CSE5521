//Perform depth-limited search from initial state, using defined "is_goal_state"
//and "find_successors" functions
//Will not examine paths longer than "depth_limit" (i.e. paths that have "depth_limit" states in them, or "depth_limit-1" actions in them)
//Returns: null if no goal state found
//Returns: object with two members, "actions" and "states", where:
//  actions: Sequence(Array) of action ids required to reach the goal state from the initial state
//  states: Sequence(Array) of states that are moved through, ending with the reached goal state (and EXCLUDING the initial state)
//  The actions and states arrays should both have the same length.
function depth_limited_search(initial_state,depth_limit) {
  var stack = [];
  
  stack.push(wrap_dfs_state(initial_state, null, null, 1));  
  while (stack.length != 0 && !is_goal_state(stack[stack.length-1].state)) {
    let state = stack.pop();

    if (state.depth < depth_limit) {
      let successors = find_successors(state.state);
      for (var i = 0; i < successors.length; i++) {
        let successor = successors[i];
        stack.push(wrap_dfs_state(successor.resultState, state, successor.actionID, state.depth + 1))
      }
    }
  }

  return stack.length == 0 ? null: compute_path(stack[stack.length-1]);
}

/**
 * Wraps the state to include predecessor and action
 * 
 * @param {Array} state the state as a 3x3 grid
 * @param {Object} predecessor the return value of this function for a previous state
 * @param {number} action the action to achieve this state
 * @param {number} depth the current stack depth
 */
function wrap_dfs_state(state, predecessor, action, depth) {
  return {
    state: state,
    predecessor: predecessor,
    action: action,
    depth: depth
  }
}
