var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssvars = require('postcss-simple-vars'),
    nested = require('postcss-nested'),
    cssImport = require('postcss-import'),
    mixins = require('postcss-mixins'),
    cssNano = require('gulp-cssnano'),
    watch = require('gulp-watch'),
    pump = require('pump'),
    uglify = require('gulp-uglify'),
    php = require('gulp-connect-php'),
    concat = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    browserSync = require('browser-sync').create();

    gulp.task('bundle' , function(){
      // Include files to concat here by order
      return gulp.src(['./app/js/lib/*.js'])
         .pipe(concat('1_bundle.min.js'))
         .pipe(uglify())
         .pipe(gulp.dest('./dist/js'));

   });

   // Task to compress all css files in 'to_compress' folder to ./dist/after_compress
   gulp.task('compressCss' , function(){
      return gulp.src('./app/css/to_compress/*.css')
         .pipe(cssNano())
         .pipe(gulp.dest('./dist/styles/after_compress'));
   });

   // Task to concat css files
   gulp.task('concatCss' , function(){
      return gulp.src('./app/css/to_concat/*.css')
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./dist/styles/after_concat_task'));
   });


   gulp.task('sprites', function () {
     var spriteData = gulp.src('./app/img/png/*.png')
     .pipe(spritesmith({
       imgName: 'sprite.png',
       cssName: 'sprite.css',
     }));
    spriteData.css.pipe(gulp.dest('./dist/styles'));
    spriteData.img.pipe(gulp.dest('./app/img/sprite'));
});

    gulp.task('compress', function (cb) {
        pump([
              gulp.src('./app/js/*.js'),
              uglify(),
              gulp.dest('./dist/js/compressed')
          ],
          cb
        );
    });
   //  task to minify and concat css files
    gulp.task('minConcatCss' , function(){
      return gulp.src('./app/css/to_concat/*.css')
         .pipe(postcss([autoprefixer]))
         .pipe(cssNano())
         .on('error', function(errorInfo){
          console.log(errorInfo.toString());
          this.emit('end');
        })
        .pipe(concat('bundle.min.css'))
        .pipe(gulp.dest('./dist/styles/after_concat_task'));
   });


    gulp.task('styles', function(){
     return gulp.src('./app/postCss/styles.css')
       .pipe(postcss([cssImport , mixins , nested , cssvars , autoprefixer]))
       .pipe(cssNano())
       .on('error', function(errorInfo){
         console.log(errorInfo.toString());
         this.emit('end');
       })
       .pipe(gulp.dest('./dist/styles'));
    });


    gulp.task('watch' , function(){

     browserSync.init({
       notify: false ,

    // If not using proxy server uncomment this
    //             |
    //             v

      //  server: {
      //    baseDir: ["./dist" , "./app"]
      // },
      proxy: 'localhost/base/app/index.php',
      port: '80'
     });

     watch('./app/index.html', function(){
        browserSync.reload();
      });
     watch('./app/index.php', function(){
       browserSync.reload();
     });
     watch('./app/js/**/*.js' , function(){
        gulp.start('js-watch');
     });

      watch('./app/postCss/**/*.css' , function(){
         gulp.start('cssInject');
      });
});

gulp.task('js-watch' , ['bundle'] , function(){
   browserSync.reload();
});
gulp.task('cssInject', ['styles'] , function() {
  return gulp.src('./dist/styles/styles.css')
  .pipe(browserSync.stream());
});
