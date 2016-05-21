'use strict';

let Event = require('./event.js');

module.exports = class Schedule {
  constructor(scheduleJson) {
    this.events = [];
    for (let eventJson of scheduleJson) {
      this.events.push(new Event(eventJson));
    }
  }
}
