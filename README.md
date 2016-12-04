# UML State Machine

An implemenation of the UML state machine pattern in Javascript. 

* Hierarchical
* onEntry onExit function
* Observable

## Install

```bash
npm installuml-state-machine --save
```

## Usage

Here is the hello word of finite state machine: a light switch: 

 * 2 events. `evOn` and `evOff`
 * 2 states: `Off` and `On`
 * 2 actions: `light.doOff()` and  `light.doOn()`

```javascript

const stateMachineDefinition = {
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

## Hierarchical example


```javascript
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

const machine = Machine({
  definition: smDef
});

machine.enterInitialState();
/*
onEntry  S
onEntry  S1
onEntry  S1_1
*/
machine.evOn()
/*
onTransitionBegin  S1_1 S2_3
onExit  S1_1
onEntry  S2
onEntry  S2_3
onTransitionEnd  S1_1 S2_3
*/

```
