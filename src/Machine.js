
import {State, buildStateMap} from './State'

export function Machine(smDef, action) {
  //const currentState = State(smDef, smDef.state, null);
  const stateMap = buildStateMap(smDef);

  function getCurrentState(){
    return stateMap.get('On')
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
/*
      for(let state of stateMap.values()){
        console.log(state.name());
        state[event.id] = (payload) => {
          console.log("state ", state.name(), ", event ", event, ", payload: ", payload)
        }
      }
*/
      machine[event.id] = (payload) => {
        console.log("event ", event, ", payload: ", payload)
        //getCurrentState()[event.id](machine)
      }
      return machine;
    }, machine);
  }

  let machine = {
    action,
    stateMap(){
      return stateMap;
    }
  };

  machine = addEvents(machine, smDef.events)

  return machine
}
