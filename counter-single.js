const dom = require('./dom')
const state = require('./index')
const html = require('bel')

function Counter (initial) {
  return state({count: initial})
}

var counterActions = {
  increment: function (c) {
    c.update({count: c.count + 1})
  }, 
  decrement: function (c) {
    if (c.count > 0) {
      c.update({count: c.count - 1})
    }
  },
  reset: function (c) {
    c.update({count: 0})
  }
}

function view (counter) {
  const action = name => ev => counterActions[name](counter)
  const btn = (name, text) => html`<button onclick=${action(name)}> ${text} </button>`

  const countSpan = document.createElement('span')
  const countMsg = html`<p> Total beans: ${countSpan} </p>`
  counter.on('count', c => countSpan.textContent = c)

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
