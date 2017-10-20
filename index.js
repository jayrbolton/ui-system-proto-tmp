const EventEmitter = require('events')

var exp = module.exports = {}

exp.state = function state (initialData) {
  var emitter = new EventEmitter()
  var state = initialData
  state.on = function (name, cb) {
    emitter.on(name, cb)
    return state
  }
  state.emit = function (name, val) {
    emitter.emit(name, val)
    return state
  }
  return state
}

exp.update = function update (state, data) {
  for (var name in data) {
    state[name] = data[name]
    state.emit('update:' + name, null)
  }
  state.emit('update', null)
  return state
}

