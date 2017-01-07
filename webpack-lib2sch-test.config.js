/**
 * Configuration of Webpack to build the application to convert a library to a schematic. This
 * application only works if you have a development copy of EasyEDA that works on your desktop.
 */

const path = require('path')

module.exports = {
  entry: './src/entry-lib2sch-test',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle-lib2sch-test.js'
  },
  externals: [
    // For each of the names in the IGNORES list, do not
    // resolve them. Then replace them with require('...')
    // which essentially leave them unchanged.
    (() => {
      const IGNORES = [
        'fs',
        'electron'
      ]
      return (context, request, callback) => {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')")
        }
        return callback()
      }
    })()
  ]
}
