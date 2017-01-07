'use strict'

const Color = require('../util/color')
const DrawingObject = require('./drawing-object')

/**
 * Annotation drawing object
 */
class Annotation extends DrawingObject
{
  constructor () {
    super()
    this.__type = 'annotation'
    this.__kind = null

    this.dominantBaseline = 'none'
    this.fillColor = Color.makeBlack()
    this.fontFamily = ''
    this.fontSize = '9pt'
    this.fontStyle = ''
    this.fontWeight = ''
    this.mark = 'L'
    this.rotation = 0
    this.string = ''
    this.textAnchor = 'start'
    this.type = 'comment'
    this.visible = true
    this.x = 0
    this.y = 0
  }

  /**
   * Apply the color settings from the theme to this instance
   * @param {object} theme The theme to apply to this instance
   */
  applyTheme (theme) {
    this.fillColor = theme.defaultText
  }

  set isRefDes (isRefDes) {
    this.__kind = isRefDes ? Annotation.KIND_REFDES : ''
  }

  /**
   * Is this annotation the reference designator of a component? For example, R1
   * @return {boolean} True if it is the reference designator, otherwise false
   */
  get isRefDes () {
    return this.__kind === Annotation.KIND_REFDES
  }

  set isName (isName) {
    this.__kind = isName ? Annotation.KIND_NAME : ''
  }

  /**
   * Is this annotation the name of a component? For example, UA741
   * @return {boolean} True if it is the name, otherwise false
   */
  get isName () {
    return this.__kind === Annotation.KIND_NAME
  }

  /**
   * Move this annotation by the specified distance in the x and y directions
   * @param {number} dx The x distance to Move
   * @param {number} dy The y distance to move
   */
  translate (dx, dy) {
    this.x += dx
    this.y += dy
  }

  get bounds () {
    // TODO this is definitely wrong, but ok for now
    return {
      x: this.x,
      y: this.y,
      width: 0,
      height: 0
    }
  }

  /**
   * @see SimpleShape._getStringProps()
   */
  _getStringProps () {
    return super._getStringProps().concat(['x', 'y', 'fillColor'])
  }

  /**
   * @see SimpleShape._getIntBoolProps()
   */
  _getIntBoolProps () {
    return super._getIntBoolProps().concat(['visible'])
  }
}

Annotation.KIND_REFDES = 'refdes'
Annotation.KIND_NAME = 'name'

module.exports = Annotation
