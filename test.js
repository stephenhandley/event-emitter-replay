var Assert = require('assert');

var EventEmitterReplay = require('./index');

var RANDYQUAID = 'randyquaid';

function emitThreeEvents (once) {
  var emitter = new EventEmitterReplay();
  var events = [];
  emitter.emit(RANDYQUAID, 1);
  emitter.emit(RANDYQUAID, 2);
  emitter[once ? 'once' : 'on'](RANDYQUAID, function (num) {
    events.push(num);
  });
  emitter.emit(RANDYQUAID, 3);
  return events;
}

module.exports = {
  '.on should provide replayable, repeated event triggers': function () {
    var events = emitThreeEvents(false);
    Assert.deepEqual(events, [1, 2, 3], 'Should have 3 events');
  },

  '.once should provide one-time event triggers': function () {
    var events = emitThreeEvents(true);
    Assert.deepEqual(events, [1], 'Should have only 1 event');
  },

  '.removeListener should remove event bindings': function () {
    var eventsOne = [];
    var eventsToo = [];

    var pushNum = function (num) {
      eventsOne.push(num);
    }

    var pushNumToo = function (num) {
      eventsToo.push(num);
    }

    var emitter = new EventEmitterReplay();

    emitter.emit(RANDYQUAID, 1);

    emitter.on(RANDYQUAID, pushNum);
    emitter.on(RANDYQUAID, pushNumToo);

    emitter.emit(RANDYQUAID, 2);
    emitter.removeListener(RANDYQUAID, pushNum);
    emitter.emit(RANDYQUAID, 3);

    Assert.deepEqual(eventsOne, [1, 2], 'eventsOne should have only two events');
    Assert.deepEqual(eventsToo, [1, 2, 3], 'eventsToo should have all three events');
  },

  '.removeListener should work with .once': function () {
    var eventsOne = [];
    var eventsToo = [];

    var pushNum = function (num) {
      eventsOne.push(num);
    }

    var pushNumToo = function (num) {
      eventsToo.push(num);
    }

    var emitter = new EventEmitterReplay();

    emitter.once(RANDYQUAID, pushNum);
    emitter.once(RANDYQUAID, pushNumToo);

    emitter.removeListener(RANDYQUAID, pushNum);
    emitter.emit(RANDYQUAID, 1);
    emitter.emit(RANDYQUAID, 2);
    emitter.emit(RANDYQUAID, 3);

    Assert.deepEqual(eventsOne, [], 'eventsOne should be empty');
    Assert.deepEqual(eventsToo, [1], 'eventsToo should have one event');
  },

  'repeat replays events to all listeners when new listener added': function () {
    var eventsOne = [];
    var eventsToo = [];

    var pushNum = function (num) {
      eventsOne.push(num);
    }

    var pushNumToo = function (num) {
      eventsToo.push(num);
    }

    var emitter = new EventEmitterReplay({
      repeat: true
    });

    emitter.emit(RANDYQUAID, 1);
    emitter.emit(RANDYQUAID, 2);

    emitter.on(RANDYQUAID, pushNum);
    emitter.on(RANDYQUAID, pushNumToo);

    Assert.deepEqual(eventsOne, [1, 2, 1, 2], 'eventsOne should have two repeated events');
    Assert.deepEqual(eventsToo, [1, 2], 'eventsToo should have just two events');
  }
};
