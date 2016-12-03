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
        console.log("OBSERVER onEntry ", stateName)
      },
      onExit(context, stateName){
        console.log("OBSERVER onExit ", stateName)
      }
    }
  });
  const map = machine.stateMap();

  it('Light on', () => {
    light.doOn();
  });

  it('Light off', () => {
    light.doOff();
  });

  it.only('Machine 1', () => {
    try {
      machine.setStateCurrent("On")
      assert.equal(machine.getStateCurrent().name(), "On")
      machine.evOff()
      /*
      assert.equal(machine.getStateCurrent().name(), "Off")
      machine.evOff()
      assert.equal(machine.getStateCurrent().name(), "Off")
      machine.evOn()
      assert.equal(machine.getStateCurrent().name(), "On")
      machine.evOn()
      assert.equal(machine.getStateCurrent().name(), "On")
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
