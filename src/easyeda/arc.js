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

  translate (dx, dy) {
    // TODO
  }

  get bounds () {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  }

// M startX, startY A rx, ry x-axis-rotation large-arc-flag sweep-flag endX endY
}

module.exports = Arc
