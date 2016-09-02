'use strict';

var common = require('../common');

function Factory(_modelName, _defaults) {
  var defaults = _defaults;
  var modelName = _modelName;

  this.create = function(attributes) {
    // Set attributes to empty object if not passed in
    attributes = attributes || {};
    // Assign defaults to attributes where undefined
    attributes = _.defaults(attributes, defaults);

    // Replace any attributes that are functions with result of that function
    _.functions(attributes).forEach(function(attr) {
      attributes[attr] = attributes[attr]();
    });

    attributes[modelName] = modelName;

    return attributes;
  };
}

function sequence(callback) {
  var sequenceId = 0;
  return function() {
    sequenceId++;
    return callback() + sequenceId;
  };
}

module.exports = {

  make: function(factory, attributes) {
    var fixture = {};

    before(function(done) {
      var createdObject = factory.create(attributes);
      fixture.obj = createdObject;
      done();
    });

    return fixture;
  },

  /*

  Add new test factories here. To add a new factory, use the following format:

    {factoryName}: new Factory({nameOfModelObject}, {defaultAttributes}),

  And to use a factory:

    factories.make(factories.{factoryName});

  */

  PullRequestFactory: new Factory('PullRequest', {
    headers: {
      'x-github-event': common.GithubEvent.PullRequest
    },
    json: {
      action: 'opened', // modifiable
      number: sequence(),
      pull_request: {
        user: {
          login: "nivivon" // modifiable
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
  }),

  IssueCommentFactory: new Factory('IssueComment', {
    headers: {
      'x-github-event': common.GithubEvent.IssueComment
    },
    json: {
      action: 'opened',
      comment: {
        user: {
          login: "nivivon" // modifiable
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
  }),

  CommitCommentFactory: new Factory('CommitComment', {
    headers: {
      'x-github-event': common.GithubEvent.CommitComment
    },
    json: {
      action: 'opened', // modifiable
      number: sequence(),
      comment: {
        user: {
          login: "nivivon" // modifiable
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
  })
};
