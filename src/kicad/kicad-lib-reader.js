'use strict'

const rd = require('./kicad-base-reader')

/**
 * Reader for the Kicad schematic library (LIB) format.
 *
 * This is normally constructed by the KiCadReader
 */
class KiCadLibReader {
  /**
   * Create the KiCadLibReader
   *
   * @param {EasyEdaFactory} factory Factory to create required objects
   */
  constructor (factory) {
    this.library = {}
    this.factory = factory
  }

  /**
   * Read in the KiCad library into an internal format that we can later
   * convert to EasyEDA format
   *
   * @param {string} source The read library data
   */
  read (source) {
    this._readLibrary(source)
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
    let shape = null

    switch (graphicType) {
      case 'P':
        // Nb parts convert thickness x0 y0 x1 y1 ... xi yi cc

        shape = this.factory.createPolygon()

        // Read in the first part before the variable length section.
        let fields = value.split(' ')
        rd.readSplitFieldsInfo(shape, fields,
          [null, '__kicad_numPoints', '__kicad_unit', '__kicad_convert', 'strokeWidth'],
          [null, parseInt, null, null, KiCadLibReader._parseWidth])

        // Now the variable points, two at a time, starting at the 5th item
        // which is where the points begin
        let lastValIndex = 5 + shape.__kicad_numPoints * 2
        let points = []
        for (let valIndex = 5; valIndex < lastValIndex; valIndex += 2) {
          points.push({
            x: parseInt(fields[valIndex]),
            y: parseInt(fields[valIndex + 1])
          })
        }

        // Set the points in our shape
        shape.pointArr = points

        // Finally, the last item is the fill
        shape.fillColor = KiCadLibReader._parseFillStyle(fields[fields.length - 1])
        break
      case 'S':
        // S startx starty endx endy unit convert thickness cc
        shape = this.factory.createRect()

        // We have a problem here because EasyEDA stores width and height, and
        // ensures that they are positive values. KiCAD can essentially have negative
        // width and height because of the ordering of start and end values
        rd.readFieldsInto(shape, value,
          [null, '__kicad_startx', '__kicad_starty', '__kicad_endx',
          '__kicad_endy', '__kicad_unit', '__kicad_convert', 'strokeWidth',
          'fillColor'],
          [null, parseInt, parseInt, parseInt,
          parseInt, null, null, KiCadLibReader._parseWidth,
          KiCadLibReader._parseFillStyle])

        // TODO knowing that this needs to be a string makes me unhappy here
        shape.left = Math.min(shape.__kicad_startx, shape.__kicad_endx)
        shape.width = Math.abs(shape.__kicad_startx - shape.__kicad_endx).toString()
        shape.bottom = Math.min(shape.__kicad_starty, shape.__kicad_endy)
        shape.height = Math.abs(shape.__kicad_starty - shape.__kicad_endy).toString()
        break
      case 'C':
        // C posx posy radius unit convert thickness cc

        shape = this.factory.createEllipse()

        rd.readFieldsInto(shape, value,
          [null, 'cx', 'cy', 'radius',
          '__kicad_unit', '__kicad_convert', 'strokeWidth', 'fillColor'],
          [null, KiCadLibReader._parseLength, KiCadLibReader._parseLength, KiCadLibReader._parseLength,
          null, null, KiCadLibReader._parseWidth, KiCadLibReader._parseFillStyle])
        break
      case 'A':
        // A posx posy radius start end part convert thickness cc start_pointX start_pointY end_pointX end_pointY

        shape = this.factory.createArc()

        rd.readFieldsInto(shape, value,
          [null, 'x', 'y', 'radius',
          'startAngle', 'endAngle', '__kicad_unit', '__kicad_convert',
          'thickness', 'filled', 'startPointX', 'startPointY',
          'endPointX', 'endPointY'],
          [null, parseInt, parseInt, parseInt,
          rd.parseTenthDegreesToDegrees, rd.parseTenthDegreesToDegrees, null, null,
          parseInt, KiCadLibReader._parseFillStyle, parseInt, parseInt,
          parseInt, parseInt])
        break
      case 'T':
        // T orientation posx posy dimension unit convert Text

        shape = this.factory.createAnnotation()

        rd.readFieldsInto(shape, value,
          [null, 'orientation', 'x', 'y',
          'dimension', '__kicad_unit', '__kicad_convert', 'value'],
          [null, KiCadLibReader._parseTextOrientation, KiCadLibReader._parseLength, KiCadLibReader._parseLengths,
          parseInt, null, null, null])
        break
      case 'X':
        // X name number posx posy length orientation Snum Snom unit convert Etype [shape]
        // TODO the shape and electrical type are not handled yet

        let pin = this.factory.createPin()

        rd.readFieldsInto(pin, value,
          [null, 'name', 'number', 'x', 'y',
          'length', 'orientation', 'numberDimension', 'nameDimension',
          '__kicad_unit', '__kicad_convert', 'electricalType', 'shape'],
          [null, null, null, parseInt, parseInt,
          parseInt, KiCadLibReader._parsePinOrientation, parseInt, parseInt,
          null, null, null, null])

        shape = pin
        break
      default:
        throw Error('Unknown graphic definition: ' + value)
    }

    KiCadLibReader._validateUnitConvert(shape)

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
    return rd.parseOptions(value, { F: '#000000', f: '#000000', N: 'none' })
  }

  static _parseWidth (value) {
    // TODO convert width values
    return parseInt(value).toString()
  }

  static _parseLength (value) {
    return parseInt(value).toString()
  }

  /**
   * Check that the unit and convert values are supported by EasyEDA, or throw an Error
   * @param {object} shape The shape object to check
   */
  static _validateUnitConvert (shape) {
    if (shape.__kicad_unit !== '0' && shape.__kicad_unit !== '1') {
      throw new Error('Cannot convert shape with unit ' + shape.__kicad_unit + ' because EasyEDA does not support multiple units')
    }

    if (shape.__kicad_convert !== '0' && shape.__kicad_convert !== '1') {
      throw new Error('Cannot convert shape with convert ' + shape.__kicad_convert + ' because EasyEDA does not support DeMorgan units')
    }
  }

  _convertPoint (data, xName = 'x', yName = 'y') {
        // TODO need to figure out how to scale from KiCAD to EasyEDA, but I need
        // downloaded KiCAD to figure this out
    data[xName] = data[xName]
    data[yName] = data[yName]
  }
};

module.exports = KiCadLibReader
