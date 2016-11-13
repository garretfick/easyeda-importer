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
    this.rx = ''
    this.ry = ''
    this.width = '60'
    this.x = '180'
    this.y = '240'
  }

  set left (value) {
    this.x = value.toString()
  }

  set bottom (value) {
    this.y = value.toString()
  }
}

module.exports = Rect
