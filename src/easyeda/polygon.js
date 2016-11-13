'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Polygon shape
 */
class Polygon extends SimpleShape
{
  constructor () {
    super()
    // The category for the drawing object (determines which section)
    // in the parent this populates
    this.__type = 'polygon'

    // {x: 0, y:0}
    this.pointArr = []
  }
}

module.exports = Polygon
