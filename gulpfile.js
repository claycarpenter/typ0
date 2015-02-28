// Import require dependencies.
var gulp = require('gulp'),
    concat = require('gulp-concat');

/* 
    Define project paths.
    
    Note that all paths are defined relative to the project root.
*/

var projectPaths = {
    buildDir: 'build',
    assetsDir: '/assets',
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
                './src/js/typ0/SimpleEventBus.js',
				'./src/js/typ0/View.js',
				'./src/js/typ0/SystemPromptView.js',
				'./src/js/typ0/MenuButtonView.js',
				'./src/js/typ0/MenuButtonPanelView.js',
				'./src/js/typ0/MainMenuScreen.js',
				'./src/js/typ0/ReadyScreen.js',
				'./src/js/typ0/GameScreen.js',
				'./src/js/typ0/GameOverScreen.js',
				'./src/js/typ0/LineOfCode.js',
				'./src/js/typ0/TestCode.js',
				'./src/js/typ0/PlayerInput.js',
				'./src/js/typ0/InputTextView.js',
				'./src/js/typ0/TargetCodeView.js',
				'./src/js/typ0/ScoreView.js',
				'./src/js/typ0/FileLoader.js',
				'./src/js/typ0/GameStats.js',
				'./src/js/typ0/Game.js'
            ],
            
            // Target directory and filename for concatenated app JS script.
            concatFile: 'app.js',            
            concatTargetDir: '/js/'
        }
    }
};

// TODO: The impl of these two JS copy tasks is redudant.
gulp.task('copy-vendor-js', function () {
    var paths = projectPaths.javaScripts.vendor;
    var destDir = projectPaths.buildDir + paths.concatTargetDir;
    
    gulp.src(paths.files)
        .pipe(concat(paths.concatFile))
        .pipe(gulp.dest(destDir));
});

gulp.task('copy-app-js', function () {
    var paths = projectPaths.javaScripts.app;
    var destDir = projectPaths.buildDir + paths.concatTargetDir;
    
    gulp.src(paths.files)
        .pipe(concat(paths.concatFile))
        .pipe(gulp.dest(destDir));
});

gulp.task('copy-html', function () {
    gulp.src(['./src/html/**/*.html'])
        .pipe(gulp.dest(projectPaths.buildDir));
});

gulp.task('copy-css', function () {
    var destDir = projectPaths.buildDir + projectPaths.assetsDir;
    gulp.src(['./src/assets/**/*'])
        .pipe(gulp.dest(destDir));
});
              
gulp.task('prep-js', ['copy-vendor-js', 'copy-app-js']);

gulp.task('build', ['prep-js', 'copy-html', 'copy-css']);

gulp.task('default', ['build']);
