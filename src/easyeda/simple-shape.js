'use strict'

const Color = require('../util/color')
const DrawingObject = require('./drawing-object')

/**
 * Defines a drawing object that has both fill and stroke
 */
class SimpleShape extends DrawingObject
{
  constructor () {
    super()

    this.fillColor = Color.makeNone()
    this.strokeColor = Color.makeBlack()
    this.strokeStyle = 0
    this.strokeWidth = 0
  }

  /**
   * Apply the color settings from the theme to this instance.
   * @param {object} theme The theme to apply to this instance
   */
  applyTheme (theme) {
    this.fillColor.applyTheme(theme.defaultFill)
    this.strokeColor.applyTheme(theme.defaultStroke)
  }

  /**
   * Is this shape filled?
   * @return {boolean} True if the fill color is not none, otherwise false.
   */
  get filled () {
    return !this.fillColor.isNone
  }

  /**
   * Set which type of fill color we are using for the shape. Can be none, foreground or background.
   *
   * @oaram {string} fillType The fill type identifier, one of Color.NONE, Color.FOREGROUND, Color.BACKGROUND
   */
  set fillType (fillType) {
    this.fillColor.selected = fillType
  }

  /**
   * Is this shape stroked (have non-none stroke)?
   * @return {boolean} True if the fill color is not none, otherwise false.
   */
  get stroked () {
    return !this.strokeColor.isNone
  }

  /**
   * Set which type of stroke color we are using for the shape. Can be none, foreground or background.
   *
   * @oaram {string} strokeType The stroke type identifier, one of Color.NONE, Color.FOREGROUND, Color.BACKGROUND
   */
  set strokeType (strokeType) {
    this.stroke.SELECTED = strokeType
  }

  /**
   * Get the names of attributes that need to be converted to strings
   * for EasyEDA format.
   *
   * @return {[string]} The names of the properties that need to be converted
   * to a string.
   */
  _getStringProps () {
    return ['strokeWidth', 'fillColor', 'strokeColor']
  }
}

module.exports = SimpleShape
