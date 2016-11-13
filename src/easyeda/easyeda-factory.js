'use strict'

const Annotation = require('./annotation')
const Arc = require('./arc')
const Ellipse = require('./ellipse')
const Rect = require('./rect')
const Pin = require('./pin')
const Polygon = require('./polygon')
const SchLib = require('./schlib')

/**
 * Factory to create EasyEDA JSON objects
 */
class EasyEdaFactory
{
  /**
   * Create a pin drawing object
   * @return {Pin} The created pin
   */
  createPin () {
    return new Pin()
  }

  /**
   * Create a rectangle drawing object
   * @return {Rect} The created rectangle
   */
  createRect () {
    return new Rect()
  }

  /**
   * Create a polygon drawing object
   * @return {Polygon} The created polygon
   */
  createPolygon () {
    return new Polygon()
  }

  /**
   * Create a new ellipse drawing object
   * @return {Ellipse} The created ellipse
   */
  createEllipse () {
    return new Ellipse()
  }

  /**
   * Create a new arc drawing object
   * @return {Arc} The created arc
   */
  createArc () {
    return new Arc()
  }

  /**
   * Create a new text drawing object
   * @return {Annotation} The created text
   */
  createAnnotation () {
    return new Annotation()
  }

  /**
   * Create a component instance (that is, an instance that lives on a schematic)
   * @return {SchLib} The created component instance
   */
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
