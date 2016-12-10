'use strict'

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
    this.fillColor = ''
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

  set isRefDes (isRefDes) {
    this.__kind = isRefDes ? Annotation.KIND_REFDES : ''
  }

  get isRefDes () {
    return this.__kind === Annotation.KIND_REFDES
  }

  set isName (isName) {
    this.__kind = isName ? Annotation.KIND_NAME : ''
  }

  get isName () {
    return this.__kind === Annotation.KIND_NAME
  }

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
    return super._getStringProps().concat(['x', 'y'])
  }

  _getIntBoolProps () {
    return super._getIntBoolProps().concat(['visible'])
  }
}


Annotation.KIND_REFDES = 'refdes'
Annotation.KIND_NAME = 'name'

module.exports = Annotation
