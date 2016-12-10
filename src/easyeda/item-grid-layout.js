'use strict'

const Point = require('../util/point')

/**
 * Strategy to automatically generate positions for items.
 * We use this to automatically position components when
 * importing from a library
 */
class ItemGridLayout {
  constructor () {
    this.xMax = 0
    this.yMax = 0
    this.margin = 10
  }

  /**
   * Layout the item (by setting the offset)
   */
  layout (item) {
    // For now, we only position vertically, there isn't actually a grid
    // So, we simply get the last y position, then add the margin, and offset
    // by that vertical distance
    const yTop = this.yMax + this.margin

    item.translate(0, yTop)

    // Get the new bounds since that will be our next position
    const bounds = item.bounds
    this.yMax = bounds.y + bounds.height

    // Update our maximum width
    this.xMax = Math.max(bounds.x + bounds.width, this.xMax)
  }

  bounds () {
    return {
      x: 0,
      y: 0,
      width: this.xMax,
      height: this.yMax
    }
  }
}

module.exports = ItemGridLayout
