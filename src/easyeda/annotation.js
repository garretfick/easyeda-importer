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
    this.visible = 1
    this.x = '0'
    this.y = '0'
  }
}

module.exports = Annotation
