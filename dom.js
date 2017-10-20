
var exp = module.exports = {}

exp.text = function text (state, prop) {
  var txt = document.createTextNode(String(state[prop]))
  state.on('update:' + prop, function () {
    txt.textContent = String(state[prop])
  })
  return txt
}

exp.children = function children (state, prop, view) {
  var inserted = {}
  var container = document.createElement('div')
  update()
  state.on('update:' + prop, function () {
    update()
  })

  function update () {
    var stateData = state[prop]
    for (var i = 0; i < stateData.length; ++i) {
      var elem = stateData[i]
      if (!elem.hasOwnProperty('id')) throw new TypeError ('Each object in the array must have an "id" property')
      var existing = inserted[elem.id]
      if (existing) {
        if (container.children[i] !== existing) {
          container.insertBefore(existing, container.children[i])
        }
      } else {
        var newNode = view(elem, i)
        newNode.dataset['uzu_child_id'] = elem.id
        inserted[elem.id] = newNode
        if (container.children[i]) {
          container.insertBefore(newNode, children[i])
        } else {
          container.appendChild(newNode)
        }
      }
    }
    for (var i = stateData.length; i < container.children.length; ++i) {
      var id = container.children[i].dataset['uzu_child_id']
      delete inserted[id]
      container.removeChild(container.children[i])
    }
  }
  return container
}
