const { src, dest, parallel, series, watch } = require("gulp");
const del = require("del");
const rename = require("gulp-rename");

// For html.
const pug = require("gulp-pug");

// For css.
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// For js.
const uglify = require("gulp-uglify-es").default;

// For errors.
const notify = require("gulp-notify");

// For view.
const browserSync = require("browser-sync").create();

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

function browser_sync() {
  browserSync.init(serverConfig);
}

function html() {
  return src(config.html.src)
    .pipe(pug({ pretty: true }))
    .pipe(dest(config.html.dist))
    .pipe(browserSync.stream());
}

function css() {
  const plugins = [autoprefixer({ grid: "autoplace" }), cssnano()];
  return src(config.css.src, { sourcemaps: true })
    .pipe(sass().on("error", notify.onError()))
    .pipe(postcss(plugins))
    .pipe(
      rename({
        suffix: ".min",
        extname: ".css"
      })
    )
    .pipe(dest(config.css.dist, { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function js() {
  return src(config.js.src)
    .pipe(
      rename({
        suffix: ".min",
        extname: ".js"
      })
    )
    .pipe(uglify())
    .pipe(dest(config.js.dist));
}

function clean() {
  return del([config.html.dist, config.css.dist, config.js.dist], {
    force: true
  });
}

function watcher() {
  watch(config.html.dir, html);
  watch(config.css.dir, css);
  watch(config.js.dir, js)
  .on("change", function() {
    browserSync.reload();
  });
}

exports.clean = clean;
exports.default = series(
  clean,
  parallel(html, css, js),
  parallel(watcher, browser_sync)
);
