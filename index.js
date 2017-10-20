const EventEmitter = require('events')

module.exports = function state (initialData) {
  var emitter = new EventEmitter()
  var state = initialData
  state.update = function update (data) {
    for (var name in data) {
      state[name] = data[name]
      emitter.emit('update:' + name, data[name])
    }
    return state
  }
  state.on = function on (prop, fn) {
    if (state.hasOwnProperty(prop)) fn(state[prop])
    emitter.on('update:' + prop, function (val) {
      fn(val)
    })
    return state
  }
  return state
}
