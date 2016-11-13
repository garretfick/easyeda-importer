'use strict'

const Pin = require('./pin')
const Polygon = require('./polygon')
const SchLib = require('./schlib')

/**
 * Factory to create EasyEDA JSON objects
 */
class EasyEdaFactory
{
  createPin () {
    return new Pin()
  }

  createPolygon () {
    return new Polygon()
  }

  createComponent () {
    return new SchLib()
  }

  createSchematic () {
    return {
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
}

module.exports = EasyEdaFactory
