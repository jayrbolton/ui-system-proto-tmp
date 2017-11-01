const html = require('bel')
const state = require('../index')
const dom = require('../dom')

const BittrexData = (initial) => state({ bitMarkets: initial })

const apiCall = () =>
  fetch("https://bittrex.com/api/v1.1/public/getmarketsummaries", {})
    .then(res => res.json())
    .then(obj => obj.result)
    .then(data => data)

const responseHeaders = ["Market Name", "Volume", "Bid", "Open Buy Orders", "Created"]
const concatWord = (word) => word.replace(/ /g, '')
const apiAttrs = responseHeaders.map(concatWord)

const headerView = (value) => html`<th>${value}</th>`
const rowView = (row, bd) =>
  html`<tr>${apiAttrs.map(key =>
    html`<td>${row[key]}</td>`
  )}</tr>`

const view = (bd) => {
  apiCall().then(data =>
    data.map((market, index) =>
      Object.assign({id: `mkt-${index}`}, market)
    )
  ).then(cleanData => bd.update({bitMarkets: cleanData}))

  const rows = dom.childSync(
    (row) => rowView(row, bd),
    document.createElement('tbody'),
    bd,
    'bitMarkets',
  )

  return html`
    <table>
      <thead>${responseHeaders.map(headerView)}</thead>
      ${rows}
    </table>
  `
}

document.body.appendChild(view(BittrexData([])))
