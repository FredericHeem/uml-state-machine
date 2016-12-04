import { assert } from 'chai';
import {State, traverseState, buildStateMap, isAncestor} from "../src/State";

const smDef = {
  name: "LightSwitch",
  events: ["evOn", "evOff"],
  state: {
    states: {
      "Off": {
        onEntry: light => light.doOff(),
        transitions: [{
          event: "evOn",
          nextState: "On",
          actions:[
            light => light.log("starting on")
          ]
        }]
      },
      "On": {
        onEntry: light => light.doOn(),
        transitions: [{
          event: "evOff",
          nextState: "Off",
          actions:[
            light => light.log("starting off")
          ]
        }]
      }
    }
  }
}

describe('Machine', function () {
  const map = buildStateMap(smDef);
  it('isRoot', function() {
    const rootState = State(smDef, smDef.state, null);
    assert.isTrue(rootState.isRoot());
    assert.isFalse(rootState.isLeaf());
  });

  it('traverseState', () => {
    const callback = (state, parent) => {
      assert(state)
      assert(state.name)
      if(parent){
        assert(parent.name)
      }
    }
    traverseState(smDef.state, null, callback);
  });
  it('buildStateMap', () => {
    assert.equal(map.size, 3);
    assert(map.get('On'))
    assert(map.get('Root'))

    for(let state of map.values()){
        assert(state.name())
    }
  });
  it('isAncestor', () => {
    assert.isTrue(isAncestor(map.get('Root'), map.get('Root')))
    assert.isTrue(isAncestor(map.get('On'), map.get('On')))
    assert.isFalse(isAncestor(map.get('On'), map.get('Off')))
    assert.isTrue(isAncestor(map.get('Root'), map.get('Off')))
    assert.isTrue(isAncestor(map.get('Root'), map.get('On')))
  });

});
