
# ui system prototype

This is an ultra minimalistic UI system inspired by state automatas and streams. This repo is a quick n dirty prototype for demo/discussion purposes. States are simple observable data containers that use node's EventEmitter. They can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM.

Examples: 
* [todo MVC](/examples/todo.js) (no styling)
* 7guis ([info](https://github.com/eugenkiss/7guis/wiki))
   * [counter](/examples/7guis/counter.js)
   * [temperature converter](/examples/7guis/temperature-converter.js)
   * [flight booker](/examples/7guis/flight-booker.js)
   * [timer](/examples/7guis/timer.js)
   * [crud](/examples/7guis/crud.js)
   * [cells](/examples/7guis/cells.js)
* [multiple dynamic counters](/examples/counter-many.js)

## state(defaults)

This is exported in `./index.js`.

```js
const state = require('./index')
function BeanCount (initial) {
  return state({ count: initial })
}
```

A state is simply an object containing data, and will get an event emitter attached to it. See `on` for handling update events.

State properties are strict, kind of like structs in other languages. If you try to update a property in the state that wasnt initialized when the state is first created, then a TypeError will get thrown. This is a bug prevention / code readability measure.

```js
const counter = state({count: 1})
counter.update({id: 0}) // throws TypeError
const counterWithID = state({count: 1, id: 0})
counter.update({id: 99}) // ok
```

## state.update(data)

In order to update a state, use the `update` method.

`state` is an instance of some state object. 

`data` is an object that will get merged into the state. For every key/value, an event will get emitted (see `on` below).

```js
bc.update({count: 1, hidden: false})
bc.update({count: 2})
bc.update({count: 3, hidden: true})
// etc
```

## state.on(prop, fn)

Call the function `fn` each time the property `prop` gets updated in the state. This will also call `fn` immediately for the current value of the prop.

```js
bc.on('count', (c) => console.log('count updated to', c))
```

# dom

You can create views by generating plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

For most needs, like element attributes, properties, style, classes, text content, you can simply use the `on` function to make changes to the html elements.

The `dom` module also provides a `childSync` function that allows you to create dynamic child elements from a state that has an array of objects.

Unlike with virtual dom libraries, the view functions only get called once on pageload. Instead of diffing and patching entire trees, we listen to changes on state properties and make changes to dom elements directly using the browser's built-in HTMLElement and DOM Node API

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

## dom.childSync(viewFn, container, state, prop)

Create a dynamic set of child elements. `state[prop]` should be an array of objects, and each one of those objects must have an `id` property.

`container` should be an empty html or svg node that you want to append all the children into.

`viewFn` is a function that should take elements from `state[prop]` and return an html node.

This function allows you to very efficiently append, remove, and reorder elements on the page without any extra re-rendering. All transient state, like checkboxes and input values, get preserved, even on reordering. This is all based on the `id` property in each object in your array.

`childSync` will also keep track of exactly what event listeners you create for every child view, for any state at all. If the child node gets removed, all event listeners that were created inside the view (with calls to `state.on`) will also get removed.


# Undo and redo

[See here for an undo-redo helper module](/undo-redo)

# Design patterns

todo
