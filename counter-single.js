const dom = require('../dom')
const html = require('bel')
const {state, update} = require('../')

function Counter (initial) {
  return state({count: initial})
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

function view (counter) {
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

document.body.appendChild(view(Counter(0)))
