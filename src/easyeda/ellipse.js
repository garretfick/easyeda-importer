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
    this.rx = 0
    this.ry = 0
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

  /**
   * Offset the ellipse by the x and y distance
   *
   * @param {number} dx The x distance to offset
   * @param {number} dy The y distance to offset
   */
  translate (dx, dy) {
    this.cx += dx
    this.cy += dy
  }

  /**
   * Get the bounds of this rectangle
   */
  get bounds () {
    return {
      x: this.cx - this.rx,
      y: this.cy - this.ry,
      width: this.rx,
      height: this.ry
    }
  }

  /**
   * @see SimpleShape._getStringProps()
   */
  _getStringProps () {
    return super._getStringProps().concat(['cx', 'cy', 'rx', 'ry', 'height'])
  }
}

module.exports = Ellipse
