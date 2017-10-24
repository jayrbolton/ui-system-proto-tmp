
# ui system prototype

This is a UI system inspired by state automatas. This repo is a quick n dirty prototype for demo/discussion purposes.

States are simple observable data containers that use node's EventEmitter, with inspirations from FRP.

States can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM.

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

A state is simply an object containing data, and will get an event emitter attached to it. See `on` and `whenEqual` below for handling update events.

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

## state.whenEqual(prop, val, fn)

This is very similar to `on`, but only fires when `state[prop]` is strict-equal to `val`. This can make your code a bit more declarative, letting you reduce conditionals.

```js
item.whenEqual('error', true, () => {
  div.classList.add('error')
  errorMsg.classList.add('active')
})
item.whenEqual('error', false, () => {
  div.classList.remove('error')
  errorMsg.classList.remove('active')
})
```

## state.types(types)

This allows you to set a bunch of run-time type checks. `types` is an object of `{prop: typename}` where each key corresponds to the keys in your state. Each value should be a string type name (as in `typeof prop === typename`).

```js
// below, count must be a number, while id can be a number OR a string
const counter = state({count: 0}).types({count: 'number', id: ['number', 'string'}})
counter.update({count: 1}) // ok
counter.update({count: '1', id: []}) // throws TypeError
counter.update({count: 2, id: 'thing'}) // ok
```

You will likely only want to make run-time type checks like this while you are developing, and not in production. You can put the `.types` call inside a conditional which checks whether you are in the dev or production environment, or you can just use it in your test suite.

## state.constraints(tests)

This is similar to `types`, but is more general: every key in `tests` corresponds to a key in your state. Every value in `tests` is a function that tests the value in state when it is updated. If the function returns false, a TypeError gets thrown.

```js
const counter = state({count: 0}).constraints({count: n => n > -1})
counter.update({count: 1}) // ok
counter.update({count: -1}) // throws TypeError
```

As with `.types`, you will probably only want this in your dev environment or your test suite.

# dom

You can create views by generating plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

For most needs, like element attributes, properties, style, classes, text content, you can simply use the `on` function to make changes to the html elements.

The `dom` module also provides a `map` function that allows you to create dynamic child elements from a state that has an array of objects.

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

## dom.map(viewFn, state, prop)

Create a dynamic set of child elements. `state[prop]` should be an array of objects, and each one of those objects must have an `id` property.

This allows you to very efficiently append, remove, and reorder elements on the page without any extra re-rendering. All transient state, like checkboxes and input values, get preserved, even on reordering. This is all based on the `id` property in each object in your array.

## dom.route(state, routes)

todo
