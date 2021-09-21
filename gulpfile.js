//!-------------------------Variable-------------------------------

const { src, dest, parallel, series, watch, task } = require("gulp");

const ghPages = require('gulp-gh-pages')

const browserSync = require("browser-sync").create();

const concat = require("gulp-concat");

const uglify = require("gulp-uglify-es").default;

const autoprefixer = require("gulp-autoprefixer");

const cleancss = require("gulp-clean-css");

const imagecomp = require("compress-images");

const del = require("del");
//!-------------------------Variable-------------------------------

//!-------------------------Function-------------------------------

function browsersync() {
  browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
    online: true,
  });
}

function styles() {
  return src("app/css/main.css")
    .pipe(concat("main.min.css"))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
    )
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

async function images() {
  imagecomp(
    "app/img/src/**/*",
    "app/img/dest/",
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "75"] } },
    { png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    {
      gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
    },
    function (err, completed) {
      if (completed === true) {
        browserSync.reload();
      }
    }
  );
}

function scripts() {
  return src(["app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js/"))
    .pipe(browserSync.stream());
}

function cleanimg() {
  return del("app/img/dest/**/*", { force: true });
}

function startWatch() {
  watch(["app/css/main.css", "!app/css/main.min.css"], styles).on(
    "change",
    browserSync.reload
  );

  watch("app/**/*.html").on("change", browserSync.reload);

  watch("app/img/src/**/*", images);
}

function buildcopy() {
  return src(["app/css/**/*.min.css", "app/img/dest/**/*", "app/**/*.html"], {
    base: "app",
  }).pipe(dest("dist"));
}
function cleandist() {
  return del("dist/**/*", { force: true }); // Удаляем все содержимое папки "dist/"
}

task('deploy', () => src('./dist/**/*').pipe(ghPages()));

//!-------------------------Function-------------------------------

//!-------------------------Exports--------------------------------
exports.browsersync = browsersync;
exports.startWatch = startWatch;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.scripts = scripts;

exports.default = parallel(styles, scripts, browsersync, startWatch);

exports.build = series(cleandist, styles, scripts, images, buildcopy);
//!-------------------------Exports--------------------------------
