var exp = module.exports = {}

exp.childSync = function childSync (view, containerName, state, prop) {
  var inserted = {}
  var container = document.createElement(containerName)
  state.on(prop, function () { update() })

  function update () {
    var stateData = state[prop]
    for (var i = 0; i < stateData.length; ++i) {
      var elem = stateData[i]
      if (!elem.hasOwnProperty('id')) {
        throw new TypeError('Each object in the array must have an "id" property')
      }
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

//
// the purpose of a router function would be to conserve memory
// we may want to swap out gigantic dom trees based on state
// we dont want all the inactive trees in memory
//
// const router = dom.route({
//   '/login': loginView,
//   '/dashboard': dashboardView
// })
// // returns a state with a 'page' property and a 'dom' property
//
// router.dom // -> null
// router.update({page: '/login'})
// router.dom -> loginView dom tree
// router.update({page: '/dashboard'})
// router.dom -> dashboard dom tree
//
// XXX not sure if this function is really useful or necessary
//  what's worse: holding dom nodes in memory and never recomputing, or recomputing each page's dom on every page change?
//
exp.route = function route (routes) {
  const router = state({page: null, dom: null})
  router.on('page', p => {
    if (p) {
      if (!routes.hasOwnProperty(p)) throw new TypeError('Invalid page :' + p)
      router.update({dom: routes[p](), page: p})
    }
  })
}
