import { assert } from 'chai';
import { Machine } from '../src/index';

const smDef = {
  name: "Hierarchical",
  events: ["evOn", "evOff"],
  state: {
    name: "S",
    transitions: [{event:"evOn", nextState:"S2_3"}],
    states: [
      {
        name: "S1",
        states: [
          {
            name: "S1_1"
          },
          {
            name: "S1_2",
            states: [
              {
                name: "S1_2_1"
              },
              {
                name: "S1_2_2"
              }
            ]
          }
        ]
      },
      {
        name: "S2",
        states: [
          {
            name: "S2_1"
          },
          {
            name: "S2_2"
          },
          {
            name: "S2_3"
          }
        ]
      }
    ]
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

  it.only('Hierarchical', () => {
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
