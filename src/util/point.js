'use strict'

const degrees2Rad = (degrees) => {
  return degrees * Math.PI / 180.0
}

/**
 * Simple point class. Yes there are NPM libraries, but this is a lightweight for our purposes.
 */
class Point {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  translate (dx, dy) {
    this.x += dx
    this.y += dy
    return this
  }

  /**
   * Rotate the point by the specified angle in degrees
   *
   * @return {Point} This point, rotated
   */
  rotateDegrees (angleDegrees, center = Point(0, 0)) {
    let angleRad = degrees2Rad(angleDegrees)

    let cosAngle = Math.cos(angleRad)
    let sinAngle = Math.sin(angleRad)

    let dx = this.x - center.x
    let dy = this.y - center.y

    this.x = Math.round(cosAngle * dx - sinAngle * dy + center.x)
    this.y = Math.round(sinAngle * dx + cosAngle * dy + center.y)

    return this
  }

  /**
   * Calculate the distance between the two points
   * @return {number} The distance between the two points
   */
  distance (other) {
    let dx = (this.x - other.x)
    let dy = (this.y - other.y)
    return Math.round(Math.sqrt(dx * dx + dy * dy))
  }

  sub (other) {
    const dx = this.x - this.other.x
    const dy = this.y - this.other.y
    return {dx, dy}
  }
}

module.exports = Point
