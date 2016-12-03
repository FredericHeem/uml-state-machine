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

function createAllEvents(state, events){
  //console.log("createAllEvents ", state.name())
  return _.reduce(events, (state, event) => {
    //console.log("createAllEvents event ", state.name(), event.id)
    state[event.id] = (context) => {
      console.log("createAllEvents ", event, "event ", event)
      console.log("createAllEvents context ", context.action)
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
    console.log("event key ", key),
    console.log("transitions ", transitions)
    state[key] = (context) => {

      transitions.some(transition => {
        if(transition.condition && !transition.condition()){
            return false;
        }
        if(transition.actions){
          console.log("transition.actions ", transition.actions.length)
          transition.actions.forEach(action => action(context.action));
        }

        if(transition.nextState){
          console.log("transition.nextState ", transition.nextState)
        }
        return true
      })
      console.log("state ", state.name())
      console.log("context ", context.action)
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
      console.log("State onEntry ", stateInfo.name)
      if(stateInfo.onEntry) stateInfo.onEntry(context)
    },
    onExit(context){
      console.log("State onExit ", stateInfo.name)
      if(stateInfo.onExit) stateInfo.onExit(context)
    }
  })

  if(!stateParent){
    state = createAllEvents(state, smDef.events)
    console.log("state ", state)
  }

  state = createEvents(state, stateInfo.transitions);
  return state;
}
