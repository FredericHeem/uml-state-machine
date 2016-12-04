import { assert } from 'chai';
import { Machine } from '../src/index';

const smDef = {
  name: "Hierarchical",
  events: ["evOn", "evOff"],
  state: {
    transitions: [{event:"evOn", nextState:"S2_3"}],
    states: {
      "S1": {
        states:{
          "S1_1":{},
          "S1_2":{
            states:{
              "S1_2_1":{},
              "S1_2_2":{}
            }
          }
        }
      },
      "S2":{
        states:{
          "S2_1":{},
          "S2_2":{},
          "S2_3":{}
        }
      }
    }
  }
}

describe('Hierarchical', function () {
  const machine = Machine({
    definition: smDef,
    observers: {
      onEntry(context, stateName) {
        console.log("onEntry ", stateName)
      },
      onExit(context, stateName) {
        console.log("onExit ", stateName)
      },
      onTransitionBegin(context, statePrevious, stateNext) {
        console.log("onTransitionBegin ", statePrevious, stateNext)
      },
      onTransitionEnd(context, statePrevious, stateNext) {
        console.log("onTransitionEnd ", statePrevious, stateNext)
      }
    }
  });

  it('Hierarchical', () => {
    try {
      machine.enterInitialState();
      assert.equal(machine.getStateCurrent().name(), "S1_1")
      machine.evOn()
      assert.equal(machine.getStateCurrent().name(), "S2_3")
    }
    catch (error) {
      console.error(error)
      assert(!error)
    }
  });
});
