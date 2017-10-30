const state = require('../index')
const html = require('bel')

function BittrexData (initial) {
  return state({ data: initial })
}

function apiCall () {
  return fetch("https://bittrex.com/api/v1.1/public/getmarketsummaries", {})
    .then(res => res.json())
    .then(obj => obj.result)
    .then(data => data)
}

const responseHeaders = ["Market Name", "Volume", "Bid", "Open Buy Orders", "Created"]
const concatWord = (word) => word.split(" ").reduce((a,b) => a.concat(b))

const renderHeader = (value) => html`<th>${value}</th>`
const renderRow = (data, key) => html`<tr>${data[key]}</tr>`

function view (bd) {
  apiCall().then( data => bd.update({ data }) )

  bd.on('data', (b) => {
    console.log(b[0])
  })

  return html`
    <table>
      <tbody>
        <thead>${responseHeaders.map(renderHeader)}</thead>
        <div>${
          responseHeaders
            .map(concatWord)
            .map(h => renderRow(bd.data, h))
        }</div>
      </tbody>
    </table>
  `
}

document.body.appendChild(view(BittrexData([])))
