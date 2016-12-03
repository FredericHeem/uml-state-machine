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

  function onEntry(nextState){
    //console.log("walkOnEntry  ", nextState.name())
    context.observers.onEntry(context, nextState.name())
    nextState.onEntry(context.actioner);
  }

  if(isEqualState(previousState, nextState)){
    onEntry(nextState)
  }
  else if(!isAncestor(nextState, previousState)){
    const parent = nextState.parent()
    if(parent){
      walkOnEntry(context, previousState, parent)
      onEntry(nextState)
    }
  }
}

export function walkOnExit(context, previousState, nextState) {
  if(!nextState){
    return;
  }

  if(!isAncestor(previousState, nextState)){
    context.observers.onExit(context, previousState.name())
    previousState.onExit(context.actioner);
    const parent = nextState.parent()
    if(parent){
      walkOnExit(context, parent, nextState)
      return;
    }
  }
}

function createAllEvents(state, events){
  return _.reduce(events, (state, event) => {
    //console.log("createAllEvents event ", state.name(), event.id)
    state[event.id] = (context) => {
      //console.log("unhandle event ", event, ", state: ", context.getStateCurrent().name())
    }
    return state;
  }, state)
}

function createEvents(state, transitions){
  //console.log("createEvents ", state.name())
  if(!transitions){
    return state
  }

  const events = _.groupBy(transitions, 'event');
  //console.log("event ", events)
  return _.reduce(events, (state, transitions, key) => {
    //console.log("event key ", key),
    //console.log("transitions ", transitions)
    state[key] = (context) => {

      transitions.some(transition => {
        if(transition.condition && !transition.condition()){
            return false;
        }
        if(transition.actions){
          //console.log("transition.actions ", transition.actions.length)
          transition.actions.forEach(action => action(context.actioner));
        }
        const {nextState: nextStateName} = transition
        if(nextStateName){
          const nextState = context.stateMap().get(nextStateName);
          walkOnExit(context, context.getStateCurrent(), nextState)
          context.setStateCurrent(transition.nextState)
          walkOnEntry(context, context.getStateCurrent(), nextState)
        }
        return true
      })
      //console.log("state ", state.name())
      //console.log("context ", context.action)
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
    parent(){
      return stateParent;
    },
    info(){
      return stateInfo;
    },
    onEntry(context){
      //console.log("State onEntry ", stateInfo.name)
      if(stateInfo.onEntry) stateInfo.onEntry(context)
    },
    onExit(context){
      //console.log("State onExit ", stateInfo.name)
      if(stateInfo.onExit) stateInfo.onExit(context)
    }
  })

  if(!stateParent){
    state = createAllEvents(state, smDef.events)
    //console.log("state ", state)
  }

  state = createEvents(state, stateInfo.transitions);
  return state;
}
