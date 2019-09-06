//Perform iterative deepening search from initial state, using defined "is_goal_state"
//and "find_successors" functions
//Returns: null if no goal state found
//Returns: object with two members, "actions" and "states", where:
//  actions: Sequence(Array) of action ids required to reach the goal state from the initial state
//  states: Sequence(Array) of states that are moved through, ending with the reached goal state (and EXCLUDING the initial state)
//  The actions and states arrays should both have the same length.
function iterative_deepening_search(initial_state) {
  
  let i = 1;
  let path = depth_limited_search(initial_state, i);
  while (path == null) {
    i++;
    path = depth_limited_search(initial_state, i);
  }
  
  return path;
}
