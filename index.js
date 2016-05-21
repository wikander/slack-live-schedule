'use strict';
const Botkit = require('botkit');
const Schedule = require('./schedule.js');
const moment = require('moment');
const scheduleJson = require('./schedule.json');
const conf = require('./conf.json');
var controller = Botkit.slackbot();
const appStartedAt = moment();

console.log('App started with conf:', JSON.stringify(conf, null, 2));
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
  for (let event of events) {
    let attachment = buildAttachments([event]);
    bot.sendWebhook({
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
