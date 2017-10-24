const EventEmitter = require('events')

module.exports = function state (initialData) {
  var emitter = new EventEmitter()
  var state = initialData
  state.update = function update (data) {
    for (var name in data) {
      if (!state.hasOwnProperty(name))  {
        throw new TypeError("Invalid property for state: " + name)
      }
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
    const checkConstraint = (prop, val, fn) => {
      if (!fn(val)) {
        throw new TypeError("Invalid state value for " + prop + ": " + val + " .. Should pass the constraint: " + fn)
      }
    }
    for (let prop in obj) {
      emitter.on('update:' + prop, function (val) {
        checkConstraint(prop, val, obj[prop])
      })
      checkConstraint(prop, state[prop], obj[prop])
    }
    return state
  }
  state.types = function types (obj) {
    const checkType = (prop, val, types) => {
      if (!Array.isArray(types)) types = [types]
      const valid = types.reduce((bool, t) => bool || (typeof val === t), false)
      if (!valid) {
        throw new TypeError("Invalid state value for " + prop + ": " + val + " .. Should have typeof: " + types)
      }
    }
    for (let prop in obj) {
      emitter.on('update:' + prop, function (val) {
        checkType(prop, val, obj[prop])
      })
      checkType(prop, state[prop], obj[prop])
    }
    return state
  }
  return state
}
