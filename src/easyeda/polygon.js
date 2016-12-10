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

  translate (dx, dy) {
    this.pointArr.forEach(pt => {
      pt.x += dx
      pt.y += dy
    })
  }

  get bounds () {
    const xMin = Math.min.apply(null, this.pointArr.map(pt => pt.x))
    const yMin = Math.min.apply(null, this.pointArr.map(pt => pt.y))
    const xMax = Math.max.apply(null, this.pointArr.map(pt => pt.x))
    const yMax = Math.max.apply(null, this.pointArr.map(pt => pt.y))

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMax
    }
  }
}

module.exports = Polygon
