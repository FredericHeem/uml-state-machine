import { assert } from 'chai';
import { Machine } from '../src/index';
import {walkOnEntry, walkOnExit} from "../src/State";

function Light() {
  return {
    doOn() {
      //console.log("doOff")
    },
    doOff() {
      //console.log("doOff")
    },
    log(msg){
      //console.log(`light log: ${msg}`)
    }
  }
}

const smDef = {
  name: "LightSwitch",
  events: ["evOn", "evOff"],
  state: {
    name: "Light",
    states: [
      {
        name: "Off",
        onEntry: light => light.doOff(),
        transitions: [{
          event: "evOn",
          nextState: "On",
          actions:[
            light => light.log("starting on")
          ]
        }]
      },
      {
        name: "On",
        onEntry: light => light.doOn(),
        transitions: [{
          event: "evOff",
          nextState: "Off",
          actions:[
            light => light.log("starting off")
          ]
        }]
      }
    ]
  }
}

describe('Machine', function () {
  const light = Light()
  const machine = Machine({
    definition: smDef,
    actioner: light,
    observers: {
      onEntry(context, stateName){
        console.log("onEntry ", stateName)
      },
      onExit(context, stateName){
        console.log("onExit ", stateName)
      },
      onTransitionBegin(context, statePrevious, stateNext){
        console.log("onTransitionBegin ", statePrevious, stateNext)
      },
      onTransitionEnd(context, statePrevious, stateNext){
        console.log("onTransitionEnd ", statePrevious, stateNext)
      }
    }
  });
  const map = machine.stateMap();

  it('Machine 1', () => {
    try {
      console.log("enterInitialState")
      machine.enterInitialState();

      assert.equal(machine.getStateCurrent().name(), "Off")
      console.log("sending the On event")
      machine.evOn()
      assert.equal(machine.getStateCurrent().name(), "On")

      machine.evOn()
      assert.equal(machine.getStateCurrent().name(), "On")

      /*
      machine.evOff()
      assert.equal(machine.getStateCurrent().name(), "Off")
      machine.evOff()
      assert.equal(machine.getStateCurrent().name(), "Off")
      */
    }
    catch (error) {
      console.error(error)
      assert(!error)
    }
  });
  it('walkOnEntry', () => {
    walkOnEntry(machine, map.get('On'), map.get('Off'))
  });
  it('walkOnExit', () => {
    walkOnExit(machine, map.get('On'), map.get('Off'))
  });
});
