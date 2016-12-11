'use strict'

const SimpleShape = require('./simple-shape')
const Point = require('../util/point')

const polarToCartesian = (center, radius, angleDegrees) => {
  var angleInRadians = (angleDegrees - 90) * Math.PI / 180.0

  return new Point(
    center.x + (radius * Math.cos(angleInRadians)),
    center.y + (radius * Math.sin(angleInRadians))
  )
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
    this.startAngle = 0
    this.endAngle = 0
  }

  translate (dx, dy) {
    this.center.translate(dx, dy)
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

  get bounds () {
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

  _startPoint () {
    return polarToCartesian(this.center, this.radius, this.startAngle)
  }

  _endPoint () {
    return polarToCartesian(this.center, this.radius, this.endAngle)
  }

  _toPathString () {
    const start = this._startPoint()
    const end = this._endPoint()

    const largeArcFlag = this.endAngle - this.startAngle <= 180 ? '0' : '1'

    // M startX, startY A rx, ry x-axis-rotation large-arc-flag sweep-flag endX endY
    const d = [
      'M', start.x, start.y,
      'A', this.radius, this.radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ')

    return d
  }
}

module.exports = Arc
