//Perform breadth-first search from initial state, using defined "is_goal_state"
//and "find_successors" functions
//Returns: null if no goal state found
//Returns: object with two members, "actions" and "states", where:
//  actions: Sequence(Array) of action ids required to reach the goal state from the initial state
//  states: Sequence(Array) of states that are moved through, ending with the reached goal state (and EXCLUDING the initial state)
//  The actions and states arrays should both have the same length.
function breadth_first_search(initial_state) {
  let open = []; //See push()/pop() and unshift()/shift() to operate like stack or queue
                 //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  let closed = new Set(); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

  // Initial state is just the grid
  open.unshift(wrap_state(initial_state, null, null));

  while (open.length != 0 && !is_goal_state(open[0].state)) {
    let state = open.shift();
    closed.add(state_to_uniqueid(state.state));

    let successors = find_successors(state.state);
    for (var i = 0; i < successors.length; i++) {
      let successor = successors[i];
      if (!closed.has(state_to_uniqueid(successor.resultState))) {
        open.unshift(wrap_state(successor.resultState, state, successor.actionID));
      }
    }
  }

  let path = {
    actions: [],
    states: []
  };
  let node = open[0];
  while (node.predecessor != null) {
    path.states.unshift(node.state);
    path.actions.unshift(node.action);
    node = node.predecessor;
  }

  /*
    Hint: In order to generate the solution path, you will need to augment
      the states to store the predecessor/parent state they were generated from
      and the action that generates the child state from the predecessor state.
      
	  For example, make a wrapper object that stores the state, predecessor and action.
	  Javascript objects are easy to make:
		let object={
			member_name1 : value1,
			member_name2 : value2
		};
      
    Hint: Because of the way Javascript Set objects handle Javascript objects, you
      will need to insert (and check for) a representative value instead of the state
      object itself. The state_to_uniqueid function has been provided to help you with
      this. For example
        let state=...;
        closed.add(state_to_uniqueid(state)); //Add state to closed set
        if(closed.has(state_to_uniqueid(state))) { ... } //Check if state is in closed set
  */
  
  /***Your code to generate solution path here***/
  
  /*
  return {
    actions : ,
    states : 
  };
  */
  
  //OR

  //No solution found
  return path;
}

/**
 * 
 * @param {Array} state 
 * @param {} predecessor 
 * @param {*} action 
 */
function wrap_state(state, predecessor, action) {
  return {
    state: state,
    predecessor: predecessor,
    action: action
  }
}
