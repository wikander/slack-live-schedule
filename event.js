'use strict';
const moment = require('moment-timezone');
const ValidationError = require('./validationError.js');
const Utils = require('./utils.js');

module.exports = class Event {

  constructor({
    title,
    speaker,
    description,
    startTime,
    endTime,
    remainderOffset,
    room,
    timeZone
  }, defaultTimezone) {
    this.timeZone = timeZone || defaultTimezone;
    this.title = title;
    this.speaker = speaker;

    if (description) {
      this.description = description;
    } else {
      throw new ValidationError('Description on Event is mandatory.');
    }

    this.startTime = Utils.parseDate(startTime, this.timeZone);

    if (endTime) {
      this.endTime = Utils.parseDate(endTime, this.timeZone);
    }

    this.remainderOffset = remainderOffset || 5;
    this.id = Utils.generateId();
    this.room = room;

    if (!this.startTime.isValid()) {
      throw new ValidationError('Start time must be valid.');
    } else if (this.endTime && this.endTime.isValid() && this.startTime.isAfter(this.endTime)) {
      throw new ValidationError('Start time must occure before end time');
    }
  }

  get formattedStartTime() {
    return Utils.formatDate(this.startTime, this.timeZone);
  }

  get formattedEndTime() {
    return Utils.formatDate(this.endTime, this.timeZone);
  }

  shouldNotify(now, doNothingBefore) {
    if (this.startTime && this.remainderOffset && now && doNothingBefore) {
      let startInterval = this.startTime.clone().subtract(this.remainderOffset, 'minutes');
      let endInterval = this.endTime || this.startTime.clone().add(30, 'minutes');

      console.log("***********************************************");
      console.log("now", Utils.formatDate(now, this.timeZone));
      console.log("start", Utils.formatDate(startInterval, this.timeZone));
      console.log("end", Utils.formatDate(endInterval, this.timeZone));
      console.log("***********************************************");
      return now.isBetween(startInterval, endInterval) && doNothingBefore.isBefore(this.startTime);
    } else {
      return false;
    }
  }
  static compare(e1, e2) {
    if (e1.startTime && e2.startTime && !e1.startTime.isSame(e2.startTime)) {
      return e1.startTime.isBefore(e2.startTime) ? -1 : 1;
    } else if (e1.title && e2.title) {
      if (e1.title < e2.title) {
        return -1;
      }
      if (e1.title > e2.title) {
        return 1;
      }
      return 0;
    } else {
      return 0;
    }

  }
}
