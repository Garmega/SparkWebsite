var gulp = require('gulp');
var template = require('gulp-template-html');

var paths = {
    sources: ['source/**/*.html','templates/**'],
    stylesheets: ['source/css/**/*.css']
};
 
gulp.task('site', function () {
    return gulp.src('source/**/*.html')
      .pipe(template('templates/template.html'))
      .pipe(gulp.dest('build/'));
});

gulp.task('css', function () {
    return gulp.src('source/css/**/*.css')
        .pipe(gulp.dest('build/css/'));
});
 
gulp.task('default', ['site','css'], function () {
    gulp.watch(paths.sources, ['site']);
    gulp.watch(paths.stylesheets, ['css']);
});
