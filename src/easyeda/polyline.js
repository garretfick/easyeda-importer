'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Polyline shape. A polyline is a series of lines (not inherently closed)
 */
class Polygon extends SimpleShape
{
  constructor () {
    super()
    // The category for the drawing object (determines which section)
    // in the parent this populates
    this.__type = 'polyline'

    // {x: 0, y:0}
    this.pointArr = []
  }

  /**
   * Is this polyline closed? That is, does the start point equal the end point?
   *
   * @return {boolean} True if the shape is closed, otherwise false.
   */
  isClosed () {
    let start = this.pointArr[0]
    let end = this.pointArr[this.pointArr.length - 1]
    return (start.x === end.x && start.y === end.y)
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
