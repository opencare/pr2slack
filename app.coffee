express = require 'express'
logfmt = require 'logfmt'
request = require 'request'

missing = []

for key in ['USERNAME', 'PASSWORD', 'SLACK_WEBHOOK_URI']
  missing.push key unless key of process.env

throw "Missing environment variables: #{missing.join ', '}" if missing.length

app = express()

app.use logfmt.requestLogger()

app.use express.basicAuth (username, password) ->
  username is process.env.USERNAME and password is process.env.PASSWORD

app.use express.bodyParser()

unescaped = /[&<>]/

# Can't use underscore's escape because quotes are already escaped in Slack by
# default.
htmlEscapes =
  '&': '&amp;'
  '<': '&lt;'
  '>': '&gt;'

reUnescapedHtml = RegExp "[#{(k for k of htmlEscapes).join ''}]", 'g'

escapeHtmlChar = (match) ->
  htmlEscapes[match]

escape = (string) ->
  return '' unless string?
  String(string).replace reUnescapedHtml, escapeHtmlChar

app.post '/', (req, res) ->
  payload = req.body
  event = req.headers['X-Github-Event']

  if event = 'pull_request'
    if payload.action in ['opened', 'reopened'] && payload.base.ref != 'production'
      # PR created
      text = ":rocket: #{payload.pull_request.user.login} #{payload.action} <#{payload.pull_request.html_url}|#{escape payload.pull_request.title}> (<#{payload.pull_request.base.repo.html_url}|#{escape payload.pull_request.base.repo.name}>). Please take a look."
    if payload.action = 'closed' && payload.pull_request.merged && payload.base.ref == 'production'
      # Release merged
      text = ":robot_face: *#{payload.pull_request.user.login} released <#{payload.pull_request.html_url}|#{escape payload.pull_request.title}>*\n#{escape payload.pull_request.body}"

  if event = 'issue_comment' && payload.comment && /^(:[A-Za-z1-9_+-]+:\s*)+$/.test payload.comment.body
    # Shipit given
    text = "#{payload.comment.user.login} gave <#{payload.issue.html_url}|#{payload.issue.title}> (<#{payload.repository.html_url}|#{payload.repository.name}>) a #{payload.comment.body}"

  return res.json 200 unless text?

  options =
    method: 'POST'
    uri: process.env.SLACK_WEBHOOK_URI
    json:
      text: text
      username: 'github'
      icon_url: 'https://slack-assets2.s3-us-west-2.amazonaws.com/10562/img/services/github_48.png'

  request options, (err, response, body) ->
    if err
      res.json 500, err
    else
      res.json response.statusCode, body

port = Number process.env.PORT or 5000

app.listen port, ->
  console.log "Listening on #{port}"
