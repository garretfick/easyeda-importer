'use strict'

/**
 * Backend to generate the EasyEDA JSON-compatible data structure
 */
class EasyEdaBackend {
  constructor () {
    this.root = null
    // Maintain a stack of the current context. Normally this is either 1 or 2 items, corresponding
    // to either a schematic or a schlib in the schematic
    this.contexts = []
    this.nextObjectIndex = 1
  }

  /**
   * Push onto the context stack. If this is the first object, then this becomes the root
   * context.
   */
  _pushContext (context) {
    if (this.root === null) {
      this.root = context
    }
    this.contexts.push(context)
  }

  _popContext () {
    return this.contexts.pop()
  }

  _getContext () {
    return this.contexts.length > 0 ? this.contexts[this.contexts.length - 1] : null
  }

  /**
   * Create the schematic container that owns all of the objects in the schematic.
   * This is mostly just boiler place determined by outputting the JSON from EasyEDA
   */
  beginSchematicContext () {
    let schematic = {
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

    this._pushContext(schematic)
  }

  /**
   * End the schematic context, removing it from the context stack
   */
  endSchematicContext () {
    this._popContext()
  }

  /**
   * Start a context that can hold a library of schlib objects. Normally this is used
   * when reading a library before reading the containing schematic
   */
  beginSchLibContainerContext () {
    let schlibContainer = {}
    this._pushContext(schlibContainer)
  }

  endSchLibContainerContext () {
    this._popContext()
  }

  /**
   * Start a context for an individual schlib object (eg. a library component)
   */
  beginSchLibContext () {
    // A schlib context can never be the root context
    let parentContext = this._getContext()
    if (!parentContext) {
      throw Error('schlib context cannot be the root context. It must have a parent')
    }

    let schlib = {}
    this._pushContext(schlib)
  }

  endSchLibContext () {
    let schlibContext = this._popContext()

    // Add it to the owning parent, now that we know the name
    // TODO I'm sure this name is wrong, just want the tests to pass
    if (!schlibContext.hasOwnProperty('name')) {
      throw Error('Context does not have a name. Cannot add this schlib item')
    }

    let parentContext = this._getContext()
    parentContext[schlibContext['name']] = schlibContext
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
    let context = this._getContext()

    if (!context.hasOwnProperty(objectType)) {
      context[objectType] = {}
    }

        // Add the object
    context[objectType][identifier] = object

        // Then append the objec to the list of ordered objects
    context.itemOrder.push(identifier)
  }

  _nextIdentifier () {
    // Create the identifier, then increment to the next index
    let identifier = 'gg' + this.nextObjectIndex++
    return identifier
  }

  getSchematic () {
    return this.root
  }

  getRoot () {
    return this.root
  }
}

module.exports = EasyEdaBackend
