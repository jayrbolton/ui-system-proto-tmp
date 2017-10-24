const state = require('../../index')
const html = require('bel')
const dom = require('../../dom')

var uid = 0
function Cell (name) {
  return state({
    name,
    input: null,
    output: null,
    deps: [],
    error: false,
    formulaFn: null
  })
}

const opFunctions = {
  '+': (x,y) => x + y,
  '-': (x,y) => x - y,
  '*': (x,y) => x * y,
  '/': (x,y) => x / y,
}

function setInput (val, cell, sheet) {
  cell.update({error: false})

  if (val === '') {
    cell.update({input: '', output: null, formulaFn: null, deps: []})
    return
  }

  const tokens = val.split(/([-+\/*])/).filter(val => val).map(val => val.trim())
  if (tokens.length !== 1 && tokens.length !== 3) {
    // tokens length must be 1 or 3 for a valid expression
    cell.update({error: true})
    return
  }

  const termRegex = /^\s*(\d+|([A-Z]\d\d?))\s*$/

  if (tokens.length === 1) {
    if (!termRegex.test(tokens[0])) {
      cell.update({error: true})
      return
    }
    const term = tokens[0]
    const output = isNaN(term) ? sheet.dict[term].output : Number(term)
    cell.update({input: val, output, formulaFn: null, deps: []})
    return
  }

  if (tokens.length === 3) {
    if (!termRegex.test(tokens[0]) || !termRegex.test(tokens[2])) {
      cell.update({error: true})
      return
    }
    const [term1, op, term2] = tokens
    const deps = []
    if (isNaN(term1)) deps.push(term1)
    if (isNaN(term2)) deps.push(term2)
    const formulaFn = (cells) => {
      const t1 = isNaN(term1) ? cells[term1].output : Number(term1)
      const t2 = isNaN(term2) ? cells[term2].output : Number(term2)
      cell.update({output: opFunctions[op](t1, t2)})
    }
    cell.update({input: val, formulaFn, deps})
    formulaFn(sheet.dict)
    return
  }
}

function applyFormula (cellObj, cell) {
  const result = cell.formulaFn(cellObj)
  cell.update({output: result})
}

const alphabet = 'abcdefghijklmnopqrstupvwxjz'.toUpperCase().split('') // lol

function Sheet () {
  // Generate all the cells
  // Store them in both an array of arrays to render to the view
  //   as well as a dictionary for quick reference by name
  let dict = {}
  let rows = []
  for (let i = 0; i < 99; ++i) {
    rows.push([])
    for (let j = 0; j < 26; ++j) {
      let name = alphabet[j] + String(i + 1)
      let cell = Cell(name)
      rows[i].push(cell)
      dict[name] = cell
    }
  }
  return state({
    rows,
    dict,
    references: {} // keys are cell names; values are arrays of cells that depend on the key -- this is for quick updating of dependencies
  })
}

function setSheetCell (val, cell, sheet) {
  setInput(val, cell)
  if (cell.formulaFn) {
    applyFormula(sheet, cell)
    cell.deps.forEach(name => {
      let cell = sheet.dict[name]
      sheet.references[name] = sheet.references[name] || []
      sheet.references[name].push(cell)
    })
    sheet.update({references: sheet.references})
  }
  sheet.references[cell.name].forEach(cell => {
    applyFormula(sheet, cell)
  })
}


function view (sheet) {
  const ths = alphabet.map((char, i) => html`<td>${char}</td>`)
  const rows = sheet.rows.map((row, idx) => {
    cols = row.map(cell => {
      return html` <td> ${cellValView(cell, sheet)} </td `
    })
    return html`<tr> <td>${idx + 1}</td> ${cols} </tr>`
  })

  return html`
    <div>
      <p> Double click a cell to edit its value or formula </p>
      <p> Valid values are any integer </p>
      <p> Valid formulas have the format "VAL [op] VAL" where "VAL" can be an integer or the name of another cell, and "[op]" can be one of "+", "-", "/", or "*"</p>
      <table>
        <style>
          td {
            white-space: nowrap;
          }
          .output {
            width: 60px;
            background: #efefef;
          }
          input {
            width: 60px;
            background: #efefef;
          }
          .output.error {
            border: 1px solid red;
          }
        </style>
        <thead>
          <tr>
            <th></th>
            ${ths}
          </tr>
        </thead>
        
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

function cellValView (cell, sheet) {
  const toggleHide = state({hidden: true})
  const changeInput = ev => {
    setInput(ev.currentTarget.value, cell, sheet)
    toggleHide.update({hidden: true})
  }
  const doubleClick = ev => {
    toggleHide.update({hidden: false}) // show the input
    input.focus()
  }
  const input = html`<input type='text' onchange=${changeInput} onblur=${changeInput}>`
  const output = html`<span class='output' ondblclick=${doubleClick}></span>`

  cell.on('output', val => output.innerHTML = val || '&nbsp;')
  cell.on('error', (b) => {
    if (b) {
      output.classList.add('error')
      output.textContent = 'error'
    } else {
      output.classList.remove('error')
    }
  })
  // when toggleHide.hidden is true, then the output is showing and the input is hidden
  // when toggleHide.hidden is false, then the input is showing and the output is hidden
  toggleHide.on('hidden', bool => {
    input.style.display = bool ? 'none' : 'block'
    output.style.display = bool ? 'block' : 'none'
  })
  return html`<span> ${input} ${output} </span>`
}

const rowView = sheet => arr => {
  return html`<tr> hi </tr>`
}

document.body.appendChild(view(Sheet()))
