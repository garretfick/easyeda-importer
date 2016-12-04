'use strict'

const EasyEdaFactory = require('./easyeda-factory')

/**
 * The main context of the conversion. This holds the defintion of libraries we needed
 * to read, schematics and pages that were read, modules, etc.
 *
 * The EasyEDA backend operates on this context to serialize to the EasyEDA format.
 * The KiCAD readers operates on this context to populate the information.
 */
class ConvertContext {
  constructor () {
    this.libs = {}
    this.errors = []
    this.factory = new EasyEdaFactory()
  }

  /**
   * Add a component library into this context
   * @param {CompLibrary} compLib The library to add
   * @param {string} name The name of the library
   */
  addCompLibrary (compLib, name) {
    this.libs[name] = compLib
  }

  /**
   * Get the library with the specified name
   */
  findCompLibrary (name) {
    return this.libs[name]
  }

  /**
   * Get the libraries in this context
   */
  get libraries () {
    return Object.keys(this.libs).map(key => {
      return this.libs[key]
    })
  }

  /**
   * Add errors into this conversion context.
   * @param {[*]} errors The errors to add
   */
  mergeErrors (errors) {
    this.errors = this.errors.concat(errors)
  }

  /**
   * Convert the specified libraries into a schematic.
   *
   * You must have first added the library source to the reader (see KiCadReader.addLibrarySource)
   *
   * For example:
   *
   * library = new KiCadLibrary()
   * library.read(...)
   * context = new ConvertContext()
   * reader.addCompLibrary(library, 'OPAMPS')
   *
   * backend = new EasyEdaBackend()
   * reader.librariesToSchematic(backend)
   *
   * backend.getSchematic()
   *
   * @param {EasyEdaBackend} backend The backend destination for the serialized data
   * @param {function} function If defined, a function to decide if the component should be converted
   * Arguments are an object with the shape { libName: <string>, compName: <string> }
   */
  librariesToSchematic (backend, filter) {
    backend.beginSchematicContext()

    // Get the library from the read libraries
    Object.keys(this.libs).forEach(libName => {
      let library = this.libs[libName]

      // Iterate over the definitions in this library
      library.defs.forEach(compDef => {
        let compName = compDef.name
        // Check if we want to convert this one
        if (!filter || filter({libName, compName})) {
          // It might have aliases, and we convert those as separate
          // components
          compDef.names.forEach(name => {
            // Create the instance that can exist on a schematic
            let compLibInst = compDef.toInstance(name)

            // Add it to the current schematic
            backend.addCompInst(compLibInst)
          })
        }
      })
    })

    backend.endSchematicContext()
  }
}

module.exports = ConvertContext
