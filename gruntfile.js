module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    simplemocha: {
      options: {
        globals: [],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: (process.env.TRAVIS ? 'mocha-multi' : 'dot')
      },

      all: { src: ['test', 'lib/*/test'] }
    },

    env: {
      coverage : {
        multi: 'dot=- mocha-lcov-reporter=results/lcov.info'
      }
    },

    mkdir: {
      results: {
        options: {
          create: ['results']
        }
      }
    },

    codeclimate: {
      options: {
        file: 'results/lcov.info',
        token: process.env.CODECLIMATE_REPO_TOKEN
      }
    },

    docco: {
      debug: {
        src: [
          // 'lib/index.js',
          // 'lib/linker/index.js',
          'lib/linker/core.js',
        ],
        options: {
          output: 'docs',
          layout: 'parallel'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-codeclimate');

  if (process.env.TRAVIS)
    grunt.registerTask('test', ['mkdir:results' ,'env:coverage', 'simplemocha', 'codeclimate']);
  else
    grunt.registerTask('test', ['mkdir:results' ,'simplemocha']);

  grunt.registerTask('default', 'test');
};