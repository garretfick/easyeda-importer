'use strict'

const SimpleShape = require('./simple-shape')
const Point = require('../util/point')

const degrees2Rad = (degrees) => {
  return degrees * Math.PI / 180.0
}

const rad2Degrees = (rad) => {
  return rad * 180 / Math.PI
}

/**
 * KiCAD normalize angle1 void NORMALIZE_ANGLE_POS (T & Angle)
 * @param {number} angle The angle to normalize
 */
const normalizeAngle = (angle) => {
  while (angle < 0) {
    angle += 360.0
  }
  while (angle >= 360.0) {
    angle -= 360.0
  }
  return angle
}

/**
 * KiCAD round static int KiROUND (double v)
 * @param {number} val The number to round
 */
const round = (val) => {
  // Doing this in decidegrees is important or for some cases
  // we would calculate the wrong angle
  val *= 10
  return Math.trunc(val < 0 ? val - 0.5 : val + 0.5) / 10
}

/**
 * Arc drawing object
 */
class Arc extends SimpleShape
{
  constructor () {
    super()
    this.__type = 'arc'

    this.pathString = ''

    this.center = new Point()
    this.radius = 10
    // Angles, in degrees
    this.startAngle = 0
    this.endAngle = 0

    this.start = new Point()
    this.end = new Point()
  }

  translate (dx, dy) {
    this.center.translate(dx, dy)
    this.start.translate(dx, dy)
    this.end.translate(dx, dy)
  }

  set cx (x) {
    this.center.x = x
  }

  get cx () {
    return this.center.x
  }

  set cy (y) {
    this.center.y = y
  }

  get cy () {
    return this.center.y
  }

  set startx (x) {
    this.start.x = x
  }

  set starty (y) {
    this.start.y = y
  }

  set endx (x) {
    this.end.x = x
  }

  set endy (y) {
    this.end.y = y
  }

  get bounds () {
    // TODO this is definiteluy wrong
    return {
      x: this.center.x,
      y: this.center.y,
      width: 0,
      height: 0
    }
  }

  _primitiveData () {
    const fillColor = this.fillColor
    const strokeColor = this.strokeColor
    const strokeStyle = this.strokeStyle
    const strokeWidth = this.strokeWidth
    const pathString = this._toPathString()
    return {
      fillColor,
      strokeColor,
      strokeStyle,
      strokeWidth,
      pathString,
      helplerDots: ''
    }
  }

  _toPathString () {
    const start = this.start
    const end = this.end

    const sweepFlag = this._mapAngles(this.startAngle, this.endAngle) ? '0' : '1'

    // M startX, startY A rx, ry x-axis-rotation large-arc-flag sweep-flag endX endY
    const d = [
      'M', start.x, start.y,
      'A', this.radius, this.radius, 0, 0, sweepFlag, end.x, end.y
    ].join(' ')

    return d
  }

  /**
   * Are the angles such that they should be swapped? From KiCAD transform class
   * bool TRANSFORM::MapAngles (int * aAngle1, int * aAngle2) const
   *
   * @param {number} angle1 The first angle
   * @param {number} angle2 The second angle
   * @return {bool} True if the angles should be swapped
   */
  _mapAngles (angle1, angle2) {
    // These are from the default contructor for TRANSFORM
    const x1 = 1
    const y1 = 0
    const x2 = 0
    const y2 = -1
    let t = 0
    let x = 0
    let y = 0

    let swap = false

    const delta = angle2 - angle1
    if (delta >= 180) {
      angle1 -= 0.1
      angle2 += 0.1
    }

    x = Math.cos(degrees2Rad(angle1))
    y = Math.sin(degrees2Rad(angle1))
    t = x * x1 + y * y1
    y = x * x2 + y * y2
    x = t
    angle1 = round(rad2Degrees(Math.atan2(y, x)))

    x = Math.cos(degrees2Rad(angle2))
    y = Math.sin(degrees2Rad(angle2))
    t = x * x1 + y * y1
    y = x * x2 + y * y2
    x = t
    angle2 = round(rad2Degrees(Math.atan2(y, x)))

    angle1 = normalizeAngle(angle1)
    angle2 = normalizeAngle(angle2)

    if (angle2 < angle1) {
      angle2 += 360
    }

    // There is a small difference with > in KiCAD versus >= here
    // Not sure why it is different - maybe because KiCAD is in decidegrees
    if (angle2 - angle1 > 180) {
      // Need to swap the two angles
      // (omitting the swap since we only care about the swap value)
      swap = true
    }

    return swap
  }
}

module.exports = Arc
