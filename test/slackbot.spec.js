'use strict';

function sequence(callback) {
  var sequenceId = 0;
  return function() {
    sequenceId++;
    return callback() + sequenceId;
  };
}

describe('slackbot', function() {
  var url = 'http://' + process.env.USERNAME + ':' + process.env.PASSWORD + '@localhost:8080/';
  var emoji = '\uD800\uDC00';

  var nock;
  before(function() {
    nock = require('nock');
    nock.enableNetConnect('localhost');
  });

  after(function() {
    nock.enableNetConnect();
  });


  describe('pull_request', function() {
    it('should not do anything if the PR is not being opened/reopened/closed', function(done) {
      request.post(url, function(error, response) {
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 200);
        done();
      });
    });

    it('should send a message on opening a pull request', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': ':rocket: nivivon opened a pull request in <example.com|example>\n*<example.com|test pr>*',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'opened',
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon'
            },
            base: {
              ref: 'master', //'production',
              repo: {
                name: 'example',
                html_url: 'example.com'
              }
            },
            body: 'random',
            merged: true,
            title: 'test pr',
            html_url: 'example.com'
          },
        }
      };

      request.post(url, pr, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should send a message on reopening a pull request', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': ':rocket: nivivon reopened a pull request in <example.com|example>\n*<example.com|test pr>*',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'reopened',
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon'
            },
            base: {
              ref: 'master', //'production',
              repo: {
                name: 'example',
                html_url: 'example.com'
              }
            },
            body: 'random',
            merged: true,
            title: 'test pr',
            html_url: 'example.com'
          },
        }
      };

      request.post(url, pr, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should not do anything when closing a PR on a non-production branch', function(done) {
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'closed',
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon'
            },
            base: {
              ref: 'master', //'production',
              repo: {
                name: 'example',
                html_url: 'example.com'
              }
            },
            body: 'random',
            merged: true,
            title: 'test pr',
            html_url: 'example.com'
          },
        }
      };

      request.post(url, pr, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body, 200);
        done();
      });
    });

    it('should send a release message on closing a production branch', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B0S7G04HH/6Xm8mqSVSGzpV8Pt6IkexkF0', {
          'response_type': 'ephemeral',
          'text': ':robot_face: nivivon released <example.com|example>\n\n*<example.com|test pr>*\n\nrandom',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'closed',
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon'
            },
            base: {
              ref: 'production', //'production',
              repo: {
                name: 'example',
                html_url: 'example.com'
              }
            },
            body: 'random',
            merged: true,
            title: 'test pr',
            html_url: 'example.com'
          },
        }
      };

      request.post(url, pr, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });

  describe('issue_comment', function() {
    it('should not do anything if the payload action is not created', function(done) {
      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'deleted',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'random'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, ic, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body, 200);
        done();
      });
    });

    it('should send a shipit to the channel if a unicode emoji was sent', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': emoji + ' from nivivon! on a PR in <example.com|example>\n<example.com|example>',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: emoji
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, ic, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should send a shipit to the channel if a regular emoji was sent', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': ':shipit: from nivivon! on a PR in <example.com|example>\n<example.com|example>',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: ':shipit:'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, ic, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should not send a message if the issue owner is not defined in common.js', function(done) {
      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'FakeUser'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, ic, function(error, response, body) {
        assert.equal(response.statusCode, 400);
        assert.equal(body.error, ic.json.issue.user.login + ' is not defined');
        done();
      });
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      nock('https://slack.com:443')
        .get('/api/chat.postMessage?text=nivivon%20commented%20on%20your%20PR%20in%20%3Cexample.com%7Cexample%3E%3A%20this%20is%20a%20comment%0A%3Cexample.com%7Cexample%3E&channel=%40ronen&username=github&icon_url=https%3A%2F%2Fslack-assets2.s3-us-west-2.amazonaws.com%2F10562%2Fimg%2Fservices%2Fgithub_48.png&token=TEST_TOKEN')
        .reply(200, {
          'ok': true
        });

      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, ic, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });

  describe('commit_comment', function() {

    it('should not do anything if the payload action is not created', function(done) {
      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'deleted',
          number: sequence(),
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'random',
            merged: true
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          },
          title: 'test pr',
          html_url: 'example.com'
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body, 200);
        done();
      });
    });

    it('should send a shipit to the channel if a unicode emoji was sent', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': emoji + ' from nivivon! on a PR in <example.com|example>\n<example.com|example>',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: emoji
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, cc, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should send a shipit to the channel if a regular emoji was sent', function(done) {
      nock('https://hooks.slack.com:443')
        .post('/services/T024HT77N/B035LH8PN/IzKEPzLeV2rTNWway46FAwdu', {
          'response_type': 'ephemeral',
          'text': ':shipit: from nivivon! on a PR in <example.com|example>\n<example.com|example>',
          'username': 'github',
          'link_names': 0,
          'icon_emoji': ''
        }).reply(200, 'ok');

      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: ':shipit:'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, cc, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should not send a message if the issue owner is not defined in common.js', function(done) {
      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'FakeUser'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 400);
        assert.equal(body.error, cc.json.issue.user.login + ' is not defined');
        done();
      });
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      nock('https://slack.com:443')
        .get('/api/chat.postMessage?text=nivivon%20commented%20on%20your%20PR%20in%20%3Cexample.com%7Cexample%3E%3A%20this%20is%20a%20comment%0A%3Cexample.com%7Cexample%3E&channel=%40ronen&username=github&icon_url=https%3A%2F%2Fslack-assets2.s3-us-west-2.amazonaws.com%2F10562%2Fimg%2Fservices%2Fgithub_48.png&token=TEST_TOKEN')
        .reply(200, {
          'ok': true
        });

      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon'
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example',
            html_url: 'example.com'
          },
          issue: {
            user: {
              login: 'RonenA'
            },
            html_url: 'example.com',
            title: 'example'
          }
        }
      };

      request.post(url, cc, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });
});
