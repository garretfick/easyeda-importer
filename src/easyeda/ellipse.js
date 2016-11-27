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

    this.cx = '0'
    this.cy = '0'
    this.fillColor = 'none'
    this.rx = ''
    this.ry = ''
    this.strokeColor = '#000000'
    this.strokeStyle = 0
    this.strokeWidth = '1'
  }

  /**
   * Set the radius of the ellipse. This sets the x and y radius to be
   * equal (essentially making this a circle)
   * @param {number} value The new radius
   */
  set radius (value) {
    this.rx = value.toString()
    this.ry = value.toString()
  }
}

module.exports = Ellipse
