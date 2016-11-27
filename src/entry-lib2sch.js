/**
 * Entry point application to read a KiCad library and convert the components in the library
 * to a schematic in EasyEDA. This is primarily useful for testing conversion into EasyEDA, but
 * might also be useful if you have a KiCAD library you want to import into EasyEDA.
 */

'use strict'

const fs = require('fs')
const EasyEdaBackend = require('./easyeda/easyeda-backend')
const KiCadReader = require('./kicad/kicad-reader')

// Create the EasyEDA backend since that is our destination
let backend = new EasyEdaBackend()

// We are reading KiCAD libraries, so use that as the reader
// and then connect the backend as the output for the reader
let reader = new KiCadReader()
reader.backend = backend

// Read the library that we want to convert and add it to the reader
const libContents = fs.readFileSync('D:/Dev/easyeda-importer/test/kicad/opamp/opamp.lib', 'utf8')
reader.addLibrarySource(libContents, 'OPAMP')

// Convert a library into a schematic
reader.libraryToSchematic('OPAMP')

// Now we have a scheamtic, so get the data
const schematicData = backend.getSchematic()

console.log(schematicData)

// Add finally call the EasyEDA function to create a new schematic
// with the data
api('applySource', {source: schematicData, createNew: true})
