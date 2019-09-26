const gulp = require("gulp");

// For js.
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;

// For styles.
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");

// For include parts of files.
const rigger = require("gulp-rigger");

// For errors.
const notify = require("gulp-notify");

// For view.
const del = require("del");
const browserSync = require("browser-sync");
const reload = browserSync.reload;

const root = `./app`;

const config = {
  scss: {
    dir: `${root}/scss/**/*.scss`,
    src: `${root}/scss/pages/*.scss`,
    dist: `${root}/css`
  },
  html: {
    dir: `${root}/dev_html/**/*.html`,
    src: `${root}/dev_html/*.html`,
    dist: `${root}/html`
  },
  js: {
    dir: `${root}/dev_js/**/*.js`,
    src: `${root}/dev_js/*.js`,
    dist: `${root}/js`
  }
};

// Server.
const serverConfig = {
  server: {
    baseDir: root,
    directory: true
  },
  startPath: "html/index.html",
  notify: false
};

gulp.task("browser-sync", function() {
  browserSync(serverConfig);
});

gulp.task("html", function() {
  return gulp
    .src(config.html.src)
    .pipe(rigger())
    .pipe(gulp.dest(config.html.dist))
    .pipe(reload({ stream: true }));
});

gulp.task("scss", function() {
  return gulp
    .src(config.scss.src)
    .pipe(sass({ outputStyle: "expanded" }).on("error", notify.onError()))
    .pipe(
      autoprefixer({
        grid: "autoplace"
      })
    )
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(
      rename({
        suffix: ".min",
        extname: ".css"
      })
    )
    .pipe(gulp.dest(config.scss.dist))
    .pipe(reload({ stream: true }));
});

gulp.task("js", function() {
  return gulp
    .src(config.js.src)
    .pipe(rigger())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".js"
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest(config.js.dist));
});

gulp.task("js-watch", function(done) {
  browserSync.reload();
  done();
})

gulp.task("clean", function() {
  return del([config.html.dist, config.scss.dist, config.js.dist], {
    force: true
  });
});

gulp.task("watch", function() {
  gulp.watch(config.html.dir, gulp.series("html"));
  gulp.watch(config.scss.dir, gulp.series("scss"));
  gulp.watch(config.js.dir, gulp.series("js", "js-watch"));
});

gulp.task(
  "default",
  gulp.series(
    ["clean"],
    gulp.parallel(["html"], ["scss"], ["js"]),
    gulp.parallel(["watch"], ["browser-sync"])
  )
);
