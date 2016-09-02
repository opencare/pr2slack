'use strict';

module.exports = function(grunt) {
  /*
   *  Task accepts the following flags
   *  - skipjshint/nojshint: run the tests without running jshint
   *  - dbexists: don't create or delete the database (eg. in Codeship)
   *
   *  Any leftover flags will be treated as filenames for test file grepping
   */
  grunt.registerTask('test', 'Run test suite.', function() {

    // Strip off known args
    var skipjshint = this.flags.skipjshint || this.flags.nojshint;
    delete this.flags.skipjshint;
    delete this.flags.nojshint;

    setTestFiles(this.flags);

    // Run tasks in order based on args
    if (!skipjshint) {
      grunt.task.run('jsbeautifier');
      grunt.task.run('jshint');
    }

    grunt.config.set('migrate.options.env', 'test');
    grunt.config.set('migrate.options.verbose', false);

    grunt.task.run('env:test');
    grunt.task.run('mochaTest:tests');

  });

  function setTestFiles(flags) {
    // Use the args that haven't been stripped as test files
    var mochaTestFiles = ['test/bootstrap.js'];
    flags = Object.keys(flags);

    if (flags.length) {
      flags.forEach(function(path) {
        mochaTestFiles.push('test/**/' + path + '*.js');
      });
    } else {
      mochaTestFiles.push('test/tasks/*.js');
      mochaTestFiles.push('test/**/*.spec.js');
    }

    grunt.config.set('mochaTest.tests.src', mochaTestFiles);
  }
};
