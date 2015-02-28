// Import require dependencies.
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

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
                './src/js/SimpleEventBus.js',
				'./src/js/View.js',
				'./src/js/SystemPromptView.js',
				'./src/js/MenuButtonView.js',
				'./src/js/MenuButtonPanelView.js',
				'./src/js/MainMenuScreen.js',
				'./src/js/ReadyScreen.js',
				'./src/js/GameScreen.js',
				'./src/js/GameOverScreen.js',
				'./src/js/LineOfCode.js',
				'./src/js/TestCode.js',
				'./src/js/PlayerInput.js',
				'./src/js/InputTextView.js',
				'./src/js/TargetCodeView.js',
				'./src/js/ScoreView.js',
				'./src/js/FileLoader.js',
				'./src/js/GameStats.js',
				'./src/js/Game.js'
            ],
            
            // Target directory and filename for concatenated app JS script.
            concatFile: 'app.js',            
            concatTargetDir: '/js/'
        }
    }
};

gulp.task('clean', function () {
    del(projectPaths.buildDir);
});

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

gulp.task('default', ['clean', 'build']);
