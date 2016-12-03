import _ from 'lodash';

import {State, buildStateMap} from './State'

export function Machine({
  definition,
  actioner,
  observers}) {

  observers = {
    onEntry: _.noop,
    onExit: _.noop,
    ...observers
  }

  let currentState = State(definition, definition.state, null);
  let previousState = null;
  let nextState = null;

  const stateMap = buildStateMap(definition);

  function getCurrentState(){
    return currentState
  }

  function setStateNext(stateName){
    nextState = stateName
  }

  function addEvents(machine, events) {
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
        const currentState = getCurrentState();
        //console.log("getCurrentState ", currentState.name())
        //console.log("currentState ", currentState)
        currentState[event.id](machine, payload)
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
    setStateCurrent(stateName){
       currentState = stateMap.get(stateName)
       if(!currentState){
        throw {
          name: "RunTime",
          message: "invalid state name",
          function: "setStateCurrent",
          details: stateName
        }
       }
    },
    getStateCurrent(){
      return currentState
    },
    getStatePrevious(){
      return previousState
    },
    getStateNext(){
      return nextState
    },
    setStateNext
  };

  machine = addEvents(machine, definition.events)

  return machine
}
