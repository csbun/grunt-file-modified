/*
 * grunt-file-modified
 * https://github.com/csbun/grunt-file-modified
 *
 * Copyright (c) 2015 Hans Chan
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var simpleGit = require('simple-git');
var chalk = require('chalk');

var TASK_NAME = 'file_modified';
var DESCRIPTION = 'check if files is modified via git';
var DEFAULT_OPTIONS_PATHS = ['./'];

/**
 * check if file in paths
 * @param  {string} file  [ file path ]
 * @param  {Array} paths [ array of paths ]
 * @return {boolean}
 */
function checkFileInPaths (file, paths) {
  var i = 0;
  for (; i < paths.length; i++) {
    if (!/\.\.\//.test(path.relative(paths[i], file))) {
      return true;
    }
  }
  return false;
}

/**
 * task
 */
module.exports = function(grunt) {

  grunt.registerMultiTask(TASK_NAME, DESCRIPTION, function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      paths: DEFAULT_OPTIONS_PATHS
    });

    if (typeof options.paths === 'string') {
      options.paths = [options.paths];
    } else if (!options.paths instanceof Array) {
      options.paths = DEFAULT_OPTIONS_PATHS;
    }

    simpleGit().diff(['--name-status', '--relative'], function (err, data) {
      // fail
      if (err) {
        grunt.fail.fatal(err);
        // async done
        done();
      }

      var fileLine = data.toString().split(grunt.util.linefeed);
      var i = 0;
      var regexp = /^(\w)\s(.*)$/;
      var fileModifiedCount = 0;
      for (; i < fileLine.length; i++) {
        var matches = regexp.exec(fileLine[i]);
        if (matches && matches.length === 3 && checkFileInPaths(matches[2], options.paths)) {
          fileModifiedCount++;
          if (matches[1] === 'M') {
            grunt.log.writeln(chalk.red('  [modify] ') + matches[2]);
          } else if (matches[1] === 'D') {
            grunt.log.writeln(chalk.cyan('  [delete] ') + matches[2]);
          }
        }
      }

      // break with warn
      if (fileModifiedCount) {
        grunt.fail.warn('There are ' + fileModifiedCount + ' file(s) modified or deleted!');
      }

      // async done
      done();
    });

  });

};
