'use strict'

/**
 * Backend to generate the EasyEDA JSON-compatible data structure
 */
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

module.exports = EasyEdaBackend
