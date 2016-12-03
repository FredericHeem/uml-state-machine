import { assert } from 'chai';
import { Machine } from '../src/index';
import {walkOnEntry, walkOnExit} from "../src/State";

function Light() {
  return {
    doOn() {
      console.log("doOff")
    },
    doOff() {
      console.log("doOff")
    }
  }
}

const smDef = {
  name: "Basic machine 1",
  events: [
    {
      id: "evOn"
    },
    {
      id: "evOff"
    }
  ],

  state: {
    name: "Light",
    states: [
      {
        name: "Off",
        onEntry: light => light.doOff(),
        transitions: [{
          event: "evOn",
          nextState: "On"
        }]
      },
      {
        name: "On",
        onEntry: light => light.doOn(),
        transitions: [{
          event: "evOff",
          nextState: "Off"
        }]
      }
    ]
  }
}

describe('Machine', function () {
  const light = Light()
  const machine = Machine(smDef, light);
  const map = machine.stateMap();
  it('Light on', () => {
    light.doOn();
  });

  it('Light off', () => {
    light.doOff();
  });

  it('Machine 1', () => {
    try {

      machine.evOn()
      machine.evOn()
      machine.evOff()
      machine.evOff()
    }
    catch (error) {
      console.error(error)
      //console.error(JSON.stringify(error))
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
