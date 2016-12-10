'use strict'

const Point = require('../util/point')

/**
 * Strategy to automatically generate positions for items.
 * We use this to automatically position components when
 * importing from a library
 */
class ItemGridLayout {
  constructor () { 
    // These are the next positions
    this.yPos = 0
    this.margin = 50
    this.grid = 10
  }

  /**
   * Layout the item (by setting the offset)
   */
  layout (item) {
    // Where is the item right now?
    const bounds = item.bounds

    // The bounds might be fractional, and we want to stay on grid
    // to snap this to our grid
    const boundsInflated = this._inflateToGrid(bounds)

    // We want how far do we want to move it?
    // We are not adjusting x
    // For the y, we position to the y position
    const dy = this.yPos - boundsInflated.y

    // Move the shape
    item.translate(0, dy)

    // Now where do we want the next item to be?
    this.yPos = this.yPos + boundsInflated.height + this.margin

    // And for bookkeeping purposes, how wide are we now?
    this.xMax = Math.max(this.xMax, boundsInflated.x + boundsInflated.width)
  }

  /**
   * Snap the bounds to the grid that is larger that our area
   */
  _inflateToGrid (bounds) {
    let { x, y, width, height } = bounds

    // Extract the limits since we need to adjust those
    let left = x
    let bottom = y
    let right = x + width
    let top = y + height

    // Convert the distances so that 1 grid distance is an integer value
    // and snap the values to the next largest
    left = Math.floor(left / this.grid) * this.grid
    bottom = Math.floor(bottom / this.grid) * this.grid
    // This isn't quite right because we don't adjust for floor on x/y
    right = Math.ceil(right / this.grid) * this.grid
    top = Math.ceil(top / this.grid) * this.grid

    // Reassemble the bounds
    return { x: left, y: bottom, width: right - left, height: top - bottom }
  }

  get bounds () {
    return {
      x: 0,
      y: 0,
      width: this.xMax,
      height: this.yMax
    }
  }
}

module.exports = ItemGridLayout
