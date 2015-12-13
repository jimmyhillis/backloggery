const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('es2015', function () {
  gulp.src('src/bin/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest('bin'));
  gulp.src(['src/**/*.js', '!src/bin/**/*.js'])
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['es2015']);
