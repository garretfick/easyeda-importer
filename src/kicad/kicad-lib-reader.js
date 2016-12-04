'use strict'

const rd = require('./kicad-base-reader')
const Pin = require('../easyeda/pin')

/**
 * Reader for the Kicad schematic library (LIB) format.
 *
 * This is normally constructed by the KiCadReader
 */
class KiCadLibReader {
  /**
   * Construct an instance of the library reader and read the library into the specified
   * context.
   *
   * @param {string} librarySource The library data to read in
   * @param {string} name The name of the library (since KiCAD doesn't internally know it)
   * @param {ConvertContext} context The conversion context (destination for all data)
   */
  static readToContext (librarySource, name, context) {
    const reader = new KiCadLibReader(context.factory)
    const library = reader.read(librarySource)
    context.addCompLibrary(library, name)
    context.mergeErrors(reader.errors)
  }

  /**
   * Create the KiCadLibReader
   *
   * @param {EasyEdaFactory} factory Factory to create required objects
   */
  constructor (factory) {
    this.library = null
    this.factory = factory
    this.errors = []
  }

  /**
   * Read in the KiCad library into an internal format that we can later
   * convert to EasyEDA format
   *
   * @param {string} source The read library data
   */
  read (source) {
    this.library = this.factory.createCompLibrary()
    this._readLibrary(source)
    return this.library
  }

  /**
   * Evil function, but useful for testing for now
   */
  _readLines (libraryText) {
    return libraryText.split('\n').map((line) => {
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
  _readLibrary (libraryText) {
    let libraryData = this._readLines(libraryText)

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
    // Wrap up the entire read into a try catch. There are some components we cannot
    // read and these throw exceptions. If we encounter those, then we don't import
    // that compoenent, but we do try to import others
    let schlibDef = this.factory.createCompDef()

    try {
      rd.readFieldsInto(schlibDef, libraryData[index++], [null, 'name', 'refDesPrefix', null,
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
        // There are several kinds of fields, depending on the Fx value. The KiCAD representation
        // is essentially an annotation, so start with that
        const annotation = this._readLibraryField(libraryData[index], schlibDef)
        switch (annotation.__kicad_field) {
          case 0:
            // Reference designator, e.g. U1
            schlibDef.setRefDesAnnotation(annotation)
            break
          case 1:
            // Value, e.g. name of the compoent UA741
            schlibDef.setNameAnnotation(annotation)
            break
          default:
            // Others are all just regular annotations
            schlibDef.graphics.push(annotation)
            break
        }
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
        // Move to the first line in the draw section
        index++

        // Read the inner draw section
        while (!libraryData[index].startsWith('ENDDRAW')) {
          schlibDef.graphics.push(this._readGraphic(libraryData[index++]))
        }
      }
    } catch (e) {
      // Caught an error, so don't read in this component
      this.errors.push(this._makeError(schlibDef, e, index))
      // Since we cannot import it, set to null so we don't import it
      schlibDef = null
    } finally {
      // Read until the end of the component, do this whether we
      // had an error or just got to the end of the component definition
      index = rd.indexOfAny(['ENDDEF'], libraryData, index)
    }

    if (schlibDef) {
      // Add to ourselves as the parsed data
      if (this.library.hasCompDef(schlibDef.name)) {
        throw Error('Library has more than one definition for ' + schlibDef.name)
      }
      this.library.addCompDef(schlibDef)
    }

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
    let item = this.factory.createAnnotation()

    // parseInt stops at the first non-integer character, so the spaces at the end are ok
    item.__kicad_field = parseInt(value.substr(1))

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
    let propertiesValue = startName > -1 ? value.substr(endText + 1, startName - endText - 1) : value.substr(endText + 1)

    // Read the part of the value after the string identifier. We trim the properties value
    // since we really don't know how many extra spaces it might have
    // EasyEDA doesn't support text orientation, so we just ignore that for now
    rd.readFieldsInto(item, propertiesValue.trim(),
      ['x', 'y', 'dimension', '__kicad_orientation', 'visible', 'textAnchor', '__kicad_format'],
      [KiCadLibReader._parseXPos, KiCadLibReader._parseYPos, parseInt, null, KiCadLibReader._parseVisibility, KiCadLibReader._parseTextAnchor, null])

    // For text items, the valign, bold and italic are all packed into the same item
    // (and they are optional). If they exist, then set them
    if (item.__kicad_format.length === 3) {
      item.fontStyle = rd.parseOptions(item.__kicad_format[1], { I: 'italic', N: '' })
      item.fontWeight = rd.parseOptions(item.__kicad_format[2], { B: 'bold', N: '' })
    }

    if (item.__kicad_orientation !== 'H') {
      this._makeWarning(schLibDef, 'Unsupported text orientation for attribute')
    }

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

        shape = this.factory.createPolyline()

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
            x: KiCadLibReader._parseXPos(fields[valIndex]),
            y: KiCadLibReader._parseYPos(fields[valIndex + 1])
          })
        }

        // Set the points in our shape
        shape.pointArr = points

        // Finally, the last item is the fill
        shape.fillColor = KiCadLibReader._parseFillStyle(fields[fields.length - 1])

        // If we find that this is closed, then convert it to a polygon
        if (shape.isClosed()) {
          let temp = shape
          shape = this.factory.createPolygon()
          shape.initFromPolyline(temp)
        }

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
          [null, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos, KiCadLibReader._parseXPos,
          KiCadLibReader._parseYPos, null, null, KiCadLibReader._parseWidth,
          KiCadLibReader._parseFillStyle])

        // TODO knowing that this needs to be a string makes me unhappy here
        shape.x = Math.min(shape.__kicad_startx, shape.__kicad_endx)
        shape.width = Math.abs(shape.__kicad_startx - shape.__kicad_endx)
        shape.y = Math.min(shape.__kicad_starty, shape.__kicad_endy)
        shape.height = Math.abs(shape.__kicad_starty - shape.__kicad_endy)
        break
      case 'C':
        // C posx posy radius unit convert thickness cc

        shape = this.factory.createEllipse()

        rd.readFieldsInto(shape, value,
          [null, 'cx', 'cy', 'radius',
          '__kicad_unit', '__kicad_convert', 'strokeWidth', 'fillColor'],
          [null, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos, KiCadLibReader._parseLength,
          null, null, KiCadLibReader._parseWidth, KiCadLibReader._parseFillStyle])
        break
      case 'A':
        // A posx posy radius start end part convert thickness cc start_pointX start_pointY end_pointX end_pointY

        shape = this.factory.createArc()

        // TODO this is all wrong

        rd.readFieldsInto(shape, value,
          [null, 'x', 'y', 'radius',
          'startAngle', 'endAngle', '__kicad_unit', '__kicad_convert',
          'thickness', 'filled', 'startPointX', 'startPointY',
          'endPointX', 'endPointY'],
          [null, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos, KiCadLibReader._parseLength,
          rd.parseTenthDegreesToDegrees, rd.parseTenthDegreesToDegrees, null, null,
          KiCadLibReader._parseLength, KiCadLibReader._parseFillStyle, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos,
          KiCadLibReader._parseXPos, KiCadLibReader._parseYPos])
        break
      case 'T':
        // T orientation posx posy dimension unit convert Text

        shape = this.factory.createAnnotation()

        rd.readFieldsInto(shape, value,
          [null, 'orientation', 'x', 'y',
          'dimension', '__kicad_unit', '__kicad_convert', 'value'],
          [null, KiCadLibReader._parseTextOrientation, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos,
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
          [null, null, null, KiCadLibReader._parseXPos, KiCadLibReader._parseYPos,
          KiCadLibReader._parseLength, KiCadLibReader._parsePinOrientation, parseInt, parseInt,
          null, null, KiCadLibReader._parseElecType, null])

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
    // This seems wrong, but as far as I can tell, lowercase f means non-filled
    return rd.parseOptions(value, { F: '#000000', f: 'none', N: 'none' })
  }

  static _parseWidth (value) {
    // TODO convert width values
    return parseInt(value) / KiCadLibReader.SCALE_FACTOR
  }

  static _parseLength (value) {
    return parseInt(value) / KiCadLibReader.SCALE_FACTOR
  }

  static _parseXPos (value) {
    return KiCadLibReader._parseLength(value)
  }

  static _parseYPos (value) {
    return -1 * KiCadLibReader._parseLength(value)
  }

  /**
   * Read visibility of fields (Fx values)
   */
  static _parseVisibility (value) {
    return rd.parseOptions(value, { V: true, I: false })
  }

  /**
   * Read text anchor of fields (Fx values)
   */
  static _parseTextAnchor (value) {
    return rd.parseOptions(value, { L: 'start', R: 'middle', C: 'end' })
  }

  /**
   * Parsing the pin orientiation means reading in the data, and then applying the appropriate
   * transform for the pin object. We do this by returning the appropriate rotation
   * and then the name of the property we are setting knows to rotate about the origin of the pin.
   */
  static _parsePinOrientation (value) {
    // The values here are U, D, R, L, which we translate into
    // rotations
    let rotation = 0

    switch (value) {
      case 'U':
        rotation = 90
        break
      case 'D':
        rotation = 270
        break
      case 'R':
        rotation = 0
        break
      case 'L':
        rotation = 180
        break
      default:
        throw new Error('Cannot convert pin with unexpected orientiation ' + value)
    }

    return rotation
  }

  static _parseElecType (value) {
    switch (value) {
      case 'I':
        return Pin.ELEC_TYPE_INPUT
      case 'O':
        return Pin.ELEC_TYPE_OUTPUT
      case 'B':
        return Pin.ELEC_TYPE_BIDIR
      case 'U':
        return Pin.ELEC_TYPE_UNDEFINED
      default:
        // TODO give a message about unsupported type
        return Pin.ELEC_TYPE_UNDEFINED
    }
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

  /**
   * The y direction is reversed between KiCAD and EasyEDA for a library component
   */
  _convertPoint (data, xName = 'x', yName = 'y') {
    data[xName] = data[xName]
    data[yName] = -1 * data[yName]
  }

  _makeError (libDef, error, index) {
    let message = ''
    if (libDef.name) {
      message += 'Unable to read the def ' + libDef.name + '.'
    }

    message += error.message

    if (index) {
      message += ' Possibly around line ' + index
    }

    return new Error(message)
  }

  _makeWarning (libDef, error, index) {
    let message = ''
    if (libDef.name) {
      message += 'Unable to read the def ' + libDef.name + '.'
    }

    message += error.message

    if (index) {
      message += ' Possibly around line ' + index
    }

    return new Error(message)
  }
}

KiCadLibReader.SCALE_FACTOR = 10

module.exports = KiCadLibReader
