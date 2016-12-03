/**
 * Entry point application to read a KiCad library and convert the components in the library
 * to a schematic in EasyEDA. This is primarily useful for testing conversion into EasyEDA, but
 * might also be useful if you have a KiCAD library you want to import into EasyEDA.
 */

'use strict'

const fetch = require('whatwg-fetch')
const lib2sch = require('./util/lib2sch')

// Asks the user for the location of the file to import
let fileUrl = prompt('Enter the URL of the KiCAD library to import')

// TODO should get this from the name of the file
let libName = 'shapes'

fetch(fileUrl)
  .then(response => {
    response.text()
  })
  .then(fileData => {
    lib2sch(fileData, libName)
  })
  .catch(error => {
    alert(error)
  })
