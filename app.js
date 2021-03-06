var express = require('express');
var logfmt = require('logfmt');
var request = require('request');
var _ = require('lodash');
var Slack = require('slack-node');
var S = require('string');

var slackBotUsername = 'github';
var slackBotIconURL = 'https://slack-assets2.s3-us-west-2.amazonaws.com/10562/img/services/github_48.png';

var requiredEnvVars = ['USERNAME', 'PASSWORD', 'SLACK_WEBHOOK_URI', 'SLACK_RELEASE_WEBHOOK_URI', 'SLACK_API_TOKEN'];
if (_.intersection(_.keys(process.env), requiredEnvVars).length != requiredEnvVars.length) {
  throw 'Missing environment variables';
}

var app = express();

app.use(logfmt.requestLogger());

app.use(express.basicAuth(function(username, password) {
  return username == process.env.USERNAME && password == process.env.PASSWORD;
}));

app.use(express.bodyParser());

var slackWebhook = new Slack();
var slackAPI = new Slack(process.env.SLACK_API_TOKEN);

var githubToSlack = {
  camthesixth: 'cam',
  davidjconnolly: 'dave',
  leeopencare: 'lee',
  paulfeltoe: 'paul',
  nivivon: 'nivivon',
  RonenA: 'ronen',
  'vadim-zverugo': 'vadim'
};

var ResType = {
  Webhook: 0,
  API: 1
};

var handleResponse = function(res) {
  return function(err, response) {
    if (err) {
      return res.json(500, err);
    } else {
      return res.json(200);
    }
  };
};

app.post('/', function(req, res) {

  var payload = req.body;
  var ghEvent = req.headers['x-github-event'];
  var uri = process.env.SLACK_WEBHOOK_URI;

  var text;
  var resType;
  var username;

  // PR
  if (ghEvent == 'pull_request') {
    resType = ResType.Webhook;
    var prCreated = _.includes(['opened', 'reopened'], payload.action);
    var releaseMerged = payload.action == 'closed' && !!_.get(payload, 'pull_request.merged') && _.get(payload, 'pull_request.base.ref') == 'production';
    var prDataExists = !!_.get(payload, 'pull_request.base');
    if (prDataExists) {
      if (prCreated && payload.pull_request.base.ref != 'production') {
        text = ':rocket: ' + payload.pull_request.user.login + ' ' + payload.action + ' a pull request in <' + payload.pull_request.base.repo.html_url + '|' + (S(payload.pull_request.base.repo.name).escapeHTML().s) + '>\n*<' + payload.pull_request.html_url + '|' + (S(payload.pull_request.title).escapeHTML().s) + '>*';
      } else if (releaseMerged) {
        uri = process.env.SLACK_RELEASE_WEBHOOK_URI;
        text = ':robot_face: ' + payload.pull_request.user.login + ' released <' + payload.pull_request.base.repo.html_url + '|' + (S(payload.pull_request.base.repo.name).escapeHTML().s) + '>\n\n';
        text += '*<' + payload.pull_request.html_url + '|' + (S(payload.pull_request.title).escapeHTML().s) + '>*\n\n';
        var body = ('' + (S(payload.pull_request.body).escapeHTML().s)).replace(/\[#(\d+)\]/g, '<https://www.pivotaltracker.com/story/show/$1|[#$1]>');
        text += body;
      }
    }
  }

  // Issue comment
  if (ghEvent == 'issue_comment' && payload.action == 'created' && payload.comment) {
    var shipitUnicode = /^([\uD800-\uDBFF][\uDC00-\uDFFF]\s*)+$/.test(payload.comment.body);
    var shipitRegular = /^(:[A-Za-z1-9_+-]+:\s*)+$/.test(payload.comment.body);
    var shipitGiven = shipitUnicode || shipitRegular;
    // Shipit given
    if (shipitGiven) {
      resType = ResType.Webhook;
      text = payload.comment.body + ' from ' + payload.comment.user.login + '! on a PR in <' + payload.repository.html_url + '|' + payload.repository.name + '>\n<' + payload.issue.html_url + '|' + payload.issue.title + '>';
    } else { // Feedback given
      resType = ResType.API;

      if (payload.comment.user.login in githubToSlack) {
        username = githubToSlack[payload.issue.user.login];
        text = payload.comment.user.login + ' commented on your PR in <' + payload.repository.html_url + '|' + payload.repository.name + '>: ' + payload.comment.body + '\n<' + payload.issue.html_url + '|' + payload.issue.title + '>';
      }
    }
  }

  // Commit comment
  if (ghEvent == 'commit_comment' && payload.action == 'created' && payload.comment) {
    if (payload.comment.user.login in githubToSlack) {
        username = githubToSlack[payload.issue.user.login];
        text = payload.comment.user.login + ' commented on your PR in <' + payload.repository.html_url + '|' + payload.repository.name + '>: ' + payload.comment.body + '\n<' + payload.issue.html_url + '|' + payload.issue.title + '>';
    }
  }

  if (!text) {
    return res.json(200);
  }

  if (resType == ResType.Webhook) {
    slackWebhook.setWebhook(uri);
    slackWebhook.webhook({
      text: text,
      username: slackBotUsername,
      icon_url: slackBotIconURL
    }, handleResponse(res));
  } else if (resType == ResType.API) {
    slackAPI.api('chat.postMessage', {
      text: text,
      channel: '@' + username,
      username: slackBotUsername,
      icon_url: slackBotIconURL
    }, handleResponse(res));
  }
});

port = !!process.env.PORT ? process.env.PORT : 5000;

app.listen(port, function() {
  return console.log('Listening on ' + port);
});
