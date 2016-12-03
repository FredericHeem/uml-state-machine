import _ from 'lodash';

export function traverseState(currentState, parent, callback = _.noop) {
  callback(currentState, parent)
  if (currentState.states) {
    currentState.states.forEach(state => {
      traverseState(state, currentState, callback)
    })
  }
}

export function buildStateMap(stateRootDef) {
  const stateMap = new Map();
  const callback = (state, parent) => {
    //console.log("buildStateMap current: ", state.name, "parent: ", parent)
    const parentModel = parent ? stateMap.get(parent.name) : undefined
    const stateModel = State(state, parentModel)
    stateMap.set(state.name, stateModel)
  }
  traverseState(stateRootDef, null, callback);
  //console.log("buildStateMap size ", stateMap.size)
  return stateMap;
}

function isEqualState(s1, s2){
  return s1.name() === s2.name()
}

export function isAncestor(ancestorState, childState){
  //console.log("isAncestor", ancestorState.name())
  const parent = childState.parent();
  if(!parent){
    //console.log("isAncestor no parent", childState.name())
    return false
  }
  //console.log("ancestorState", ancestorState.name())
  //console.log("childState", childState.name())
  if(isEqualState(ancestorState, parent)){
    return true
  } else {
    return isAncestor(ancestorState, parent)
  }
}

export function walkOnEntry(context, previousState, nextState) {
  //console.log("walkOnEntry", previousState.name(), nextState.name())
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
  //console.log("walkOnExit", previousState.name(), nextState.name())
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

export function State(stateInfo = {}, stateParent) {
  return {
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
}
