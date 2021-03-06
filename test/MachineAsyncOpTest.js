import { assert } from "chai";
import { Machine } from "../src/index";

function Operation() {
  return {
    request() {
      //console.log("doOff")
    },
    cancel() {
      //console.log("doOff")
    },
    log(msg) {
      console.log(`Operation log: ${msg}`);
    },
  };
}

const smDef = {
  name: "AsyncOp",
  events: ["evRequest", "evOk", "evError", "evReset"],
  state: {
    transitions: [
      {
        event: "evReset",
        nextState: "Idle",
        onEntry: (op) => op.cancel(),
      },
    ],
    states: {
      Idle: {
        transitions: [
          {
            event: "evRequest",
            nextState: "Loading",
            condition: (context, { message }) => message === "pippo",
          },
        ],
      },
      Error: {
        final: true,
      },
      Loading: {
        onEntry: (op) => op.request(),
        transitions: [
          {
            event: "evOk",
            nextState: "Loaded",
            actions: [(op) => op.log("Loaded")],
          },
          {
            event: "evError",
            nextState: "Error",
          },
        ],
      },
      Loaded: {},
    },
  },
};

describe("Machine Ops", function () {
  const operation = Operation();
  const machine = Machine({
    definition: smDef,
    actioner: operation,
    observers: {
      onEntry(context, stateName) {
        console.log("onEntry ", stateName);
      },
      onExit(context, stateName) {
        console.log("onExit ", stateName);
      },
      onTransitionBegin(context, statePrevious, stateNext) {
        console.log("onTransitionBegin ", statePrevious, stateNext);
      },
      onTransitionEnd(context, statePrevious, stateNext) {
        console.log("onTransitionEnd ", statePrevious, stateNext);
      },
    },
  });

  it("Machine Ops", () => {
    try {
      console.log("enterInitialState");
      machine.enterInitialState();

      assert.equal(machine.getStateCurrent().name(), "Idle");
      console.log("sending the request event");
      machine.evRequest({ message: "pippo" });
      assert.equal(machine.getStateCurrent().name(), "Loading");

      machine.evOk();
      assert.equal(machine.getStateCurrent().name(), "Loaded");

      machine.evReset();
      assert.equal(machine.getStateCurrent().name(), "Idle");
      /*
      machine.evOff()
      assert.equal(machine.getStateCurrent().name(), "Off")
      machine.evOff()
      assert.equal(machine.getStateCurrent().name(), "Off")
      */
    } catch (error) {
      console.error(error);
      assert(!error);
    }
  });
});
