var gulp = require('gulp');
var dest = require('gulp-dest');
var markdown = require('gulp-markdown');
var print = require('gulp-print');
var template = require('gulp-template-html');

var beautify_html = require('js-beautify').html;
var fs = require('fs');
var glob = require('glob');
var merge = require('merge-stream');
var path = require('path');
var stream = require('stream');
var through = require('through2');
var _ = require('underscore');


var paths = {
    markup: ['source/**/*.html', 'source/**/*.md', 'templates/**'],
    stylesheets: ['source/css/**/*.css']
};

// Just the markup
gulp.task('site', function () {

    // grab all markup sources
    glob('source/**/*.@(md|html)', function (er, files) {
        var mdSources = files.filter((file) => { return file.endsWith('.md'); });
        var htmlSources = removeDuplicateBasenames(files, '.html', '.md');

        var markupSources = [
            gulp.src(htmlSources),
            gulp.src(mdSources)
                .pipe(markdownTemplate())
        ];

        merge(markupSources)
            .pipe(template('templates/template.html'))
            .pipe(beautifier())
            .pipe(gulp.dest('build/'));
    });
});

// Just the styling
gulp.task('css', function () {
    return gulp.src('source/css/**/*.css')
        .pipe(gulp.dest('build/css/'));
});

// For testing
gulp.task('print', function () {

    // grab all markup sources
    glob('source/**/*.@(md|html)', function (er, files) {
        var mdSources = files.filter((file) => { return file.endsWith('.md'); });
        var htmlSources = removeDuplicateBasenames(files, '.html', '.md');

        var markupSources = [
            gulp.src(htmlSources),
            gulp.src(mdSources)
                .pipe(markdownTemplate())
        ];

        merge(markupSources)
            .pipe(template('templates/template.html'))
            .pipe(print())
            .pipe(gulp.dest('build/'));
    });
});

// Everything
gulp.task('default', ['site','css'], function () {
    gulp.watch(paths.markup, ['site']);
    gulp.watch(paths.stylesheets, ['css']);
});


/*********************** Helper Functions /***********************/

function beautifier() {
    return through.obj(function (data, encoding, done) {
        var beautifyOptions = {
            wrap_line_length: 0
        };

        var contents = beautify_html(data.contents.toString(encoding), beautifyOptions);
        data.contents = new Buffer(contents, encoding);

        this.push(data);
        done();
    });
}

// Converts x.md files to html and sends them through their x.html template file
function markdownTemplate() {

    function _transform (chunk, encoding, done) {
        var file = chunk;
        var that = this;

        var templatePath = file.path.replace('md', 'html');
        var pipeline = through.obj();

        // convert md to html
        pipeline
            .pipe(markdown());

        fs.exists(templatePath, function(exists) { 
            // only push through template if it exists
            if (exists) {
                pipeline.pipe(template(templatePath));
            }

            // pipeline is finalized, start listening for data
            pipeline.on('data', function (data) {
                // pass on the first piece of data and close
                that.push(data);
                done();
            });

            // pass file through pipeline
            pipeline.write(file);
        });
    };

    return through.obj(_transform);
}

// Returns the given list of files with all duplicate basenames removed
// where basename refers to a file name without its extension.
function removeDuplicateBasenames(files, extensionToKeep, extensionToExclude) {
    var sourcesToExclude = files.filter((file) => { return file.endsWith(extensionToExclude); })
    var sourcesToKeep = files.filter((file) => { return file.endsWith(extensionToKeep); })

    var stripExtension = (file) => { return file.replace(/\.[^/.]+$/, ''); };
    var addExtension = (ext) => { return (file) => { return file + ext; }; };

    // remove somefile.keepExt from keep sources if somefile.excludeExt exists
    return _.difference(
        sourcesToKeep.map(stripExtension),
        sourcesToExclude.map(stripExtension)
    ).map(addExtension(extensionToKeep));
}
