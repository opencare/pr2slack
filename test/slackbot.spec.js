'use strict';

describe('slackbot', function() {
  var url = 'http://' + process.env.USERNAME + ':' + process.env.PASSWORD + '@localhost:5000/';

  describe('pull_request', function() {
    it('should not do anything if the PR is not being opened/reopened/closed', function(done) {
      request.post(url, function(error, response, body) {
        console.log(body);
        assert.equal(response.statusCode, 200);
        done();
      });
      // done();
    });

    it('should send a message on opening a pull request', function(done) {
      done();
    });

    it('should send a message on reopening a pull request', function(done) {
      done();
    });

    it('should not do anything when closing a PR on a non-production branch', function(done) {
      done();
    });

    it('should send a release message on closing a production branch', function(done) {
      done();
    });
  });

  describe('issue_comment', function() {

    it('should not do anything if the payload action is not created', function(done) {
      done();
    });
    it('should send a shipit to the channel if an emoji was sent', function(done) {
      done();
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      done();
    });

    it('should send a release message on closing a production branch', function(done) {
      done();
    });
  });

  describe('commit_comment', function() {

    it('should not do anything if the payload action is not created', function(done) {
      done();
    });

    it('should send a shipit to the channel if an emoji was sent', function(done) {
      done();
    });

    it('should send a message to the issue owner if a comment was made', function(done) {
      done();
    });
  });
});
