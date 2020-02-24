const gulp = require("gulp");
const del = require("del");
const rename = require("gulp-rename");

// For html.
const pug = require("gulp-pug");

// For css.
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// For js.
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify-es").default;

// For errors.
const notify = require("gulp-notify");

// For view.
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

const root = `./app`;

const config = {
  html: {
    dir: `${root}/pug/**/*.pug`,
    src: `${root}/pug/*.pug`,
    dist: `${root}/html`
  },
  css: {
    dir: `${root}/scss/**/*.scss`,
    src: `${root}/scss/**/*.scss`,
    dist: `${root}/css`
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
  browserSync.init(serverConfig);
});

gulp.task("html", function() {
  return gulp
    .src(config.html.src)
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest(config.html.dist))
    .pipe(browserSync.stream());
});

gulp.task("css", function() {
  const plugins = [autoprefixer({ grid: "autoplace" }), cssnano()];
  return gulp
    .src(config.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", notify.onError()))
    .pipe(postcss(plugins))
    .pipe(
      rename({
        suffix: ".min",
        extname: ".css"
      })
    )
    .pipe(sourcemaps.write("/"))
    .pipe(gulp.dest(config.css.dist))
    .pipe(browserSync.stream());
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
});

gulp.task("clean", function() {
  return del([config.html.dist, config.css.dist, config.js.dist], {
    force: true
  });
});

gulp.task("watch", function() {
  gulp.watch(config.html.dir, gulp.series("html"));
  gulp.watch(config.css.dir, gulp.series("css"));
  gulp.watch(config.js.dir, gulp.series("js", "js-watch"));
});

gulp.task(
  "default",
  gulp.series(
    ["clean"],
    gulp.parallel("html", "css", "js"),
    gulp.parallel("watch", "browser-sync")
  )
);
