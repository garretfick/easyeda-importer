'use strict'

const DrawingObject = require('./drawing-object')
const SVGPathData = require('svg-pathdata')

/**
 * Schematic pin. Our initial position of the pin is at (0, 0) pointing to the right
 * and ending at (10, 0). That is, it would be on the right side of the component, and
 * you would connect a wire at (10, 0).
 *
 * Important to note that locations for the pin are absolute coordinates, they are
 * not relative to the owing symbol.
 */
class Pin extends DrawingObject
{
  constructor () {
    super()
    this.__type = 'pin'

    // Our current anchor position (where it connects to the body of the symbol)
    // This is not the point where you connect a wire. Keep track of this
    // as we manipulte the pin so we know where we are at all times
    this.anchorX = 0
    this.anchorY = 0

    this.data = {
      clock: {
        pathString: new SVGPathData('M 10 -3 L 7 0 L 10 3'),
        visible: 0
      },
      configure: {
        display: 'show',
        electric: '0',
        // gId: '',
        rotation: '0',
        spicePin: '1',
        x: 13,
        y: 0
      },
      dot: {
        visible: 0,
        x: 13,
        y: 0
      },
      name: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'start',
        visible: 1,
        x: -4,
        y: 0
      },
      num: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'end',
        visible: 0,
        x: 4,
        y: -5
      },
      path: {
        pathString: new SVGPathData('M 0 0 h 10'),
        pinColor: '#000000'
      },
      pinDot: {
        x: 10,
        y: 0
      }
    }
  }

  /**
   * Override converting to primtive data since we store this in a nested member.
   */
  toPrimitives () {
    let primitives = Object.assign({}, this.data)

    // Now convert the members that need to be converted. First handle xy values
    // converting to strings
    Pin.convertXyProps.forEach(propOwner => {
      primitives[propOwner].x = primitives[propOwner].x.toString()
      primitives[propOwner].y = primitives[propOwner].y.toString()
    })

    Pin.pathProps.forEach(propOwner => {
      primitives[propOwner].pathString = primitives[propOwner].pathString.encode()
    })

    return primitives
  }

  /**
   * Set the pin name
   * @param {string} name The new name
   */
  set name (name) {
    this.data.name.text = name
  }

  get name () {
    return this.data.name.text
  }

  /**
   * Set the pin number
   * @param {string} number The new number
   */
  set number (number) {
    this.data.num.text = number
  }

  get number () {
    return this.data.num.text
  }

  /**
   * Set the x position of the pin.
   */
  set x (number) {
    let offsetX = number - this.anchorX
    this.translate(offsetX, 0)
  }

  get x () {
    return this.anchorX
  }

  /**
   * Set the y position of the pin.
   */
  set y (number) {
    let offsetY = number - this.anchorY
    this.translate(0, offsetY)
  }

  get y () {
    return this.anchorY
  }

  /**
   * Offset the pin by the x and y positions
   *
   * @param {int} dx The x distance to offset
   * @param {int} dy The y distance to offset
   */
  translate (dx, dy) {
    // It might be better to just keep track of a trasformation matrix and do
    // one final transformation at the end. But this would mean you cannot
    // easily manipulate the shapes

    // Move the nested members
    Pin.xyProps.forEach(propName => {
      this.data[propName].x += dx
      this.data[propName].y += dy
    })

    Pin.pathProps.forEach(propName => {
      this.data[propName].pathString = this.data[propName].pathString.translate(dx, dy)
    })

    // Move our anchor point to the new locations
    this.anchorX += dx
    this.anchorY += dy
  }
}

Pin.xyProps = ['configure', 'dot', 'name', 'num', 'pinDot']
Pin.convertXyProps = ['configure', 'dot', 'name', 'num']
Pin.pathProps = ['clock', 'path']

module.exports = Pin
