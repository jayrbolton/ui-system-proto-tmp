
# ui system prototype

This is a UI system inspired by state automatas. This repo is a quick n dirty prototype for demo/discussion purposes.

States are simple observable data containers that use node's EventEmitter

States can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM.

## state(defaults)

This is exported in `./index.js`

```js
function BeanCount (initial) {
  return state({ count: initial })
}
```

A state is simply an object containing data, and will get an event emitter attached to it.

It has the special method `on`, which you can use to listen for changes

```js
const bc = BeanCount(0)
bc.on('update:count', (val) => console.log('im called whenever bc.count is updated. bc is now mutated'))
bc.on('update', () => console.log('im called whenever anything in bc is updated. bc is now mutated'))
```

## update(state, updates)

In order to update a state, use the `update` function (also exported from `./index.js`)

`state` is an instance of some state object. 

`updates` is an object that will get merged into the state. For every key/value, an `update:key` event will get emitted. When all is merged, then `update` gets emitted.

```js
update(bc, {count: 1})
update(bc, {id: 0})
// etc
```

# dom

You can create views by generating plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

This module provides some extra functions to bind state data to parts of the dom, auto-updating the dom as the state changes. The dom code is exported from `./dom.js`

```
const html = require('bel')
const dom = require('../dom')
const {state, update} = require('../index')

function BeanCount (initial) {
  return state({count: initial})
}

function increment (c) {
  update(c, {count: c.count + 1})
}

function view (beanCount) {
  return html`
    <div>
      <p> Bean counter </p>
      <button onclick=${ev => increment(beanCount)}> Add a bean </button>
      Total beans: ${dom.text(beanCount, 'count')}
    </div>
  `
}
```

See a larger example with multiple dynamic counters here: [/counter-many.js](/counter-many.js).

Unlike with virtual dom libraries, the view functions only get called once on pageload.

## text(state, prop)

Create an HTML text node that is bound to the state's property. The text will get automatically updated every time the property in the state gets updated.

## map(viewFn, state, prop)

Create a dynamic set of child elements. `state[prop]` should be an array of objects, and each one of those objects must have an `id` property.

This allows you to very efficiently append, remove, and reorder elements on the page without any extra re-rendering. All transient state, like checkboxes and input values, get preserved, even on reordering. This is all based on the `id` property in each object in the array from the state.

## attr(attrName, state, prop, elem)
## prop(propName, state, prop, elem)
## style(ruleName, state, prop, elem)
## classes(state, prop, elem)
