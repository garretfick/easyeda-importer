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
    this.strokeWidth = 0
  }

  isFilled (filled) {
    this.fillColor = filled ? '#000000' : 'none'
  }

  /**
   * Get the names of attributes that need to be converted to strings
   * for EasyEDA format.
   *
   * @return {[string]} The names of the properties that need to be converted
   * to a string.
   */
  _getStringProps () {
    return ['strokeWidth']
  }
}

module.exports = SimpleShape
