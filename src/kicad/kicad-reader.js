'use strict'

const rd = require('./kicad-base-reader')
const KiCadLibReader = require('./kicad-lib-reader')
const EasyEdaFactory = require('../easyeda/easyeda-factory')

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
    this.factory = new EasyEdaFactory()
    this.errors = []
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
   * Convert the schematic to EasyEDA format using the EasyEDA backend
   * to generate the objects
   *
   * @param {EasyEdaBackend} backend The backend for outputing the read data
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
    rd.readFieldsInto(textData, schematicData[index++],
      [null, 'type', 'x', 'y', 'angle', 'dimension'],
      [null, null, parseInt, parseInt, null, null]
      )

    this._convertPoint(textData)

    let textValue = schematicData[index]
    this.backend.text(textValue, textData.x, textData.y)

    return index
  }

  _readComponent (schematicData, index) {
    // First line is the start of the component
    index += 1

    // Read the name reference
    let componentDef = {}
    rd.readFieldsInto(componentDef, schematicData[index++],
      [null, 'name', 'ref'])

    // Read the unit line (for schematic symbols that have multiple units)
    // TODO Not sure if this is correct
    rd.readFieldsInto(componentDef, schematicData[index++],
      [null, 'unit', 'mm'])

    // Read the position line
    rd.readFieldsInto(componentDef, schematicData[index++],
      [null, 'x', 'y'],
      [null, parseInt, parseInt])

    while (!schematicData[index].startsWith('$EndComp') && index < schematicData.length) {
      index += 1
    }

    return index
  }

  _readWire (schematicData, index) {
    let wireDef = {}
    // Increment before since we want to skip the first line
    // AFterward, we are on the final line of the wire
    rd.readFieldsInto(wireDef, schematicData[++index],
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
    rd.readFieldsInto(junctionDef, schematicData[index++],
      [null, null, 'x', 'y'],
      [null, null, parseInt, parseInt])

    this._convertPoint(junctionDef)

    // TODO probably need to store this for later
  }

  _convertPoint (data, xName = 'x', yName = 'y') {
    // TODO need to figure out how to scale from KiCAD to EasyEDA, but I need
    // downloaded KiCAD to figure this out
    data[xName] = data[xName]
    data[yName] = data[yName]
  }

  _mergeErrors (errors, context) {
    // TODO for now ignoring the context
    this.errors = this.errors.concat(errors)
  }
};

module.exports = KiCadReader
