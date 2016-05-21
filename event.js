'use strict';
const moment = require('moment-timezone');
const ValidationError = require('./validationError.js');

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

        this.startTime = this.parseDate(startTime);

        if (endTime) {
            this.endTime = this.parseDate(endTime);
        }

        this.remainderOffset = remainderOffset || 5;
        this.id = this.generateId();
        this.room = room;

        if (!this.startTime.isValid()) {
            throw new ValidationError('Start time must be valid.');
        } else if (this.endTime && this.endTime.isValid() && this.startTime.isAfter(this.endTime)) {
            throw new ValidationError('Start time must occure before end time');
        }
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    get formattedStartTime() {
        return this.formatDate(this.startTime);
    }

    get formattedEndTime() {
        return this.formatDate(this.endTime);
    }

    formatDate(date) {
        return date.tz(this.timeZone).format('YYYY-MM-DD HH:mm z');
    }

    parseDate(dateStr) {
        return moment.tz(dateStr, 'YYYY-MM-DD HH:mm', this.timeZone);
    }

    shouldNotify(now, doNothingBefore) {
        if (this.startTime && this.remainderOffset && now && doNothingBefore) {
            let startInterval = this.startTime.clone().subtract(this.remainderOffset, 'minutes');
            let endInterval = this.endTime || this.startTime.clone().add(30, 'minutes');

            console.log("***********************************************");
            console.log("now", this.formatDate(now));
            console.log("start", this.formatDate(startInterval));
            console.log("end", this.formatDate(endInterval));
            console.log("***********************************************");
            return now.isBetween(startInterval, endInterval)
                && doNothingBefore.isBefore(this.startTime);
        } else {
            return false;
        }
    }
}
