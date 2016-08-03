function EventEmitterReplay (args) {
  if (!args) {
    args = {};
  }
  this.greedy = !!args.greedy;
  this.repeat = !!args.repeat;

  this.events = [];
  this.bindings = [];
}

EventEmitterReplay.prototype.on = function (event_name, callback) {
  var binding = {
    event_name: event_name,
    callback: callback,
    once: false
  };
  this.bindings.push(binding);
  this._replay(binding);
};

EventEmitterReplay.prototype.once = function (event_name, callback) {
  var binding = {
    event_name: event_name,
    callback: callback,
    once: true
  };
  this.bindings.push(binding);
  this._replay(binding);
};

EventEmitterReplay.prototype.emit = function () {
  var event_name = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  var event = {
    name: event_name,
    args: args,
    consumed: false
  };
  this.events.push(event);
  this._emit(event);
};

EventEmitterReplay.prototype._emit = function (event, onlyThisBinding) {
  var skip = false;
  var remove_binding = null;

  this.bindings.forEach(function (binding, i) {
    var doit;
    if (onlyThisBinding) {
      doit = this._bindingsEqual(binding, onlyThisBinding);
    } else {
      doit = (binding.event_name === event.name);
    }

    if (this.greedy && event.consumed) {
      doit = false;
    }

    if (doit) {
      var callback = binding.callback;
      callback.apply(null, event.args);
      event.consumed = true;

      if (binding.once) {
        remove_binding = binding;
      }
    }
  }.bind(this));;

  if (remove_binding) {
    this.removeListener(remove_binding.event_name, remove_binding.callback);
  }
};

EventEmitterReplay.prototype._replay = function (binding) {
  this.events.forEach(function (event) {
    this._emit(event, this.repeat ? null : binding);
  }.bind(this));
};

EventEmitterReplay.prototype.removeListener = function (event_name, callback) {
  var index = -1;
  this.bindings.forEach(function (binding, i) {
    var matches = this._bindingsEqual(binding, {
      event_name: event_name,
      callback: callback
    });

    if (matches) {
      index = i;
    }
  }.bind(this));

  if (index !== -1) {
    this.bindings.splice(index, 1);
  }
};

EventEmitterReplay.prototype._bindingsEqual = function (binding1, binding2) {
  var event_match = (binding1.event_name ===  binding2.event_name);
  var callback_match = (binding1.callback === binding2.callback);
  return event_match && callback_match;
}

module.exports = EventEmitterReplay;
