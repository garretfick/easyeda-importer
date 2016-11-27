'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Ellipse shape
 */
class Ellipse extends SimpleShape
{
  constructor () {
    super()
    // The category for the drawing object (determines which section)
    // in the parent this populates
    this.__type = 'ellipse'

    this.cx = 0
    this.cy = 0
    this.fillColor = 'none'
    this.rx = 0
    this.ry = 0
    this.strokeColor = '#000000'
    this.strokeStyle = 0
    this.strokeWidth = 0
  }

  /**
   * Set the radius of the ellipse. This sets the x and y radius to be
   * equal (essentially making this a circle)
   * @param {number} value The new radius
   */
  set radius (value) {
    this.rx = value
    this.ry = value
  }

  translate (dx, dy) {
    this.cx += dx
    this.cy += dy
  }

  /**
   * @see SimpleShape._getStringProps()
   */
  _getStringProps () {
    return super._getStringProps().concat(['cx', 'cy', 'rx', 'ry', 'height'])
  }
}

module.exports = Ellipse
