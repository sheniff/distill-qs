module.exports = function(grunt){
  /**
   * Grunt package loader
   * @param  {Array} packages The collection of package names excluding 'grunt-'
   */
  grunt.loadTasks = function(packages){
    if(!packages.length)
      return;

    packages.forEach(function(package){
      grunt.loadNpmTasks('grunt-' + package);
    })
  };

  grunt.loadTasks([
    'contrib-connect',
    'contrib-copy',
    'contrib-watch',
    'concurrent',
    'karma',
    'contrib-concat',
    'contrib-uglify',
    'contrib-sass',
    'contrib-compass'
  ]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compass: {
      dist: {
        options: {
          sassDir: 'app/sass',
          cssDir: 'app/css',
          environment: 'production'
        }
      },
      dev: {
        options: {
          sassDir: 'app/sass',
          cssDir: 'app/css',
          watch: true,
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: [],
        // the location of the resulting JS file
        dest: 'app/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'app/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    watch: {
      files: '<%= compass.dist.optons.sassDir %>',
      tasks: ['jshint', 'qunit']
    }
  });

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', ['compass:dist', 'concat', 'uglify']);
};
