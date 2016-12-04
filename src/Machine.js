import _ from 'lodash';

import {buildStateMap, findInitialState, walkOnEntry} from './State'

export function Machine({
  definition,
  actioner,
  observers}) {

  observers = {
    onEntry: _.noop,
    onExit: _.noop,
    onTransitionBegin: _.noop,
    onTransitionEnd: _.noop,
    ...observers
  }

  const stateMap = buildStateMap(definition);
  let currentState = getRootState()
  let previousState = null;
  let nextState = null;

  function getRootState(){
    return stateMap.get(definition.state.name)
  }

  function enterInitialState(){
    const initialStateName = findInitialState(definition.state);
    walkOnEntry(machine, getRootState(), stateMap.get(initialStateName));
    setStateCurrent(initialStateName)
  }

  function getCurrentState(){
    return currentState
  }

  function setStateCurrent(stateName){
    currentState = stateMap.get(stateName)
    if(!currentState){
      throw {
        name: "RunTime",
        message: "invalid state name",
        function: "setStateCurrent",
        details: stateName
      }
    }
  }

  function setStateNext(stateName){
    nextState = stateName
  }

  function addEventHandlers(machine, events) {
    return events.reduce((machine, event) => {
      const eventId = event;
      //console.log("add event id ", event)
      machine[eventId] = (payload) => {
        //console.log("Rx Event id ", eventId, ", payload: ", payload)
        const currentState = getCurrentState();
        if(currentState[eventId]){
          currentState[eventId](machine, payload)
        } else {
          throw {
            name: "Internal",
            eventId: eventId,
            state: currentState.name(),
            details: currentState
          }
        }
      }
      return machine;
    }, machine);
  }

  let machine = {
    actioner,
    observers,
    stateMap(){
      return stateMap;
    },
    enterInitialState,
    setStateCurrent,
    getStateCurrent(){
      return currentState
    },
    getStatePrevious(){
      return previousState
    },
    setStatePrevious(state){
      previousState = state
    },
    getStateNext(){
      return nextState
    },
    setStateNext,
    setStatePreviousFromCurrent(){
      previousState = currentState;
      return previousState;
    }
  };

  machine = addEventHandlers(machine, definition.events)

  return machine
}
