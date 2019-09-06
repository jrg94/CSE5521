//Perform breadth-first search from initial state, using defined "is_goal_state"
//and "find_successors" functions
//Returns: null if no goal state found
//Returns: object with two members, "actions" and "states", where:
//  actions: Sequence(Array) of action ids required to reach the goal state from the initial state
//  states: Sequence(Array) of states that are moved through, ending with the reached goal state (and EXCLUDING the initial state)
//  The actions and states arrays should both have the same length.
function astar_search(initial_state) {
  let open = new FastPriorityQueue(function(a,b) { return a.estimated_total_cost < b.estimated_total_cost; });
  let closed = new Set();
  let fixed_step_cost = 1; //Assume action cost is constant

  /***Your code for A* search here***/
  
  open.add(wrap_astar_state(initial_state, null, null, 0, 0));
  while (!open.isEmpty() && !is_goal_state(open.peek().state)) {
    let state = open.poll();
    closed.add(state_to_uniqueid(state.state));

    let successors = find_successors(state.state);
    for (var i = 0; i < successors.length; i++) {
      let successor = successors[i];
      if (!closed.has(state_to_uniqueid(successor.resultState))) {
        open.add(
          wrap_astar_state(
            successor.resultState, 
            state, 
            successor.actionID, 
            state.path_cost + fixed_step_cost, 
            state.estimated_total_cost + calculate_heuristic(successor.resultState)
          )
        );
      }
    }
  }

  // If we've exhausted the open list, we've failed.
  return open.isEmpty() ? null: compute_path(open.peek());
}

/**
 * Wraps the state to include predecessor and action
 * 
 * @param {Array} state 
 * @param {Object} predecessor 
 * @param {number} action 
 * @param {number} path_cost
 * @param {number} estimated_total_cost
 */
function wrap_astar_state(state, predecessor, action, path_cost, estimated_total_cost) {
  return {
    state: state,
    predecessor: predecessor,
    action: action,
    path_cost: path_cost,
    estimated_total_cost: estimated_total_cost
  }
}
