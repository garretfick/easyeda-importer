
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

    this.x = Math.round(cosAngle * (this.x - center.x) - sinAngle * (this.y - center.y) + center.x)
    this.y = Math.round(sinAngle * (this.x - center.x) + cosAngle * (this.y - center.y) + center.y)

    return this
  }
}

module.exports = Point
