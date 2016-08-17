var express = require('express');
var logfmt = require('logfmt');
var request = require('request');
var slack = require('slack-node');

var missing = [];

const slackBotUsername = 'github';
const slackBotIconURL = 'https://slack-assets2.s3-us-west-2.amazonaws.com/10562/img/services/github_48.png';

for (var key in ['USERNAME', 'PASSWORD', 'SLACK_WEBHOOK_URI', 'SLACK_RELEASE_WEBHOOK_URI']) {
  if (!key in process.env) {
    missing.push(key);
  }
}

if (missing.length) {
  throw "Missing environment variables: " + (missing.join(', '));
}

var app = express();

app.use(logfmt.requestLogger());

app.use(express.basicAuth(function(username, password) {
  return username == process.env.USERNAME && password == process.env.PASSWORD;
}));

app.use(express.bodyParser());

var unescaped = /[&<>]/;

# Can't use underscore's escape because quotes are already escaped in Slack by
# default.
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

// TODO convert this component
reUnescapedHtml = RegExp "[#{(k for k of htmlEscapes).join ''}]", 'g'
// END of todo

var escapeHtmlChar = function(match) {
  return htmlEscapes[match];
};

var escape = function(string) {
  if (string == null) {
    return '';
  }
  return String(string).replace(reUnescapedHtml, escapeHtmlChar);
};

// TODO clean this up
app.post('/', function(req, res) {
  var body, options, ref, ref1, ref2, ref3, ref4, ref5, text;
  var payload = req.body;
  var ghEvent = req.headers['x-github-event'];
  var uri = process.env.SLACK_WEBHOOK_URI;

  var pivotalToSlack = {
    "nivivon": "nivivon"
  };

  // PR created
  if (ghEvent = 'pull_request' && ((ref = payload.action) === 'opened' || ref === 'reopened') && ((ref1 = payload.pull_request) != null ? (ref2 = ref1.base) != null ? ref2.ref : void 0 : void 0) !== 'production') {
    text = ":rocket: " + payload.pull_request.user.login + " " + payload.action + " a pull request in <" + payload.pull_request.base.repo.html_url + "|" + (escape(payload.pull_request.base.repo.name)) + ">\n*<" + payload.pull_request.html_url + "|" + (escape(payload.pull_request.title)) + ">*";
  }

  // Release merged
  if (ghEvent = 'pull_request' && (payload.action = 'closed' && ((ref3 = payload.pull_request) != null ? ref3.merged : void 0) && ((ref4 = payload.pull_request) != null ? (ref5 = ref4.base) != null ? ref5.ref : void 0 : void 0) === 'production')) {
    uri = process.env.SLACK_RELEASE_WEBHOOK_URI;
    text = ":robot_face: " + payload.pull_request.user.login + " released <" + payload.pull_request.base.repo.html_url + "|" + (escape(payload.pull_request.base.repo.name)) + ">\n\n";
    text += "*<" + payload.pull_request.html_url + "|" + (escape(payload.pull_request.title)) + ">*\n\n";
    body = ("" + (escape(payload.pull_request.body))).replace(/\[#(\d+)\]/g, "<https://www.pivotaltracker.com/story/show/$1|[#$1]>");
    text += body;
  }

  // Shipit given
  if (ghEvent = 'issue_comment' && payload.comment && /^(:[A-Za-z1-9_+-]+:\s*)+$/.test(payload.comment.body)) {
    text = payload.comment.body + " from " + payload.comment.user.login + "! on a PR in <" + payload.repository.html_url + "|" + payload.repository.name + ">\n<" + payload.issue.html_url + "|" + payload.issue.title + ">";
  }

  // Feedback given
  if (ghEvent = 'issue_comment' && payload.comment && !(/^(:[A-Za-z1-9_+-]+:\s*)+$/.test(payload.comment.body))) {
    var slackUsername = pivotalToSlack[payload.comment.user.login];

    text = payload.comment.body + " from " + payload.comment.user.login + "! on a PR in <" + payload.repository.html_url + "|" + payload.repository.name + ">\n<" + payload.issue.html_url + "|" + payload.issue.title + ">";
    // !webhook;
    // TODO call API here vs webhook
    slack.api('chat.postMessage', {
      text:text,
      channel:"@" + slackUsername,
     username: slackBotUsername,
     icon_url: slackBotIconURL
    }, function(err, response){
      console.log(response);
    });

  }
  if (text == null) {
    return res.json(200);
  }
  options = {
    method: 'POST',
    uri: uri,
    json: {
      text: text,
      username: slackBotUsername,
      icon_url: slackBotIconURL
    }
  };
  return request(options, function(err, response, body) {
    if (err) {
      return res.json(500, err);
    } else {
      return res.json(response.statusCode, body);
    }
  });
});
// END of todo

port = !!process.env.PORT ? process.env.PORT : 5000;

app.listen(port, function() {
  return console.log("Listening on " + port);
});
