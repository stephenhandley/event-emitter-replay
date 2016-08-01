var Assert = require('assert');

var Imissher = require('./index');

var RANDYQUAID = 'randyquaid';

function emitThreeEvents (once) {
  var imissher = new Imissher();
  var events = [];
  imissher.emit(RANDYQUAID, 1);
  imissher.emit(RANDYQUAID, 2);
  imissher[once ? 'once' : 'on'](RANDYQUAID, function (num) {
    events.push(num);
  });
  imissher.emit(RANDYQUAID, 3);
  return events;
}

module.exports = {
  '.on should provide replayable, repeated event triggers': function (done) {
    var events = emitThreeEvents(false);
    Assert.deepEqual(events, [1, 2, 3], 'Should have 3 events');
    done();
  },

  '.once should provide one-time event triggers': function (done) {
    var events = emitThreeEvents(true);
    Assert.deepEqual(events, [1], 'Should have only 1 event');
    done();
  },

  '.removeListener should remove event bindings': function (done) {
    var eventsOne = [];
    var eventsToo = [];

    var pushNum = function (num) {
      eventsOne.push(num);
    }

    var pushNumToo = function (num) {
      eventsToo.push(num);
    }

    var imissher = new Imissher();

    imissher.emit(RANDYQUAID, 1);

    imissher.on(RANDYQUAID, pushNum);
    imissher.on(RANDYQUAID, pushNumToo);

    imissher.emit(RANDYQUAID, 2);
    imissher.removeListener(RANDYQUAID, pushNum);
    imissher.emit(RANDYQUAID, 3);

    Assert.deepEqual(eventsOne, [1, 2], 'eventsOne should have only two events');
    Assert.deepEqual(eventsToo, [1, 2, 3], 'eventsToo should have all three events');

    done();
  }
};
