
# ui system prototype

This is a UI system inspired by state automatas. This repo is a quick n dirty prototype for demo/discussion purposes.

States are simple observable data containers that use node's EventEmitter

States can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM.

## state(defaults)

This is exported in `./index.js`

```js
const state = require('./index')
function BeanCount (initial) {
  return state({ count: initial })
}
```

A state is simply an object containing data, and will get an event emitter attached to it.

## state.update(data)

In order to update a state, use the `update` method.

`state` is an instance of some state object. 

`data` is an object that will get merged into the state. For every key/value, an `update:key` event will get emitted. When all is merged, then `update` gets emitted.

```js
bc.update({count: 1})
bc.update({id: 0})
bc.update({count: 2, hidden: true})
// etc
```

## state.on(prop, fn)

Call the function `fn` each time the property `prop` gets updated in the state. This will also call `fn` immediately if the prop is currently present in `state`.

```js
bc.on('count', (c) => console.log('count updated to', c))
```

# dom

You can create views by generating plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

For most needs, like element attributes, properties, style, classes, text content, you can simply use the `on` function to make changes to the html elements.

The `dom` module also provides a `map` function that allows you to create dynamic child elements from a state that has an array of objects.

```
const html = require('bel')
const state = require('../index')

function BeanCount (initial) {
  return state({count: initial})
}

function increment (c) {
  c.update({count: c.count + 1})
}

function view (beanCount) {
  const countSpan = document.createElement('span')
  beanCount.on('count', c => span.textContent = c)

  return html`
    <div>
      <p> Bean counter </p>
      <button onclick=${ev => increment(beanCount)}> Add a bean </button>
      Total beans: ${countSpan}
    </div>
  `
}
```

See a larger example with multiple dynamic counters here: [/counter-many.js](/counter-many.js).

Another larger example: [todomvc](/todo.js)

Unlike with virtual dom libraries, the view functions only get called once on pageload.

## dom.map(viewFn, state, prop)

Create a dynamic set of child elements. `state[prop]` should be an array of objects, and each one of those objects must have an `id` property.

This allows you to very efficiently append, remove, and reorder elements on the page without any extra re-rendering. All transient state, like checkboxes and input values, get preserved, even on reordering. This is all based on the `id` property in each object in the array from the state.

## dom.route(state, routes)
