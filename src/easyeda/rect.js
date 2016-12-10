'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Rect shape
 */
class Rect extends SimpleShape
{
  constructor () {
    super()
    // The category for the drawing object (determines which section)
    // in the parent this populates
    this.__type = 'rect'

    this.height = 50
    this.rx = 0
    this.ry = 0
    this.width = 60
    this.x = 0
    this.y = 0
  }

  set left (value) {
    this.x = value
  }

  set bottom (value) {
    this.y = value
  }

  translate (dx, dy) {
    this.x += dx
    this.y += dy
  }

  get bounds () {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  /**
   * @see SimpleShape._getStringProps()
   */
  _getStringProps () {
    return super._getStringProps().concat(['x', 'y', 'rx', 'ry', 'width', 'height'])
  }
}

module.exports = Rect
