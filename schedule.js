'use strict';

const Event = require('./event.js');
const Utils = require('./utils.js');
const ValidationError = require('./validationError.js');

module.exports = class Schedule {
  constructor({ name, events, startTime, endTime, defaultTimezone }) {

    if (defaultTimezone) {
        this.defaultTimezone = defaultTimezone;
    } else {
      throw new ValidationError("defaultTimezone on schedule is mandatory.");
    }

    this.startTime = Utils.parseDate(startTime, defaultTimezone);
    this.endTime = Utils.parseDate(endTime, defaultTimezone);
    this.name = name;
    this.events = [];
    for (let eventJson of events) {
      console.log("event timezone:", defaultTimezone);
      let event = new Event(eventJson, defaultTimezone);

      if (event.startTime.isBefore(this.startTime) || event.endTime.isAfter(this.endTime)) {
        throw new ValidationError("Event is outside schedule start/end.");
      }

      this.events.push(event);
    }
  }
}
