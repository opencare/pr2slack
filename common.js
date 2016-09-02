'use strict';

module.exports.GithubToSlack = {
  camthesixth: 'cam',
  davidjconnolly: 'dave',
  leeopencare: 'lee',
  paulfeltoe: 'paul',
  nivivon: 'nivivon',
  RonenA: 'ronen',
  'vadim-zverugo': 'vadim'
};

module.exports.ResType = {
  Webhook: 0,
  API: 1
};

module.exports.Action = {
  Opened: 'opened',
  Created: 'created',
  Reopened: 'reopened',
  Closed: 'closed',
  Deleted: 'deleted'
};

module.exports.GithubEvent = {
  PullRequest: 'pull_request',
  IssueComment: 'issue_comment',
  CommitComment: 'commit_comment'
};
