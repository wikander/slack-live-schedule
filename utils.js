'use strict';

const moment = require('moment-timezone');

module.exports = class Utils {
  constructor() {}

  static generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static formatDate(date, timeZone) {
    console.log(timeZone);
    return date.tz(timeZone).format('YYYY-MM-DD HH:mm z');
  }

  static parseDate(dateStr, timeZone) {
    return moment.tz(dateStr, 'YYYY-MM-DD HH:mm', timeZone);
  }
}
