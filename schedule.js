'use strict';

let Event = require('./event.js');

module.exports = class Schedule {
  constructor(scheduleJson, defaultTimezone) {
    this.defaultTimezone = defaultTimezone;
    this.events = [];
    for (let eventJson of scheduleJson) {
      this.events.push(new Event(eventJson, defaultTimezone));
    }
  }
}
