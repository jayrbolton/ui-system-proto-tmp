const state = require('../index')
const dom = require('../dom')
const html = require('bel')

function Flight () {
  return state({
    way: 'one-way', // one-way | round-trip
    startErr: false,
    returnErr: false,
    booked: false
  })
}

const checkDateFormat = d => !(/\d\d\.\d\d\.\d\d\d\d/.test(d))

// set startErr or returnErr
const keyupDate = (flight, prop) => event => {
  const date = event.currentTarget.value
  flight.update({[prop]: checkDateFormat(date), booked: false})
}

const changeWay = flight => ev => flight.update({
  way: ev.currentTarget.value,
  booked: false
})

function view (flight) {
  const startInput = dateInput(keyupDate(flight, 'startErr'), '12.12.2020')
  const returnInput = dateInput(keyupDate(flight, 'returnErr'), '')
  const bookBtn = html`<button onclick=${ev => flight.update({booked: true})}> Book </button>`
  const successMsg = html`<p>Booked!</p>`
  const gray = '#efefef'

  flight.whenEqual('way', 'one-way', () => {
    returnInput.disabled = true
    returnInput.style.borderColor = gray
    flight.update({returnErr: false})
  })
  flight.whenEqual('way', 'round-trip', () => {
    returnInput.disabled = false
    flight.update({returnErr: checkDateFormat(returnInput.value)})
  })
  flight.whenEqual('startErr', true, () => {
    startInput.style.borderColor = 'red'
    bookBtn.disabled = true
  })
  flight.whenEqual('startErr', false, () => {
    startInput.style.borderColor = gray
    bookBtn.disabled = false
  })
  flight.whenEqual('returnErr', true, () => {
    returnInput.style.borderColor = 'red'
    bookBtn.disabled = true
  })
  flight.whenEqual('returnErr', false, () => {
    returnInput.style.borderColor = gray
    bookBtn.disabled = false
  })
  flight.on('booked', b => {
    successMsg.style.display = b ? 'block' : 'none'
  })

  return html`
    <div>
      <select onchange=${changeWay(flight)}>
        <option value='one-way'>One way</option>
        <option value='round-trip'>Round trip</option>
      </select>
      <br>
      ${startInput}
      <br>
      ${returnInput}
      <br>
      ${bookBtn}
      ${successMsg}
    </div>
  `
}

function dateInput (handler, val) {
  return html`<input type='text' onkeyup=${handler} placeholder='DD.MM.YYYY' value=${val}>`
}

document.body.appendChild(view(Flight()))
