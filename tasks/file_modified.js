/*
 * grunt-file-modified
 * https://github.com/csbun/grunt-file-modified
 *
 * Copyright (c) 2015 Hans Chan
 * Licensed under the MIT license.
 */

'use strict';


var fs = require('fs');
var md5 = require('MD5');
var compare = require('compare-objects');
var chalk = require('chalk');

var TASK_NAME = 'file_modified';
var DESCRIPTION = 'check if files is modified';

module.exports = function(grunt) {

  grunt.registerMultiTask(TASK_NAME, DESCRIPTION, function () {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      output: 'config/.grunt_file_modified',
      files: []
    });

    // make md5-map for current files
    var fileMD5Map = {};
    grunt.file.expand(options.files)
      .forEach(function (file) {
        var stats = fs.statSync(file);
        if (stats.isFile()) {
          fileMD5Map[file] = md5(fs.readFileSync(file));
        }
      });

    // checkout old md5-map
    var oldFileMD5Map = {};
    if (grunt.file.exists(options.output)) {
      oldFileMD5Map = grunt.file.readJSON(options.output);
    }

    // compare two map
    compare(oldFileMD5Map, fileMD5Map, function (key, value, oldValue) {
      var newDefined = value !== undefined;
      var oldDefined = oldValue !== undefined;
      if (newDefined && oldDefined) {
        if (value !== oldValue) {
          grunt.log.writeln(chalk.red('  [updated] ') + key);
        // } else {
        //   console.log('unchanged', key, value, oldValue);
        }
      } else if (newDefined) {
        grunt.log.writeln(chalk.green('  [ added ] ') + key);
        return;
      } else if (oldDefined) {
        grunt.log.writeln(chalk.cyan('  [removed] ') + key);
      }
    });

    // write fileMD5Map to output
    grunt.file.write(options.output, JSON.stringify(fileMD5Map, null, '  '));

  });

};
