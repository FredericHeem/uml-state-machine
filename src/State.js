import _ from 'lodash';

export function traverseState(currentState, parent, callback = _.noop) {
  callback(currentState, parent)
  if (currentState.states) {
    currentState.states.forEach(state => {
      traverseState(state, currentState, callback)
    })
  }
}

export function buildStateMap(smDef) {
  const stateMap = new Map();
  const callback = (state, parent) => {
    //console.log("callback " ,state)
    const parentModel = parent ? stateMap.get(parent.name) : undefined
    const stateModel = State(smDef, state, parentModel)
    stateMap.set(state.name, stateModel)
  }
  if (!smDef.state) {
    throw {
      name: "Parser",
      message: "Root state is missing: " + smDef,
      details: smDef
    }
  }
  traverseState(smDef.state, null, callback);
  return stateMap;
}

function isEqualState(s1, s2) {
  return s1.name() === s2.name()
}

export function isAncestor(ancestorState, childState) {
  const parent = childState.parent();
  if (!parent) {
    return false
  }
  if (isEqualState(ancestorState, parent)) {
    return true
  } else {
    return isAncestor(ancestorState, parent)
  }
}

function processTransactionPre(context, stateNext) {
  const statePrevious = context.setStatePreviousFromCurrent();
  context.setStateNext(stateNext);

  context.observers.onTransitionBegin(context, statePrevious.name(), stateNext.name());

  walkOnExit(context, statePrevious, stateNext)
}

function processTransactionPost(context, stateNext) {
  const statePrevious = context.getStatePrevious();
  walkOnEntry(context, statePrevious, stateNext);
  context.setStatePrevious(null);
  context.setStateNext(null);
  const stateCurrent = stateNext ? stateNext : statePrevious
  context.setStateCurrent(stateCurrent.name())
  context.observers.onTransitionEnd(context, statePrevious.name(), stateNext.name());
}

export function walkOnEntry(context, previousState, nextState) {
  if (!nextState) {
    return;
  }

  function onEntry(nextState) {
    context.observers.onEntry(context, nextState.name())
    nextState.onEntry(context.actioner);
  }

  if (isEqualState(previousState, nextState)) {
    onEntry(nextState)
  }
  else if (!isAncestor(nextState, previousState)) {
    const parent = nextState.parent()
    if (parent) {
      walkOnEntry(context, previousState, parent)
      onEntry(nextState)
    }
  }
}

export function walkOnExit(context, previousState, nextState) {
  if (!nextState) {
    return;
  }

  if (!isAncestor(previousState, nextState)) {
    context.observers.onExit(context, previousState.name())
    previousState.onExit(context.actioner);
    const parent = nextState.parent()
    if (parent) {
      walkOnExit(context, parent, nextState)
      return;
    }
  }
}

export function findInitialState(stateInfo) {
  const {states} = stateInfo
  if (states && states[0]) {
    return findInitialState(states[0])
  } else {
    return stateInfo.name;
  }
}

function createAllEvents(state, events) {
  return _.reduce(events, (state, event) => {
    console.log("createAllEvents event ", state.name(), event)
    state[event] = (context) => {
      //console.log("unhandle event ", event, ", state: ", context.getStateCurrent().name())
    }
    return state;
  }, state)
}

function createEvents(state, transitions) {
  if (!transitions) {
    return state
  }

  const events = _.groupBy(transitions, 'event');
  //console.log("event ", events)
  return _.reduce(events, (state, transitions, key) => {
    console.log("adding event key ", key, " to state ", state.name()),
    //console.log("transitions ", transitions)
    state[key] = (context) => {

      transitions.some(transition => {
        if (transition.condition && !transition.condition()) {
          return false;
        }

        const {nextState: nextStateName} = transition
        if (nextStateName) {
          const nextState = context.stateMap().get(nextStateName);
          processTransactionPre(context, nextState);

          if (transition.actions) {
            //console.log("transition.actions ", transition.actions.length)
            transition.actions.forEach(action => action(context.actioner));
          }
          processTransactionPost(context, nextState);
        }
        return true
      })
    }
    return state;
  }, state)
}

export function State(smDef, stateInfo = {}, stateParent) {
  //console.log("State ", stateInfo.name);

  let state = Object.assign({}, stateParent, {
    isRoot() {
      return !stateParent
    },
    isLeaf() {
      return !stateInfo.states
    },
    name() {
      return stateInfo.name
    },
    parent() {
      return stateParent;
    },
    info() {
      return stateInfo;
    },
    onEntry(context) {
      if (stateInfo.onEntry) stateInfo.onEntry(context)
    },
    onExit(context) {
      if (stateInfo.onExit) stateInfo.onExit(context)
    }
  })

  if (!stateParent) {
    state = createAllEvents(state, smDef.events)
  }

  state = createEvents(state, stateInfo.transitions);
  return state;
}
