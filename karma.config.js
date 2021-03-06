// Karma configuration
// Generated on Sat May 01 2021 00:28:28 GMT+0900 (Japan Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'src/**/*.ts',
      'src/**/*.tsx',
      'test/**/*.test.ts',
      'test/**/*.test.tsx',
    ],

    karmaTypescriptConfig: {
        tsconfig: "./tsconfig.json",
        bundlerOptions: {
            resolve: {
                directories: ["src", "node_modules"]
            }
        }
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/**/*.ts' : ['karma-typescript'],
        'src/**/*.tsx' : ['karma-typescript'],
        'test/**/*.test.ts' : ['karma-typescript'],
        'test/**/*.test.tsx' : ['karma-typescript'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-typescript'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
