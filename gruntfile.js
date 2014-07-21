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
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-mkdir');

  grunt.registerTask('test', ['mkdir:results' ,'env:coverage', 'simplemocha']);

  grunt.registerTask('default', 'test');

};