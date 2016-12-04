# State Machine

An implemenation of the state machine pattern in Javascript. 

* Hierarchical
* onEntry onExit function
* Observable

## Install

```bash
npm install state-machine --save
```

## Usage

```javascript

const stateMachineDefinition = {
  name: "LightSwitch",
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

const light = Light();

const machine = Machine({
  definition: stateMachineDefinition,
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

machine.enterInitialState();
machine.evOff();
machine.evOn();

```
