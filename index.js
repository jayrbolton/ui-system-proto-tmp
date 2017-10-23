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
  state.on = function on (props, fn) {
    if (!Array.isArray(props)) props = [props]
    props.forEach(function (prop) {
      fn(state[prop])
      emitter.on('update:' + prop, function (val) {
        fn(val)
      })
      return state
    })
  }
  state.whenEqual = function whenEqual (prop, toEq, fn) {
    if (toEq === state[prop]) fn()
    emitter.on('update:' + prop, function (val) {
      if (toEq === val) fn()
    })
    return state
  }
  state.constraints = function constraints (obj) {
    for (let prop in obj) {
      emitter.on('update:' + prop, function (val) {
        if (!obj[prop](val)) {
          throw new TypeError("Invalid state value for " + prop + ": " + val + " .. Should pass: " + obj[prop])
        }
      })
    }
    return state
  }
  state.types = function types (obj) {
    const checkType = (val, types) => {
    }
    for (let prop in obj) {
      emitter.on('update:' + prop, function (val) {
        if (!Array.isArray(obj[prop])) obj[prop] = [obj[prop]]
        let valid = false
        obj[prop].forEach(type => {
          if (typeof val === type) valid = true
        })
        if (!valid) {
          throw new TypeError("Invalid state value for " + prop + ": " + val + " .. Should have typeof: " + obj[prop])
        }
      })
    }
    return state
  }
  return state
}
