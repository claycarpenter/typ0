// Import require dependencies.
var gulp = require('gulp'),
    concat = require('gulp-concat');

/* 
    Define project paths.
    
    Note that all paths are defined relative to the project root.
*/

var projectPaths = {
    buildDir: 'build',
    javaScripts: {
        vendor: {
            // List of vendor/third-party JS libraries.
            files: [
                // jQuery
                './bower_components/jquery/dist/jquery.min.js',
            ],
            
            // Target directory and filename for concatenated JS vendor 
            // lib script.
            concatFile: 'vendor.js',            
            concatTargetDir: '/js/'
        },
        app: {
            // List of app JS scripts.
            files: [
                // Main app logic. App init point.
                './src/js/main.js'
            ],
            
            // Target directory and filename for concatenated app JS script.
            concatFile: 'app.js',            
            concatTargetDir: '/js/'
        }
    }
};

gulp.task('copy-vendor-js', function () {
    var vendorPaths = projectPaths.javaScripts.vendor;
    var destDir = projectPaths.buildDir + vendorPaths.concatTargetDir;
    
    gulp.src(vendorPaths.files)
        .pipe(concat(vendorPaths.concatFile))
        .pipe(gulp.dest(destDir));
});
              
gulp.task('prep-js', ['copy-vendor-js']);

gulp.task('build', ['prep-js']);

gulp.task('default', ['build']);
