const dom = require('../dom')
const html = require('bel')
const {state, update} = require('../')

function Counter (initial, id) {
  return state({count: initial, id: id})
}

var counterActions = {
  increment: function (c) {
    update(c, {count: c.count + 1})
  }, 
  decrement: function (c) {
    if (c.count > 0) {
      update(c, {count: c.count - 1})
    }
  },
  reset: function (c) {
    update(c, {count: 0})
  }
}

var uid = 0

function CounterList (initial=[]) {
  initial = initial.map(i => Counter(i, uid++))
  return state({counters: initial})
}

var counterListActions = {
  append: function (initial, c) {
    update(c, {counters: c.counters.concat([Counter(initial, uid++)])})
  },
  remove: function (idx, c) {
    c.counters.splice(idx, 1)
    update(c, {counters: c.counters})
  }
}

function listView (counterList) {
  const appendFn = ev => counterListActions.append(0, counterList)
  const appendBtn = html`<button onclick=${appendFn}> Add bean bag </button>`
  const counterElems = dom.map(counterViewWithRemove(counterList), counterList, 'counters')

  return html`
    <div>
      <p> Bags of beans </p>
      ${appendBtn}
      ${counterElems}
    </div>
  `
}

const counterViewWithRemove = counterList => (counter, idx) => {
  const removeFn = ev => counterListActions.remove(idx, counterList)
  const removeBtn = html`<button onclick=${removeFn}> Remove bag </button>`
  return html`
    <div>
      <hr>
      <input type='checkbox'>
      ${counterView(counter)}
      ${removeBtn}
    </div>
  `
}

function counterView (counter) {
  const action = name => ev => counterActions[name](counter)
  const btn = (name, text) => html`<button onclick=${action(name)}> ${text} </button>`
  const countMsg = html`<p> Total beans: ${dom.text(counter, 'count')} </p>`

  return html`
    <div>
      <p> Bean counter </p>
      ${btn('increment', 'add bean')}
      ${btn('decrement', 'remove bean')}
      ${btn('reset', 'reset beans')}
      ${countMsg}
    </div>
  `
}

document.body.appendChild(listView(CounterList([0,1,2])))
