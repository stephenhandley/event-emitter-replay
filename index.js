function Emitter () {
  this.events = [];
  this.bindings = [];
}

Emitter.prototype.on = function (event_name, callback) {
  this.bindings.push({
    event_name: event_name,
    callback: callback,
    once: false
  });
  this._replay(event_name, callback);
};

EventEmitterReplay.prototype.once = function (event_name, callback) {
  this.bindings.push({
    event_name: event_name,
    callback: callback,
    once: true
  });
  this._replay(event_name, callback);
};

EventEmitterReplay.prototype.emit = function () {
  var event_name = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  var event = {
    name: event_name,
    args: args
  };
  this.events.push(event);
  this._emit(event);
};

EventEmitterReplay.prototype._emit = function (event, onlyThisBinding) {
  this.bindings.forEach(function (binding) {
    var doit;
    if (onlyThisBinding) {
      doit = this._bindingsEqual(binding, onlyThisBinding);
    } else {
      doit = (binding.event_name === event.name);
    }

    if (doit) {
      var callback = binding.callback;
      callback.apply(null, event.args);
      if (binding.once) {
        this.removeListener(binding.event_name, callback);
      }
    }
  }.bind(this));;
};

EventEmitterReplay.prototype._replay = function (event_name, callback) {
  this.events.forEach(function (event) {
    var binding = {
      event_name: event_name,
      callback: callback
    }
    this._emit(event, binding);
  }.bind(this));
};

EventEmitterReplay.prototype.removeListener = function (event_name, callback) {
  this.bindings.forEach(function (binding, i) {
    var matches = this._bindingsEqual(binding, {
      event_name: event_name,
      callback: callback
    });

    if (matches) {
      this.bindings.splice(i, 1);
    }
  }.bind(this));
};

EventEmitterReplay.prototype._bindingsEqual = function (binding1, binding2) {
  var event_match = (binding1.event_name ===  binding2.event_name);
  var callback_match = (binding1.callback === binding2.callback);
  return event_match && callback_match;
}

module.exports = EventEmitterReplay;
