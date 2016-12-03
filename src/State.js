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
  if(!smDef.state){
    throw {
      name: "Parser",
      message: "Root state is missing: " + smDef,
      details: smDef
    }
  }
  traverseState(smDef.state, null, callback);
  return stateMap;
}

function isEqualState(s1, s2){
  return s1.name() === s2.name()
}

export function isAncestor(ancestorState, childState){
  const parent = childState.parent();
  if(!parent){
    return false
  }
  if(isEqualState(ancestorState, parent)){
    return true
  } else {
    return isAncestor(ancestorState, parent)
  }
}

export function walkOnEntry(context, previousState, nextState) {
  if(!nextState){
    return;
  }

  if(isEqualState(previousState, nextState)){
    nextState.onEntry(context.action);
    return
  }

  if(!isAncestor(nextState, previousState)){
    const parent = nextState.parent()
    if(parent){
      walkOnEntry(context, previousState, parent)
      nextState.onEntry(context.action);
    }
  }
}

export function walkOnExit(context, previousState, nextState) {
  if(!nextState){
    return;
  }

  if(!isAncestor(previousState, nextState)){
    previousState.onExit(context.action);
    const parent = nextState.parent()
    if(parent){
      walkOnExit(context, parent, nextState)
      return;
    }
  }
}

export function State(smDef, stateInfo = {}, stateParent) {
  //console.log("State ", stateInfo.name)
  function createEvents(state, transitions){
    if(!transitions){
      return state
    }
    const events = _.groupBy(transitions, 'event');
    //console.log("event ", events)
    return _.reduce(events, (state, event) => {
      state[event] = (context) => {
        console.log("state ", state.name(), "event ", event)
        console.log("context ", context.action)
      }
      return state;
    }, state)
  }


  let state = {
    isRoot() {
      return !stateParent
    },
    isLeaf() {
      return !stateInfo.states
    },
    name() {
      return stateInfo.name
    },
    parent(){
      return stateParent;
    },
    info(){
      return stateInfo;
    },
    onEntry(context){
      console.log("State onEntry ", stateInfo.name)
      if(stateInfo.onEntry) stateInfo.onEntry(context)
    },
    onExit(context){
      console.log("State onExit ", stateInfo.name)
      if(stateInfo.onExit) stateInfo.onExit(context)
    }
  }

  state = createEvents(state, stateInfo.transitions);
  return state;
}
