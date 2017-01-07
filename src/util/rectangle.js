'use strict'

/**
 * Simple rectangle class.
 */
class Rectangle {
  static fromPoints (pt1, pt2) {
    const xMin = Math.min(pt1.x, pt2.x)
    const xMax = Math.max(pt1.x, pt2.x)

    const yMin = Math.min(pt1.y, pt2.y)
    const yMax = Math.max(pt1.y, pt2.y)

    return new Rectangle(xMin, yMin, xMax - xMin, yMax - yMin)
  }

  constructor (x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

module.exports = Rectangle
