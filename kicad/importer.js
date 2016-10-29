const fs = require('fs')

class EasyEdaBackend {
  construct () {
    this.schematic = null
    this.nextObjectIndex = 1
  }

    /**
     * Create the schematic container that owns all of the objects in the schematic.
     * This is mostly just boiler place determined by outputting the JSON from EasyEDA
     */
  initializeSchematic () {
    this.schematic = {
      BBox: {
        height: 310,
        width: 156.4,
        x: 83.6,
        y: -10
      },
      canvas: {
        altSnapSize: '5',
        backGround: '#FFFFFF',
        canvasHeight: 1000,
        canvasWidth: 1000,
        gridColor: '#CCCCCC',
        gridSize: '10',
        gridStyle: 'line',
        gridVisible: 'yes',
        originX: 0,
        originY: 0,
        snapSize: '10',
        unit: 'pixel',
        viewHeight: 1000,
        viewWidth: 1000
      },
      head: {
        c_para: 'Prefix Start 1',
        c_spiceCmd: null,
        docType: '1',
        importFlag: undefined,
        portOfADImportHack: '',
        spiceConfigure: '',
        transformList: ''
      },
      itemOrder: []
    }
  }

    /**
     * Add a rectangle to the current context
     *
     *
     */
  rect () {
    let identifier = this._nextIdentifier()
    let objectData = {
      fillColor: 'none',
      gId: identifier,
      height: 50,
      rx: '',
      ry: '',
      strokeColor: '#000000',
      strokeStyle: 0,
      strokeWidth: '1',
      width: '60',
      x: '180',
      y: '240'
    }

    this._addObject(objectData, identifier, 'rect')

    return this
  }

  text (value, xPos, yPos) {
    let identifier = this._nextIdentifier()

    let objectData = {
      dominantBaseline: 'none',
      fillColor: '',
      fontFamily: '',
      fontSize: '9pt',
      fontStyle: '',
      fontWeight: '',
      gId: identifier,
      mark: 'L',
      rotation: 0,
      string: value,
      textAnchor: 'start',
      type: 'comment',
      visible: 1,
      x: xPos,
      y: yPos
    }

    this._addObject(objectData, identifier, 'annotation')

    return this
  }

  _addObject (object, identifier, objectType) {
        // Make sure the section for this type exists
    if (!this.schematic.hasOwnProperty(objectType)) {
      this.schematic[objectType] = {}
    }

        // Add the object
    this.schematic[objectType][identifier] = object

        // Then append the objec to the list of ordered objects
    this.schematic.itemOrder.push(identifier)
  }

  _nextIdentifier () {
    let identifier = 'gg3' + this.nextObjectIndex
    this.nextObjectIndex += 1
    return identifier
  }

  getSchematic () {
    return this.schematic
  }
}

class KiCadReader
{
  constructor () {
    this.backend = null
    this.schematics = []
    this.schematicLibs = []
  }

  addLibrarySource () {

  }

  addSchematicSource (source) {
    this.schematics.push(source)
  }

    /**
     * Convert the schematic to EasyEDA format using the EasyEDA backend
     * to generate the objects
     */
  convert (backend) {
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
      let schematicData = fs.readFileSync(schematic, 'utf8').split('\n').map((line) => {
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
  _readFieldsInto (targetObject, line, fieldIdentifiers, fieldTypeConverters = null) {
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

// Create the backend to generate EasyEDA schematic
let backend = new EasyEdaBackend()
backend.initializeSchematic()

let reader = new KiCadReader()
reader.addSchematicSource('D:/Dev/easyeda-importer/kicad/test/keyboard.sch')
reader.convert(backend)

// TODO remove this
backend.rect()

let schematicData = backend.getSchematic()

// console.log(schematicData)

// api('applySource', {source: schematicData, createNew: true})
