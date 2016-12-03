const EasyEdaBackend = require('../easyeda/easyeda-backend')
const KiCadReader = require('../kicad/kicad-reader')

/**
 * Convert a library to schematic.
 *
 * @param {string} libContents The read library contents (either read from disk or fetched)
 * @param {libName} libName The name of the library
 * @param {function} easyEdaApi The API function to import into EasyEDA. If null, use the globally defined API
 */
const lib2sch = (libContents, libName, easyEdaApi = null) => {
  // Create the EasyEDA backend since that is our destination
  let backend = new EasyEdaBackend()

  // We are reading KiCAD libraries, so use that as the reader
  // and then connect the backend as the output for the reader
  let reader = new KiCadReader()
  reader.backend = backend

  // Read the library that we want to convert and add it to the reader
  reader.addLibrarySource(libContents, libName)

  // Convert a library into a schematic
  reader.libraryToSchematic()

  // Now we have a scheamtic, so get the data
  const schematicData = backend.getSchematic()

  console.log(schematicData)

  // Add finally call the EasyEDA function to create a new schematic
  // with the data
  if (!easyEdaApi) {
    // Get the globally defined API entry point
    easyEdaApi = api
  }

  easyEdaApi('applySource', {source: schematicData, createNew: true})
}

module.exports = lib2sch
