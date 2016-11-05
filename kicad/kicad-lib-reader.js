'use strict'

const rd = require('./kicad-base-reader')

/**
 * Reader for the Kicad schematic library (LIB) format.
 *
 * This is normally constructed by the KiCadReader
 */
class KiCadLibReader {
  constructor() {
    this.library = {}
  }

  /**
   * Read in the KiCad library into an internal format that we can later
   * convert to EasyEDA format
   *
   * @param {string} source The read library data
   */
  read (source) {
    this._readLines(source)
    return this.library
  }

  /**
   * Evil function, but useful for testing for now
   */
  _readLines (library) {
    return library.split('\n').map((line) => {
      return line.trim()
    })
  }

  /**
   * Read a schematic file into our internal data representation. We read this to
   * a complete structure because EasyEDA doens't give a way to import libraries, so
   * we will need to copy each instance we discover.
   *
   * @param {string} library The library contents to read
   * 
   * @return {object} The read library. The keys in the returned data are the
   * names of compoents in the library. The values are the parsed data
   */
  _readLibrary (library) {
    let libraryData = this._readLines(library)

    // Validate that we have found a library
    if (libraryData.length <= 2 || !libraryData[0].startsWith('EESchema-LIBRARY Version 2.')) {
      throw Error('Contents are not a KiCad library or are not a supported version')
    }

    // Start from the second line (index = 1) to skip the file header
    for (let index = 1; index < libraryData.length; ++index) {
      let line = libraryData[index]

      // Each line is one of a few different types, all keyed based on the beginning
      // of the line
      if (line.startsWith('#')) {
        continue
      } else if (line.startsWith('DEF')) {
        index = this._readComponent(libraryData, index)
      } else if (line.length !== 0) {
        console.log('Unknown file contents: ' + line)
      }
    }

    return this.library
  }

  /**
   * @param {array} libraryData
   */
  _readComponent (libraryData, index) {
    let schlibDef = {}

    rd.readFieldsInto(schlibDef, libraryData[index++], [null, 'name', 'reference', null,
              'text_offset', 'draw_pinnumnber', 'draw_pinname', 'unit_count',
              'units_locked', 'option_flag'
          ], [null, null, null, null,
              null, rd.parseYN, rd.parseYN, parseInt,
              KiCadLibReader._parseIsIdenticalUnits, KiCadLibReader._parseIsPower
          ])

    if (libraryData[index].startsWith('ALIAS')) {
      schlibDef.aliases = rd.readFieldsIntoArray(libraryData[index++], 1)
    } else {
      schlibDef.aliases = []
    }

    // Read the field values until we don't have any more
    while (libraryData[index][0] === 'F') {
      // TODO properly handle these
      this._readLibraryField(libraryData[index], schlibDef)
      index++
    }

    // Handle the $FPLIST, which is a list of footprint names for the component
    if (libraryData[index].startsWith('$FPLIST')) {
      let extraPackageNames = []
      while (libraryData[++index] !== '$ENDFPLIST') {
        extraPackageNames.push(libraryData[index].trim())
      }
      schlibDef.packages = extraPackageNames
    }

    // Read forward until the DRAW section, in case there are things we don't
    // understand
    index = rd.indexOfAny(['DRAW', 'ENDDEF'], libraryData, index)

    if (libraryData[index] === 'DRAW') {
      schlibDef.graphics = []

      // Move to the first line in the draw section
      index++

      // Read the inner draw section
      while (!libraryData[index].startsWith('ENDDRAW')) {
        schlibDef.graphics.push(this._readGraphic(libraryData[index++]))
      }
    }

    // Read until the end of the component
    index = rd.indexOfAny(['ENDDEF'], libraryData, index)

    // Add to ourselves as the parsed data
    if (this.library.hasOwnProperty(schlibDef.name)) {
      throw Error('Library has more than one definition for ' + schlibDef.name)
    }
    this.library[schlibDef.name] = schlibDef

    return index
  }

    /**
     * Read one of the F values from KiCad
     *
     * @param {string} value The full line e.g. F0 DIP-8...
     *
     * @param {object} schLibDef The library definition to read into
     */
  _readLibraryField (value, schLibDef) {
    let item = {}

        // parseInt stops at the first non-integer character, so the spaces at the end are ok
    item.field = parseInt(value.substr(1))

        // We cannot use the normal read into object because the item may have spaces
        // so first find the enclosing double quotes
    let startText = value.indexOf('"', 2)
    let endText = value.indexOf('"', startText + 1)
    item.value = value.substr(startText + 1, endText - startText - 1)

        // The field might have a name, and we can detect this by finding
        // double quotes after the first set
    let startName = value.indexOf('"', endText + 1)
    let endName = startName > -1 ? value.indexOf('"', startName + 1) : -1
    item.name = startName > -1 ? value.substr(startName + 1, endName - startName - 1) : null

        // The middle part of the string are the properties. Get the substr for the
        // part that forms the properties (so we don't have to split on the end name
        // if it exists)
    let propertiesValue = startName > -1 ? value.substr(endText + 1, startName - endText - 1) : value.substr(endText)

        // Read the part of the value after the string identifier. We trim the properties value
        // since we really don't know how many extra spaces it might have
    let fields = {}
    rd.readFieldsInto(fields, propertiesValue.trim(), ['x', 'y', 'dimension', 'orientation', 'visibility', 'format'], [parseInt, parseInt, parseInt, null, null, null])

    return item
  }

  /**
   * Read the graphic element
   */
  _readGraphic (value) {
    let graphicType = value[0]
    let shape = {}

    switch (graphicType) {
      case 'P':
        // Nb parts convert thickness x0 y0 x1 y1 ... xi yi cc

        // Read in the first part before the variable length section
        let fields = value.split(' ')
        rd.readSplitFieldsInfo(shape, fields,
          [null, 'numPoints', 'unit', 'convert', 'thickness'],
          [null, parseInt, parseInt, parseInt, parseInt])

        // Now the variable points, two at a time, starting at the 5th item
        // which is where the points begin
        let lastValIndex = 5 + shape.numPoints * 2;
        let points = []
        for (let valIndex = 5; valIndex < lastValIndex; valIndex += 2) {
          points.push({
            x: parseInt(fields[valIndex]),
            y: parseInt(fields[valIndex + 1])
          })
        }

        // Set the points in our shape
        shape.points = points

        // Finally, the last item is the fill
        shape.filled = KiCadLibReader._parseFillStyle(fields[fields.length - 1])
        break
      case 'S':
        // S startx starty endx endy unit convert thickness cc
        rd.readFieldsInto(shape, value,
          [null, 'startx', 'starty', 'endx',
          'endy', 'unit', 'convert', 'thickness',
          'filled'],
          [null, parseInt, parseInt, parseInt,
          parseInt, parseInt, parseInt, parseInt,
          KiCadLibReader._parseFillStyle])
        break
      case 'C':
        // C posx posy radius unit convert thickness cc
        rd.readFieldsInto(shape, value,
          [null, 'x', 'y', 'radius',
          'unit', 'convert', 'thickness', 'filled'],
          [null, parseInt, parseInt, parseInt,
          parseInt, parseInt, parseInt, KiCadLibReader._parseFillStyle])
        break
      case 'A':
        // A posx posy radius start end part convert thickness cc start_pointX start_pointY end_pointX end_pointY
        rd.readFieldsInto(shape, value,
          [null, 'x', 'y', 'radius',
          'startAngle', 'endAngle', 'unit', 'convert',
          'thickness', 'filled', 'startPointX', 'startPointY',
          'endPointX', 'endPointY'],
          [null, parseInt, parseInt, parseInt,
          rd.parseTenthDegreesToDegrees, rd.parseTenthDegreesToDegrees, parseInt, parseInt,
          parseInt, KiCadLibReader._parseFillStyle, parseInt, parseInt,
          parseInt, parseInt])
        break
      case 'T':
        // T orientation posx posy dimension unit convert Text
        rd.readFieldsInto(shape, value,
          [null, 'orientation', 'x', 'y',
          'dimension', 'unit', 'convert', 'text'],
          [null, KiCadLibReader._parseTextOrientation, parseInt, parseInt,
          parseInt, parseInt, parseInt, null])
        break
      case 'X':
        // X name number posx posy length orientation Snum Snom unit convert Etype [shape]
        // TODO the shape and electrical type are not handled yet
        rd.readFieldsInto(shape, value,
          [null, 'name', 'number', 'x', 'y', 
          'length', 'orientation', 'numberDimension', 'nameDimension',
          'unit', 'convert', 'electricalType', 'shape'],
          [null, null, null, parseInt, parseInt,
          parseInt, KiCadLibReader._parsePinOrientation, parseInt, parseInt,
          parseInt, parseInt, null, null])
        break
      default:
        throw Error('Unknown graphic definition: ' + value)
    }

    return shape
  }

  /**
   * Parse the value if the item has all units as identical
   *
   * @param {string} value The value to parse (single character)
   *
   * @return {boolean} True if all parts are identical, otherwise false
   *
   * @private
   */
  static parseIsIdenticalUnits (value) {
    return rd.parseOptions(value, {
      L: false, // Locked, units are not identical
      F: true // Not locked, units are identical and can be parsed
    })
  }

  /**
   * Parse the value if the part is a power part
   *
   * @param {string} The value to parse (single character)
   *
   * @return {boolean} True if all parts is a power part, otherwise false
   *
   * @private
   */
  static _parseIsPower (value) {
    return rd.parseOptions(value, { N: false, P: true })
  }

  /**
   * Parse if the graphic shape is filled or transparent background
   *
   * @param {string} The value to parse (single character)
   *
   * @return {boolean} True if all graphic is filled, false if the graphic background is transparent
   *
   * @private
   */
  static _parseFillStyle (value) {
    return rd.parseOptions(value, { F: true, f: true, N: false })
  }

  _convertPoint (data, xName = 'x', yName = 'y') {
        // TODO need to figure out how to scale from KiCAD to EasyEDA, but I need
        // downloaded KiCAD to figure this out
    data[xName] = data[xName]
    data[yName] = data[yName]
  }
};

module.exports = KiCadLibReader
