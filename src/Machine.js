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
      if (!event.id) {
        throw {
          name: "Parser",
          message: "Event id is missing",
          details: event
        }
      }

      machine[event.id] = (payload) => {
        //console.log("event id ", event.id, ", payload: ", payload)

        const previousState = getCurrentState();
        const currentState = getCurrentState();
        //observers.onTransitionBegin(machine, previousState.name())
        currentState[event.id](machine, payload)
        //observers.onTransitionEnd(machine, currentState.name(), getCurrentState().name())
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
