import _ from 'lodash';
import { assert } from 'chai';
import { Machine, State } from '../src/index';
import {traverseState, buildStateMap, isAncestor, walkOnEntry, walkOnExit} from "../src/State";

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

const stateMachineDefinition = {
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
        transition: {
          event: "evOn",
          nextState: "On"
        }
      },
      {
        name: "On",
        onEntry: light => light.doOn(),
        transition: {
          event: "evOff",
          nextState: "Off"
        }
      }
    ]
  }
}

describe('Machine', function () {
  const light = Light()
  const map = buildStateMap(stateMachineDefinition.state);
  const machine = Machine(stateMachineDefinition, light);

  it('Light on', () => {
    light.doOn();
  });

  it('Light off', () => {
    light.doOff();
  });

  it('isRoot', () => {
    light.doOff();
    const rootState = State(stateMachineDefinition.state, null);
    assert.isTrue(rootState.isRoot());
    assert.isFalse(rootState.isLeaf());
  });

  it('Machine 1', () => {
    try {
      const machine = Machine(stateMachineDefinition, light);
      machine.evOn()
      machine.evOn()
      machine.evOff()
      machine.evOff()
    }
    catch (error) {
      console.error(error)
      //console.error(JSON.stringify(error))
      //assert(!error)
    }

  });
  it('traverseState', () => {
    const callback = (state, parent) => {
      assert(state)
      assert(state.name)
      if(parent){
        assert(parent.name)
      }
    }
    traverseState(stateMachineDefinition.state, null, callback);
  });
  it('buildStateMap', () => {
    assert.equal(map.size, 3);
  });
  it('isAncestor', () => {
    assert.isFalse(isAncestor(map.get('On'), map.get('Off')))
    assert.isFalse(isAncestor(map.get('On'), map.get('On')))
    assert.isTrue(isAncestor(map.get('Light'), map.get('Off')))
    assert.isTrue(isAncestor(map.get('Light'), map.get('On')))
  });
  it.only('walkOnEntry', () => {
    walkOnEntry(machine, map.get('On'), map.get('Off'))
  });
  it('walkOnExit', () => {
    walkOnExit(machine, map.get('On'), map.get('Off'))
  });
});
