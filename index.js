'use strict';
const Botkit = require('botkit');
const Schedule = require('./schedule.js');
const Event = require('./event.js');
const moment = require('moment-timezone');
const scheduleJson = require('./schedule.json');
const conf = require('./conf.json');
const controller = Botkit.slackbot();
const appStartedAt = moment();
const express = require('express');
const app = express();

console.log('App started with conf:', JSON.stringify(conf, null, 2));


//--------------
app.listen(process.env.PORT || 3000);
app.use('/', express.static(__dirname + '/public'));
//--------------

let hasBeenSlacked = new Set();
let schedule = new Schedule(scheduleJson);

const bot = controller.spawn({
  incoming_webhook: {
    url: conf.incoming_webhook_url
  }
});

function buildAttachments(events) {
  return events.map(function(event) {
    let ret = {};
    if (event.title) {
      ret.title = event.title;
    }
    ret.text = event.description;
    ret.author_name = event.speaker;
    ret.color = '#36a64f';

    ret.fields = [{
      title : 'Börjar',
      value: event.formattedStartTime,
      short: true
    }];
    if (event.endTime) {
      ret.fields.push({
        title: 'Slutar',
        value: event.formattedEndTime,
        short: true
      });
    }
    if (event.room) {
      ret.fields.push({
        title: 'Plats',
        value: event.room,
        short: true
      });
    }

    ret.mrkdwn_in = ['text'];

    return ret;
  });
}

function toNofity(events) {
  let now = moment();
  return events.filter(function(event) {
    return !hasBeenSlacked.has(event.id)
      && event.shouldNotify(now.clone(), appStartedAt.clone());
  });
}

function sendToSlack(events) {
  events = events.sort(Event.compare);
  let startTime = moment();
  for (let event of events) {
    let attachment = buildAttachments([event]);

    let text = '';
    if (!event.startTime.isSame(startTime)) {
      startTime = event.startTime;
      text = 'Event(s) starting in '  + event.remainderOffset + " minutes:";
    }

    bot.sendWebhook({
      text: text,
      attachments: attachment
    }, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        hasBeenSlacked.add(event.id);
        console.log('Sending event', res, event.id, event.title);
      }
    });
  }
}

setInterval(function() {
  let events = toNofity(schedule.events);
  if (events.length > 0) {
    sendToSlack(events);
  }
}, (conf.poll_interval || 20) * 1000);
