'use strict'

const DrawingObject = require('./drawing-object')

/**
 * Polygon shape
 */
class Polygon extends DrawingObject
{
  constructor () {
    super()
    // The category for the drawing object (determines which section)
    // in the parent this populates
    this.__type = 'polygon'

    this.fillColor = 'none'
    // {x: 0, y:0}
    this.pointArr = []
    this.strokeColor = '#000000'
    this.strokeStyle = 0
    this.strokeWidth = 1
  }
}

module.exports = Polygon
