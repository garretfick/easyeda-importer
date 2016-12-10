'use strict'

const SimpleShape = require('./simple-shape')
const Point = require('../util/point')

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

// M startX, startY A rx, ry x-axis-rotation large-arc-flag sweep-flag endX endY
}

module.exports = Arc



/*function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}*/
