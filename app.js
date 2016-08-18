var express = require('express');
var logfmt = require('logfmt');
var request = require('request');
var _ = require('lodash');
var Slack = require('slack-node');

var slackBotUsername = 'github';
var slackBotIconURL = 'https://slack-assets2.s3-us-west-2.amazonaws.com/10562/img/services/github_48.png';

var requiredEnvVars = ['USERNAME', 'PASSWORD', 'SLACK_WEBHOOK_URI', 'SLACK_RELEASE_WEBHOOK_URI', 'SLACK_API_TOKEN'];
if (_.intersection(_.keys(process.env), requiredVars).length != requiredVars.length) {
  throw 'Missing environment variables';
}

var app = express();

app.use(logfmt.requestLogger());

app.use(express.basicAuth(function(username, password) {
  return username == process.env.USERNAME && password == process.env.PASSWORD;
}));

app.use(express.bodyParser());

var apiToken = process.env.SLACK_API_TOKEN;

var slackWebhook = new Slack();
var slackAPI = new Slack(apiToken);

var githubToSlack = {
  'camthesixth': 'cam',
  'davidjconnolly': 'dave',
  'leeopencare': 'lee',
  'paulfeltoe': 'paul',
  'nivivon': 'nivivon',
  'RonenA': 'ronen',
  'vadim-zverugo': 'vadim'
};

var unescaped = /[&<>]/;

// Can't use underscore's escape because quotes are already escaped in Slack by
// default.
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

var htmlEscapesKeys = _.keys(htmlEscapes);
var reUnescapedHtml = new RegExp(htmlEscapesKeys.join(''), 'g');

var escapeHtmlChar = function(match) {
  return htmlEscapes[match];
};

var escape = function(string) {
  if (string == null) {
    return '';
  }
  return String(string).replace(reUnescapedHtml, escapeHtmlChar);
};

var ResType = {
  Webhook: 0,
  API: 1
};

var handleResponse = function(err, response) {
  if (err) {
    return res.json(500, err);
  } else {
    return res.json(response.statusCode, body);
  }
};

app.post('/', function(req, res) {

  var payload = req.body;
  var ghEvent = req.headers['x-github-event'];
  var uri = process.env.SLACK_WEBHOOK_URI;

  var resType;
  var username;

  // PR
  if (ghEvent == 'pull_request') {
    resType = ResType.Webhook;
    var prCreated = payload.action == 'opened' || payload.action == 'reopened';
    var releaseMerged = payload.action == 'closed';
    var prDataExists = payload.pull_request && payload.pull_request.base;
    if (prDataExists) {
      if (prCreated && payload.pull_request.base.ref != 'production') {
        text = ':rocket: ' + payload.pull_request.user.login + ' ' + payload.action + ' a pull request in <' + payload.pull_request.base.repo.html_url + '|' + (escape(payload.pull_request.base.repo.name)) + '>\n*<' + payload.pull_request.html_url + '|' + (escape(payload.pull_request.title)) + '>*';
      } else if (releaseMerged && payload.action == 'closed' && payload.pull_request.merged && payload.pull_request.base.ref == 'production') {
        uri = process.env.SLACK_RELEASE_WEBHOOK_URI;
        text = ':robot_face: ' + payload.pull_request.user.login + ' released <' + payload.pull_request.base.repo.html_url + '|' + (escape(payload.pull_request.base.repo.name)) + '>\n\n';
        text += '*<' + payload.pull_request.html_url + '|' + (escape(payload.pull_request.title)) + '>*\n\n';
        body = ('' + (escape(payload.pull_request.body))).replace(/\[#(\d+)\]/g, '<https://www.pivotaltracker.com/story/show/$1|[#$1]>');
        text += body;
      }
    }
  }

  // Issue comment
  if (ghEvent == 'issue_comment' && payload.comment) {
    var shipitGiven = /^(:[A-Za-z1-9_+-]+:\s*)+$/.test(payload.comment.body);
    // Shipit given
    if (shipitGiven) {
      resType = ResType.Webhook;
      text = payload.comment.body + ' from ' + payload.comment.user.login + '! on a PR in <' + payload.repository.html_url + '|' + payload.repository.name + '>\n<' + payload.issue.html_url + '|' + payload.issue.title + '>';
    } else { // Feedback given
      resType = ResType.API;

      if (payload.comment.user.login in pivotalToSlack) {
        username = githubToSlack[payload.issue.user.login];
        text = payload.comment.user.login + ' commented on your PR in <' + payload.repository.html_url + '|' + payload.repository.name + '>: ' + payload.comment.body + '\n<' + payload.issue.html_url + '|' + payload.issue.title + '>';
      }
    }
  }

  if (resType == ResType.Webhook) {
    slackWebhook.setWebhook(uri);
    slackWebhook.webhook({
      text: text,
      username: slackBotUsername,
      icon_url: slackBotIconURL
    }, handleResponse);
  } else if (resType == ResType.API) {
    slackAPI.api('chat.postMessage', {
      text: text,
       channel: '@' + username,
      username: slackBotUsername,
      icon_url: slackBotIconURL
    }, handleResponse);
  }
});

port = !!process.env.PORT ? process.env.PORT : 5000;

app.listen(port, function() {
  return console.log('Listening on ' + port);
});
