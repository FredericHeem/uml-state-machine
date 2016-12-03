
import {State} from './State'

export function Machine(definition, action) {
  //console.log(definition)
  const currentState = State(definition.state, null);

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
        console.log("event ", event, ", payload: ", payload)
      }
      return machine;
    }, machine);
  }

  let machine = {
    action
  };

  machine = addEvents(machine, definition.events)

  return machine
}
