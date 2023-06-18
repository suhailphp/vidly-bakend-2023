const {
  series,
  src,
  dest,
  task,
  watch,
  parallel,
} = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync')
  .create();
const del = require('del');
const path = require('path');
const SASS = require('sass');
const sass = require('gulp-sass')(SASS);
const minifyCss = require('gulp-minify-css');
// const uglify = require('gulp-uglify');
const terser = require('gulp-terser'); // uglify js es6
const concat = require('gulp-concat');

const gulpConfig = {
  browserSync: {
    enable: true,
    watchPaths: [
      './src/config/*.js',
      './src/middlewares/*.js',
      './src/models/*.js',
      './src/modules/*.js',
      './src/controllers/*.js',
      './src/routes/*.js',
      './src/services/*.js',
      './src/utilities/*.js',
      './src/views/**/*.hbs',
      './public/dist/**/*',
    ],
  },
};

const config = {
  baseSourceDir: './vendor/',
  baseDestDir: './public/dist/',
  css: {
    theme: {
      sourceDir: [
        'metronic/assets/css/style.bundle.css',
        'metronic/assets/plugins/global/plugins.bundle.css',
        'metronic/assets/plugins/custom/prismjs/prismjs.bundle.css',
        'metronic/assets/css/themes/layout/header/base/light.css',
        'metronic/assets/css/themes/layout/header/menu/light.css',
        'metronic/assets/css/themes/layout/brand/dark.css',
        'metronic/assets/css/themes/layout/aside/dark.css',
      ],
      destDir: 'css',
      fileName: 'theme.min.css',
    },
    themeRTL: {
      sourceDir: [
        'metronic/assets/css/style.bundle.rtl.css',
        'metronic/assets/plugins/global/plugins.bundle.rtl.css',
        'metronic/assets/plugins/custom/prismjs/prismjs.bundle.rtl.css',
        'metronic/assets/css/themes/layout/header/base/light.rtl.css',
        'metronic/assets/css/themes/layout/header/menu/light.rtl.css',
        'metronic/assets/css/themes/layout/brand/dark.rtl.css',
        'metronic/assets/css/themes/layout/aside/dark.rtl.css',
      ],
      destDir: 'css',
      fileName: 'theme.min.rtl.css',
    },
    lib: {
      sourceDir: [
        // 'libraries/jQuery.Gantt/css/style.css',
        'metronic/assets/plugins/custom/datatables/datatables.bundle.css',
        'metronic/assets/css/pages/wizard/wizard-1.css',
        // 'libraries/starrr-gh-pages/dist/starrr.css',
      ],
      destDir: 'css',
      fileName: 'lib.min.css',
    },
    libRTL: {
      sourceDir: [],
      destDir: 'css',
      fileName: 'lib.min.rtl.css',
    },
    custom: {
      sourceDir: ['../src/client/css/**/*.css'],
      destDir: 'css',
      fileName: 'all.min.css',
    },
  },
  js: {
    theme: {
      sourceDir: [
        'metronic/assets/plugins/global/plugins.bundle.js',
        'metronic/assets/plugins/custom/prismjs/prismjs.bundle.js',
        'metronic/assets/js/scripts.bundle.js',
        'metronic/assets/js/pages/widgets.js',
        'metronic/assets/plugins/custom/draggable/draggable.bundle.js',
      ],
      destDir: 'js',
      fileName: 'theme.min.js',
    },
    lib: {
      sourceDir: [
        'libraries/summernote/summernote.ext.dropdown.js',
        'libraries/jQuery.Gantt/js/jquery.fn.gantt.min.js',
        'libraries/roadmap/jquery.roadmap.js',
        'libraries/knob/jquery.knob.js',
        'libraries/easytimer.js/dist/easytimer.min.js',
        'libraries/ez.countimer/ez.countimer.min.js',
        'libraries/jquery-validation/jquery.validate.min.js',
        'libraries/jquery-validation/additional-methods.min.js',
        'libraries/DataTables/datatables.js',
        'metronic/assets/plugins/custom/datatables/datatables.bundle.js',
        'libraries/starrr-gh-pages/dist/starrr.js',
        'libraries/socket/socket.io.min.js',
      ],
      destDir: 'js',
      fileName: 'lib.min.js',
    },
    custom: {
      sourceDir: ['../src/client/js/**/*.js'],
      destDir: 'js',
      fileName: 'all.min.js',
    },
  },
  copy: [
    {
      source: 'metronic/assets/**/*',
      dest: 'assets/',
    },
    {
      source: 'favicon.ico',
      dest: '../',
    },
    //   {
    //     source: 'robots.txt',
    //     dest: '../',
    //   },
    //   {
    //     source: 'download/**/*',
    //     dest: '../download',
    //   },
    //   {
    //     source: 'libraries/**/*',
    //     dest: 'libs/',
    //   },
    //   {
    //     source: 'fonts/**/*.{ttf,woff,woff2,eof,svg}',
    //     dest: 'fonts/',
    //   },
    // {
    //   source: 'libraries/jQuery.Gantt/img/*',
    //   dest: 'img',
    // },
  ],
  reload: './public/dist/',
  watchPublicJS: './src/client/js/',
  watchPublicCSS: './src/client/css/',
};
  /**
   * tasks
   */
// clean distribution directory
const clean = () => del([config.baseDestDir]);

const minCSS = ({
  sourceDir,
  destDir,
  fileName,
}) => () => src(sourceDir, { cwd: config.baseSourceDir })
  .pipe(concat(fileName))
  .pipe(sass())
  .pipe(minifyCss())
  .pipe(dest(path.join(config.baseDestDir, destDir)));

const minJS = ({
  sourceDir,
  destDir,
  fileName,
}) => () => src(sourceDir, { cwd: config.baseSourceDir })
  .pipe(concat(fileName))
  .pipe(
    terser({
      compress: {
        hoist_funs: false,
      },
    }),
  )
  .pipe(dest(path.join(config.baseDestDir, destDir)));

// Copy static files
const copyFiles = async function () {
  for (const c of config.copy) {
    const source = path.join(__dirname, config.baseSourceDir, c.source);
    const destination = path.join(__dirname, config.baseDestDir, c.dest);
    await src(source)
      .pipe(dest(destination));
  }
  return true;
};

const nodeMon = (cb) => nodemon({
  script: './bin/www', // this is where my express server is
  watch: ['src/**/*', '!src/client/**/*'],
  // ext: "js html css", // nodemon watches *.js, *.html and *.css files
  env: { NODE_ENV: 'development' },
})
  .on('start', () => {
    setTimeout(() => {
      cb();
    }, 400);
  });

task('clean', clean);
/**
   * CSS
   */
task('css-theme', minCSS(config.css.theme));

task('css-theme-rtl', minCSS(config.css.themeRTL));

task('css-lib', minCSS(config.css.lib));

task('css-lib-rtl', minCSS(config.css.libRTL));

task('css', minCSS(config.css.custom));
/**
   * JS
   */
task('js-theme', minJS(config.js.theme));

task('js-lib', minJS(config.js.lib));

task('js', minJS(config.js.custom));
/**
   * Copy Files
   */
task('copy-files', copyFiles);
/**
   * Nodemon
   */
task('nodemon', nodeMon);
/**
   * Sync
   */
task('sync', () => {
  const appConfig = require('./src/config');
  browserSync.init({
    watch: true,
    // port: 5050, //this can be any port, it will show our app
    proxy: `${appConfig.HOST_URL}`, // this is the port where express server works
    // ui: { port: 3003 }, //UI, can be any port
    reloadDelay: 100, // Important, otherwise syncing will not work
    ghostMode: false,
    // ghostMode: {
    //   clicks: true,
    //   forms: true,
    //   scroll: false
    // }
  });

  /**
     * Browser sync config
     */
  if (gulpConfig.browserSync.enable) {
    watch(gulpConfig.browserSync.watchPaths)
      .on('change', browserSync.reload);
  }
  /**
     * watch change client js to min it
     */

  watch([config.watchPublicJS], Object.assign(minJS(config.js.custom), { displayName: 'js' }));

  /**
     * watch change client css to min it
     */
  watch([config.watchPublicCSS], Object.assign(minCSS(config.css.custom), { displayName: 'css' }));
});

// theme assets
// task(
//   'theme',
//   series(
//     'clean',
//     parallel(
//       'js-theme',
//       'js-lib',
//       'css-theme',
//       'css-theme-rtl',
//       'css-lib',
//       // 'css-lib-rtl',
//       'copy-files',
//     ),
//   ),
// );
task(
  'theme',
  series(
    'clean',
    parallel(
      'copy-files',
    ),
  ),
);

// custom js css
task('client', parallel(
  'js',
  'css',
));

/**
   * I18n files
   */
const fs = require('fs');
const AR = require('./locales/ar.json');
const EN = require('./locales/en.json');

task('i18n', async () => {
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  const en = JSON.stringify({ ...EN, notification_templates: '' });
  const ar = JSON.stringify({ ...AR, notification_templates: '' });
  await fs.writeFileSync('./public/ar.js', `const TR = ${ar}`);
  await fs.writeFileSync('./public/en.js', `const TR = ${en}`);
});

// production build
task('build', series('clean', parallel(
  'theme',
  'client',
  'i18n',
)));

task('default', series('client', 'nodemon', 'sync'));
