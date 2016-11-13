'use strict'

const SimpleShape = require('./simple-shape')

/**
 * Arc drawing object
 */
class Arc extends SimpleShape
{
  constructor () {
    super()
    this.__type = 'arc'

    this.helperDots = ''
    this.pathString = ''
  }

// M startX, startY A rx, ry x-axis-rotation large-arc-flag sweep-flag endX endY
}

module.exports = Arc
