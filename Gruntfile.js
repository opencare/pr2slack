'use strict';

var _ = require('lodash'); // jshint ignore:line
var gruntOc = require('grunt-opencare');

module.exports = function(grunt) {
  grunt.initConfig({});
  grunt.loadTasks('tasks');
  grunt.registerTask('prod', []);
  gruntOc.tasks.tunnel(grunt);
  gruntOc.tasks.release(grunt);

  var srcFiles = ['**/*.js', '!node_modules/**/*.js', '!test/**/*.js', '!.tmp/**/*.js'];
  var testFiles = ['test/*.js'];

  var testGlobals = [
    'describe',
    'it',
    'before',
    'after',
    'assert',
    'factories',
    'Faker',
    'request',
    'authCommon'
  ];

  var srcGlobals = [
    '_',
    'Q',
    'S',
    'moment',
    'sails',
    'constants',
    'SentryHuckleberry',
    'stripe',
    'analytics',
    'OCPermissionError',
    'OCUnprocessableEntityError',
    'OCValidationError',
    'OCUnauthorizedError',
    'OCSoftDeleteError'
  ];

  if (process.env.NODE_ENV !== 'production') {
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.config.set('nodemon', {
      dev: {
        options: {
          delayTime: 1,
          file: 'app.js',
          ignoredFiles: ['node_modules/**', '.tmp/**', 'test/**', '.git', 'logs', '**.swp', 'sessions', '*.log'],
          // nodeArgs: ['--debug'],
          env: {
            'NODE_ENV': 'development'
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.config.set('mochaTest', {
      tests: {
        options: {
          reporter: 'spec'
        }
      }
    });

    var modifiedJsFiles = gruntOc.helpers.modifiedFiles.findWithExtension('js');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.config.set('jshint', {
      options: _.assign(gruntOc.config.jshint.options, {
        reporter: require('jshint-stylish'),
        node: true
      }),
      srcFiles: {
        files: {
          src: process.env.CI ? srcFiles : grunt.file.match(srcFiles, modifiedJsFiles)
        },
        options: {
          predef: srcGlobals
        }
      },
      testFiles: {
        files: {
          src: process.env.CI ? testFiles : grunt.file.match(testFiles, modifiedJsFiles)
        },
        options: {
          predef: srcGlobals.concat(testGlobals)
        }
      }
    });

    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.config.set('jsbeautifier', {
      files: process.env.CI ? srcFiles.concat(testFiles) : grunt.file.match(srcFiles.concat(testFiles), modifiedJsFiles),
      options: gruntOc.config.jsbeautifier.options
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.config.set('env', {
      test: {
        NODE_ENV: 'test'
      }
    });

    grunt.registerTask('run', ['nodemon:dev']);
    grunt.registerTask('tunnel', ['ngrok:api:tls:1337', 'run']);
  }
};
