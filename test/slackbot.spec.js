'use strict';

function sequence(callback) {
  var sequenceId = 0;
  return function() {
    sequenceId++;
    return callback() + sequenceId;
  };
}

describe('slackbot', function() {
  var url = 'http://' + process.env.USERNAME + ':' + process.env.PASSWORD + '@localhost:5000/';
  var emoji = '\uD800\uDC00';

  describe('pull_request', function() {
    it('should not do anything if the PR is not being opened/reopened/closed', function(done) {
      request.post(url, function(error, response) {
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 200);
        done();
      });
    });

    it('should send a message on opening a pull request', function(done) {
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'opened', // modifiable
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon' // modifiable
            },
            base: {
              ref: 'master', //'production', // modifiable
              repo: {
                name: 'example', // modifiable
                html_url: 'example.com' // modifiable
              }
            },
            body: 'random', // modifiable
            merged: true, // modifiable
            title: 'test pr', // modifiable
            html_url: 'example.com' // modifiable
          },
        }
      };

      request.post(url, pr, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook"); // get working with common
        assert.ok(body);
        done();
      });
    });

    it('should send a message on reopening a pull request', function(done) {
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'reopened', // modifiable
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon' // modifiable
            },
            base: {
              ref: 'master', //'production', // modifiable
              repo: {
                name: 'example', // modifiable
                html_url: 'example.com' // modifiable
              }
            },
            body: 'random', // modifiable
            merged: true, // modifiable
            title: 'test pr', // modifiable
            html_url: 'example.com' // modifiable
          },
        }
      };

      request.post(url, pr, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook"); // get working with common
        assert.ok(body);
        done();
      });
    });

    it('should not do anything when closing a PR on a non-production branch', function(done) {
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'closed', // modifiable
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon' // modifiable
            },
            base: {
              ref: 'master', //'production', // modifiable
              repo: {
                name: 'example', // modifiable
                html_url: 'example.com' // modifiable
              }
            },
            body: 'random', // modifiable
            merged: true, // modifiable
            title: 'test pr', // modifiable
            html_url: 'example.com' // modifiable
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
      var pr = {
        headers: {
          'x-github-event': 'pull_request'
        },
        json: {
          action: 'closed', // modifiable
          number: sequence(),
          pull_request: {
            user: {
              login: 'nivivon' // modifiable
            },
            base: {
              ref: 'production', //'production', // modifiable
              repo: {
                name: 'example', // modifiable
                html_url: 'example.com' // modifiable
              }
            },
            body: 'random', // modifiable
            merged: true, // modifiable
            title: 'test pr', // modifiable
            html_url: 'example.com' // modifiable
          },
        }
      };

      request.post(url, pr, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook"); // get working with common
        assert.ok(body);
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
              login: 'nivivon' // modifiable
            },
            body: 'random'
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
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
      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: emoji
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, ic, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook");
        assert.ok(body);
        done();
      });
    });

    it('should send a shipit to the channel if a regular emoji was sent', function(done) {
      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: ':shipit:'
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, ic, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook");
        assert.ok(body);
        done();
      });
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      var ic = {
        headers: {
          'x-github-event': 'issue_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, ic, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "API");
        assert.ok(body);
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
          action: 'deleted', // modifiable
          number: sequence(),
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: 'random', // modifiable
            merged: true // modifiable
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          },
          title: 'test pr', // modifiable
          html_url: 'example.com' // modifiable
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body, 200);
        assert.ok(body);
        done();
      });
    });

    it('should send a shipit to the channel if a unicode emoji was sent', function(done) {
      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: emoji
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook");
        assert.ok(body);
        done();
      });
    });

    it('should send a shipit to the channel if a regular emoji was sent', function(done) {
      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: ':shipit:'
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "Webhook");
        assert.ok(body);
        done();
      });
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      var cc = {
        headers: {
          'x-github-event': 'commit_comment'
        },
        json: {
          action: 'created',
          comment: {
            user: {
              login: 'nivivon' // modifiable
            },
            body: 'this is a comment'
          },
          repository: {
            name: 'example', // modifiable
            html_url: 'example.com' // modifiable
          },
          issue: {
            user: {
              login: 'ronenA'
            },
            html_url: 'example.com', //m modifiable
            title: 'example' // modifiable
          }
        }
      };

      request.post(url, cc, function(error, response, body) {
        assert.equal(response.statusCode, 200);
        assert.equal(body.resType, "API");
        assert.ok(body);
        done();
      });
    });
  });
});
