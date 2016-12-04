'use strict'

const DrawingObject = require('./drawing-object')
const EasyEdaFactory = require('./easyeda-factory')
const GidGenerator = require('./gid-generator')

/**
 * Represents the EasyEDA schematic document - basically a schematic
 */
class Document extends DrawingObject {
  constructor () {
    super()

    // The basic unchangeable part of the schematic
    this.root = {
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

    this.components = []
  }

  _primitiveData () {
    return this.root
  }

  addComponent (component) {
    this.components.push(component)
  }
}

module.exports = Document
