'use strict'

const ConvertContext = require('../easyeda/convert-context')
const EasyEdaBackend = require('../easyeda/easyeda-backend')
const KiCadLibReader = require('../kicad/kicad-lib-reader')

/**
 * Convert a library to schematic.
 *
 * @param {string} libContents The read library contents (either read from disk or fetched)
 * @param {string} libName The name of the library that is being read
 * @param {object} options Conversion options. This has the shape:
 * {
 *  instFilter => function
 * }
 * @param {function} easyEdaApi The API function to import into EasyEDA. If null, use the globally defined API
 */
const lib2sch = (libContents, libName, options = {}, easyEdaApi = null) => {
  // Create the context for reading and converting
  let context = new ConvertContext()

  // Read the library into the context
  KiCadLibReader.readToContext(libContents, options.libName, context)

  // Create the backend as the destination for the conversion
  let backend = new EasyEdaBackend()

  // Write the context into the backend
  context.librariesToSchematic(backend, options.instFilter)

  // Now we have a scheamtic, so get the data
  const schematicData = backend.getSchematic()

  // Add finally call the EasyEDA function to create a new schematic
  // with the data
  if (!easyEdaApi) {
    // Get the globally defined API entry point
    easyEdaApi = api
  }

  console.log(schematicData)

  easyEdaApi('applySource', {source: schematicData, createNew: true})
}

module.exports = lib2sch
