'use strict'

const DrawingObject = require('./drawing-object')

/**
 * Defines a drawing object that has both fill and stroke
 */
class SimpleShape extends DrawingObject
{
  constructor () {
    super()

    this.fillColor = 'none'
    this.strokeColor = '#000000'
    this.strokeStyle = 0
    this.strokeWidth = '1'
  }

  isFilled (filled) {
    this.fillColor = filled ? '#000000' : 'none'
  }
}

module.exports = SimpleShape
