
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

      machine[event.id] = (payload) => {
        console.log("event id ", event.id, ", payload: ", payload)
        const currentState = getCurrentState();
        console.log("getCurrentState ", currentState.name())
        //console.log("currentState ", currentState)
        currentState[event.id](machine)
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
