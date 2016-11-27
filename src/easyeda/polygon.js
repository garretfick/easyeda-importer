'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Polygon shape. A polygon is inherently a closed shape, whereas a polyline is open.
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

  /**
   * Copy this from a polyline.
   */
  initFromPolyline (polyline) {
    Object.assign(this, polyline)
    this.__type = 'polygon'
  }
}

module.exports = Polygon
