express = require 'express'
logfmt = require 'logfmt'
request = require 'request'

missing = []

for key in ['USERNAME', 'PASSWORD', 'SLACK_WEBHOOK_URI', 'SLACK_RELEASE_WEBHOOK_URI']
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
  ghEvent = req.headers['x-github-event']
  uri = process.env.SLACK_WEBHOOK_URI

  # PR created
  if ghEvent = 'pull_request' && payload.action in ['opened', 'reopened'] && payload.pull_request?.base?.ref != 'production'
    text = ":rocket: #{payload.pull_request.user.login} #{payload.action} <#{payload.pull_request.html_url}|#{escape payload.pull_request.title}> (<#{payload.pull_request.base.repo.html_url}|#{escape payload.pull_request.base.repo.name}>). Please take a look."

  # Release merged
  if ghEvent = 'pull_request' && payload.action = 'closed' && payload.pull_request?.merged && payload.pull_request?.base?.ref == 'production'
    uri = process.env.SLACK_RELEASE_WEBHOOK_URI
    text = ":robot_face: *#{payload.pull_request.user.login} released <#{payload.pull_request.html_url}|#{escape payload.pull_request.title}>*\n#{escape payload.pull_request.body}"

  # Shipit given
  if ghEvent = 'issue_comment' && payload.comment && /^(:[A-Za-z1-9_+-]+:\s*)+$/.test payload.comment.body
    text = "#{payload.comment.user.login} gave <#{payload.issue.html_url}|#{payload.issue.title}> (<#{payload.repository.html_url}|#{payload.repository.name}>) a #{payload.comment.body}"

  return res.json 200 unless text?

  options =
    method: 'POST'
    uri: uri
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
