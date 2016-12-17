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

    // If we enable fill, then this is the value we set
    this.__visibleFillColor = '#000000'
    this.__visibleStrokeColor = '#000000'
  }

  applyTheme (theme) {
    this.__visibleFillColor = theme.defaultFill
    this.__visibleStrokeColor = theme.defaultStroke

    if (this.filled) {
      this.fillColor = this.__visibleFillColor
    }

    if (this.stroked) {
      this.strokeColor = this.__visibleStrokeColor
    }
  }

  get filled () {
    return this.fillColor !== 'none'
  }

  set filled (filled) {
    this.fillColor = filled ? this.__visibleFillColor : 'none'
  }

  get stroked () {
    return this.strokeColor !== 'none'
  }

  set stroked (stroked) {
    this.fillColor = stroked ? this.__visibleStrokeColor : 'none'
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
