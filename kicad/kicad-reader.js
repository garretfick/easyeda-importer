'use strict'

const KiCadLibReader = require('./kicad-lib-reader')

/**
 * Reader for the Kicad schematic format.
 *
 * To use the reader:
 * 1. Add library and schematic sources, then
 * 2. Read the schematic (and libraries) into the backend
 */
class KiCadReader
{
  constructor () {
    this.backend = null
    this.schematics = []
    this.schematicLibs = []
  }

  /**
   * Add the library to the reader. You should add required libraries to the reader
   * prior to reading a schematic
   * 
   * @param {string} source The read library contents
   * 
   * @param {string} name The name of the library (usually this is the file name without the extension).
   * This name is used to find the library when reading schematics
   */
  addLibrarySource (source, name) {
    let libReader = new KiCadLibReader()
    libReader.read(source)

  }

  /**
   * Add a schematic (SCH) to the list of schematics that should be read.
   *
   * @param {string} source The schematic file contents
   */
  addSchematicSource (source) {
    this.schematics.push(source)
  }

  /**
   * Convert a library into EasyEDA schematic. Use this to import the entire contents of a KiCAD
   * library into an EasyEDA schematic. This will import the library by placing all components
   * in the library into a schematic.
   * 
   * You must have first added the library source to the reader (see KiCadReader.addLibrarySource)
   * 
   * For example:
   * 
   * reader = new KiCadReader()
   * reader.addLibrarySource(stream, 'OPAMPS')
   * reader.libraryToSchematic('OPAMPS')
   * reader.getSchematic()
   */
  libraryToSchematic (libraryName) {

  }

  /**
   * Convert the schematic to EasyEDA format using the EasyEDA backend
   * to generate the objects
   *
   * @param {object} backend The backend for outputing the read data
   */
  read (backend) {
    this.backend = backend

        // Convert each schematic, one at a time. It probably doesn't make sense
        // now to have more than one, but our API allows is
    this.schematics.forEach((schematic) => {
      this._readSchematic(schematic)
    })
  }

    /**
     * Evil function, but useful for testing for now
     */
  _readLines (schematic) {
    try {
      let schematicData = schematic.split('\n').map((line) => {
        return line.trim()
      })
      return schematicData
    } catch (e) {
      console.log('Cannot read schematic file')
      console.log(e)
      return null
    }
  }

    /**
     * Read a schematic file, calling the appropriate backend as encountering
     * objects in the schematic
     */
  _readSchematic (schematic) {
    let schematicData = this._readLines(schematic)
    if (schematicData) {
            // Skip the header contents. We are looking for the key $EndDescr to indicate
            // the beginning of the schematic
      let endDescIndex = schematicData.findIndex((line) => {
        return line === '$EndDescr'
      })

      schematicData = schematicData.slice(endDescIndex + 1)

      for (let index = 0; index < schematicData.length; ++index) {
        let line = schematicData[index]

                // Each line is one of a few different types, all keyed based on the beginning
                // of the line
        if (line.startsWith('Wire Wire Line')) {
          index = this._readWire(schematicData, index)
        } else if (line.startsWith('Entry Wire Line')) {
          index = this._readWire(schematicData, index)
        } else if (line.startsWith('Connection')) {
          index = this._readConnection(schematicData, index)
        } else if (line.startsWith('Text')) {
          index = this._readSchText(schematicData, index)
        } else if (line.startsWith('$Comp')) {
          index = this._readComponent(schematicData, index)
        } else {
          console.log('Uknown schematic entry ' + line)
        }
      }
    } else {
      console.log('No schematic data to read')
    }
  }

    /**
     * Reads schematic text entry.
     *
     * @return int The ending line of the text entry. The reader should begin at the
     * line following this line
     */
  _readSchText (schematicData, index) {
    let textData = {}
    this._readFieldsInto(textData, schematicData[index++],
      [null, 'type', 'x', 'y', 'angle', 'dimension'],
      [null, null, parseInt, parseInt, null, null]
      )

    this._convertPoint(textData)

    let textValue = schematicData[index]
    // TODO maybe using Object.assign
    // (or my own variant) will make this code easier to maintain
    // with fewer function parameters
    this.backend.text(textValue, textData.x, textData.y)

    return index
  }

  _readComponent (schematicData, index) {
    // First line is the start of the component
    index += 1

    // Read the name reference
    let componentDef = {}
    this._readFieldsInto(componentDef, schematicData[index++],
      [null, 'name', 'ref'])

    // Read the unit line (for schematic symbols that have multiple units)
    // TODO Not sure if this is correct
    this._readFieldsInto(componentDef, schematicData[index++],
      [null, 'unit', 'mm'])

    // Read the position line
    this._readFieldsInto(componentDef, schematicData[index++],
      [null, 'x', 'y'],
      [null, parseInt, parseInt])

    while (!schematicData[index].startsWith('$EndComp') && index < schematicData.length) {
      console.log(schematicData[index])
      index += 1
    }

    return index
  }

  _readWire (schematicData, index) {
    let wireDef = {}
    // Increment before since we want to skip the first line
    // AFterward, we are on the final line of the wire
    this._readFieldsInto(wireDef, schematicData[++index],
      ['startX', 'startY', 'endX', 'endY'],
      [parseInt, parseInt, parseInt, parseInt])

    this._convertPoint(wireDef, 'startX', 'startY')
    this._convertPoint(wireDef, 'endX', 'endY')

    return index
  }

  /**
   * Read in a connection (a junction)
   */
  _readConnection (schematicData, index) {
    let junctionDef = {}
    // The connection is specified on a single line, so increment afterward.
    // We are already on the line of interest
    this._readFieldsInto(junctionDef, schematicData[index++],
      [null, null, 'x', 'y'],
      [null, null, parseInt, parseInt])

    this._convertPoint(junctionDef)

    // TODO probably need to store this for later
  }

  /**
   * Reads a line containing space separated fields into the data object.
   *
   * @param targetObject The object to read into.
   *
   * @param line The line to read.
   *
   * @param fieldIdentifiers Array of field names. The index of the field names matches
   * the index of the field in the line. If the field should not be added to the object,
   * set the value at index to null.
   *
   * @param fieldTypeConverters Array of function to convert the field values. The index
   * of the field type converters matches the index of the filed in the line. If the field
   * should not be converted, set the value at the index to null. If null, then do not
   * use type conversion.
   *
   * @return The modified object. The object is converted in place, so this is only necessary
   * to use as a fluent API
   */
  _readFieldsInto (targetObject, line, fieldIdentifiers, fieldTypeConverters) {
    let lineFields = line.split(' ')
    let maxField = Math.min(lineFields.length, fieldIdentifiers.length)
    for (let index = 0; index < maxField; ++index) {
      let value = lineFields[index]

      // If the field name is null, then skip it. We don't need the value
      let fieldName = fieldIdentifiers[index]
      if (!fieldName) {
        continue
      }

      // Do we want to convert this value? We may not be using type conversion at all
      let typeConverter = fieldTypeConverters ? fieldTypeConverters[index] : null
      if (typeConverter) {
        value = typeConverter(value)
      }

      targetObject[fieldName] = value
    }

    return targetObject
  }

  _convertPoint (data, xName = 'x', yName = 'y') {
    // TODO need to figure out how to scale from KiCAD to EasyEDA, but I need
    // downloaded KiCAD to figure this out
    data[xName] = data[xName]
    data[yName] = data[yName]
  }
};

module.exports = KiCadReader
