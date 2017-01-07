/**
 * Entry point application to read a KiCad library and convert the components in the library
 * to a schematic in EasyEDA. This is primarily useful for testing conversion into EasyEDA, but
 * might also be useful if you have a KiCAD library you want to import into EasyEDA.
 */

'use strict'

const fs = require('fs')
const lib2sch = require('./util/lib2sch')

const {dialog} = require('electron').remote
const filePaths = dialog.showOpenDialog({properties: ['openDirectory']})

// TODO Find a single sch file in the directory that we want to import

if (filePaths.length === 1) {
  // Read the library that we want to convert and add it to the reader
  const libContents = fs.readFileSync(filePaths[0], 'utf8')

  lib2sch(libContents, 'shapes')
}
