import { assert } from 'chai';
import {State, traverseState, buildStateMap, isAncestor} from "../src/State";

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
  const map = buildStateMap(smDef);
  const machine = {}
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
    assert(map.get('Light'))
    //console.log("LIGHT ", map.get('Light'))

    for(let state of map.values()){
        assert(state.name())
    }
  });
  it('isAncestor', () => {
    assert.isFalse(isAncestor(map.get('On'), map.get('Off')))
    assert.isFalse(isAncestor(map.get('On'), map.get('On')))
    assert.isTrue(isAncestor(map.get('Light'), map.get('Off')))
    assert.isTrue(isAncestor(map.get('Light'), map.get('On')))
  });

});
