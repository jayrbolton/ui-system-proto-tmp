var debug = require('debug')('uzu:dom')
var catchListeners = require('../lib/catch-listeners')

module.exports = {}

module.exports.childSync = function childSync (view, container, state, prop) {
  state.on(prop, update)

  var inserted = {} // track already-inserted dom nodes based on object id
  function update () {
    var arr = state[prop]
    debug('updating dynamic children for dom.childSync: ' + arr)
    for (var i = 0; i < arr.length; ++i) {
      var elem = arr[i]
      if (!elem.hasOwnProperty('id')) {
        throw new TypeError('Each object in the array must have an "id" property')
      }
      var existing = inserted[elem.id]
      if (existing) {
        if (container.children[i] !== existing.dom) {
          debug('inserting existing child: ' + existing.dom)
          container.insertBefore(existing.dom, container.children[i])
        }
      } else {
        var newNode
        var listeners = catchListeners(function () {
          newNode = view(elem, i)
        })
        newNode.dataset['uzu_child_id'] = elem.id
        inserted[elem.id] = {dom: newNode, listeners: listeners}
        if (container.children[i]) {
          debug('inserting new child before existing elem: ' + newNode)
          container.insertBefore(newNode, container.children[i])
        } else {
          debug('appending new child: ' + newNode)
          container.appendChild(newNode)
        }
      }
    }
    // Remove any stragglers
    for (var j = arr.length; j < container.children.length; ++j) {
      var id = container.children[j].dataset['uzu_child_id']
      debug('removing child with id: ' + id)
      inserted[id].listeners.forEach(function (listener) {
        debug('removing listener for :' + listener.eventName)
        listener.emitter.removeListener(listener.eventName, listener.handler)
      })
      delete inserted[id]
      container.removeChild(container.children[j])
    }
  }
  return container
}

module.exports.route = function route (state, prop, container, routes) {
  if (typeof container === 'string') container = document.createElement(container)
  debug('calling dom.route')
  var listeners = []
  var prevPage = null
  state.on(prop, function (p) {
    if (p === prevPage) return
    prevPage = p
    listeners.forEach(function (listener) {
      debug('removing listener for: ' + listener.eventName)
      listener.emitter.removeListener(listener.eventName, listener.handler)
    })
    var child
    listeners = catchListeners(function () {
      child = routes[p]()
    })
    debug('appending new child for dom.route: ' + child)
    if (container.firstChild) container.removeChild(container.firstChild)
    container.appendChild(child)
  })
  return container
}
