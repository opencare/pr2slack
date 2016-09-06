'use strict';

module.exports.ResType = {
  Webhook: 0,
  API: 1
};

// GitHub Constants
module.exports.Github = {
  ToSlack: {
    camthesixth: 'cam',
    davidjconnolly: 'dave',
    leeopencare: 'lee',
    paulfeltoe: 'paul',
    nivivon: 'nivivon',
    RonenA: 'ronen',
    'vadim-zverugo': 'vadim'
  },
  Action: {
    Opened: 'opened',
    Created: 'created',
    Reopened: 'reopened',
    Closed: 'closed',
    Deleted: 'deleted'
  },
  Event: {
    PullRequest: 'pull_request',
    IssueComment: 'issue_comment',
    CommitComment: 'commit_comment'
  }
};
