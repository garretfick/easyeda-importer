/**
 * Configuration of Webpack for converting a KiCAD schmeatic to an EasyEDA schematic. This is currently incomplete.
 */

const path = require('path')

module.exports = {
  entry: './src/entry-sch2sch',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle-sch2sch-test.js'
  },
  externals: [
    // For each of the names in the IGNORES list, do not
    // resolve them. Then replace them with require('...')
    // which essentially leave them unchanged.
    (() => {
      const IGNORES = [
        'fs'
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
