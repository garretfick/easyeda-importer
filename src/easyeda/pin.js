'use strict'

const deepcopy = require('deepcopy')
const DrawingObject = require('./drawing-object')
const Point = require('../util/point')
const Rectangle = require('../util/rectangle')
const SVGPathData = require('svg-pathdata')

/**
 * Schematic pin. Our initial position of the pin is at (0, 0) pointing to the right
 * and ending at (10, 0). That is, it would be on the left side of the component, and
 * you would connect a wire at (0, 0).
 *
 * Important to note that locations for the pin are absolute coordinates, they are
 * not relative to the owing symbol.
 */
class Pin extends DrawingObject
{
  constructor () {
    super()
    this.__type = 'pin'

    // Our current anchor position (where you connect a wire). Keep track of this
    // as we manipulte the pin so we know where we are at all times
    this.connectionPoint = new Point(0, 0)
    // Our default pin length is 10 units
    this.bodyPoint = new Point(10, 0)

    this.data = {
      clock: {
        pathString: new SVGPathData('M 10 -3 L 7 0 L 10 3'),
        visible: 0
      },
      configure: {
        display: 'show',
        electric: Pin.ELEC_TYPE_UNDEFINED,
        // gId: '',
        rotation: '180',
        spicePin: '1',
        point: new Point(13, 0)
      },
      dot: {
        visible: 0,
        point: new Point(13, 0)
      },
      name: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'start',
        visible: 1,
        point: new Point(12, 0)
      },
      num: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'end',
        visible: 0,
        point: new Point(5, -1)
      },
      path: {
        pinColor: '#000000'
      },
      pinDot: {
        // This coincides with the connection point (for the wire)
        // Maybe it actually is the same thing.
        // It is a small gray dot that you see drawn on the page
        point: new Point(0, 0)
      }
    }
  }

  applyTheme (theme) {
    this.data.path.pinColor = theme.pinColor
  }

  /**
   * Override converting to primtive data since we store this in a nested member.
   * @param {GidGenerator} idGenerator Class to generate new IDs when converting to primitives
   */
  toPrimitives (idGenerator) {
    let primitives = deepcopy(this.data)

    // Now convert the members that need to be converted. First handle xy values
    // converting to strings
    Pin.stringPoints.forEach(propOwner => {
      primitives[propOwner].x = primitives[propOwner].point.x.toString()
      primitives[propOwner].y = primitives[propOwner].point.y.toString()
      delete primitives[propOwner].point
    })

    Pin.numberPoints.forEach(propOwner => {
      primitives[propOwner].x = primitives[propOwner].point.x
      primitives[propOwner].y = primitives[propOwner].point.y
      delete primitives[propOwner].point
    })

    Pin.pathProps.forEach(propOwner => {
      primitives[propOwner].pathString = primitives[propOwner].pathString.encode()
    })

    // Create the pathString item for the path property
    primitives.path.pathString = ['M', this.bodyPoint.x, this.bodyPoint.y, this.connectionPoint.x, this.connectionPoint.y].join(' ')

    primitives.configure.gId = idGenerator.nextGid()

    return { primitives: primitives, id: primitives.configure.gId }
  }

  /**
   * Set the pin name
   * @param {string} name The new name
   */
  set name (name) {
    this.data.name.text = name
    return this
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
    return this
  }

  get number () {
    return this.data.num.text
  }

  /**
   * Offset the pin to the new X position. This sets the location
   * of the connection point, where you connect a wire
   * @param {number} number The new X position
   */
  set x (number) {
    let offsetX = number - this.connectionPoint.x
    this.translate(offsetX, 0)

    return this
  }

  /**
   * Get the current X postition of the pin
   */
  get x () {
    return this.connectionPoint.x
  }

  /**
   * Offset the pin ot the new Y position. This sets the location
   * of the connection point, where you connect a wire
   * @param {number} number The new Y position
   */
  set y (number) {
    let offsetY = number - this.connectionPoint.y
    this.translate(0, offsetY)

    return this
  }

  get y () {
    return this.connectionPoint.y
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
      if (!this.data[propName].point) {
        return
      }
      this.data[propName].point.translate(dx, dy)
    })

    Pin.pathProps.forEach(propName => {
      this.data[propName].pathString = this.data[propName].pathString.translate(dx, dy)
    })

    // Move our anchor and connection points to the new locations
    this.connectionPoint.translate(dx, dy)
    this.bodyPoint.translate(dx, dy)

    return this
  }

  /**
   * Set the length of the pin.
   */
  set length (length) {
    // TODO currently, this works for KiCAD because we get the pin length before rotating
    // TODO if the order changes, then this is no valid
    if (this.connectionPoint.y !== this.bodyPoint.y) {
      throw new Error('You must set the length before rotating the pin, or fix this function')
    }

    // Since we are not allowing you to rotate first, setting the length is the same as setting
    // the location
    this.bodyPoint.x = this.connectionPoint.x + length
    this.data.name.point.x += length
    this.data.num.point.x += length
  }

  /**
   * Get the length of the pin
   *
   * @return {number} The length of the pin
   */
  get length () {
    return this.connectionPoint.distance(this.bodyPoint)
  }

  /**
   * Rotate the pin. This is an implied rotation about the connection point (where you connect the wire)
   */
  rotate (angleDegrees) {
    if (angleDegrees === 0) {
      return this
    }

    Pin.xyProps.forEach(propName => {
      this.data[propName].point.rotateDegrees(angleDegrees, this.connectionPoint)
    })

    // TODO this is not rotating because the implementation doessn't seem to allow
    // TODO rotation about arbitrary point. We need to translate, rotate, then translate
    // TODO back.
    Pin.pathProps.forEach(propName => {
      // The current location is relative to the body point so move it from there
      // to the connection point
      // const {dx, dy} = this.connectionPoint.sub(this.bodyPoint)
      // let path = this.data[propName].pathString.translate(dx, dy)
      // Do the rotation
      // path.rotate(angleDegrees)
      // TODO Move it back to where it should be (this must be wrong)
      // path.translate(-dx, -dy)

      // this.data[propName].pathString = path
    })

    this.bodyPoint.rotateDegrees(angleDegrees, this.connectionPoint)

    // Adjust the anchor for the text based on the pin angle
    if (angleDegrees >= 135 && angleDegrees < 215) {
      this.data.name.textAnchor = 'end'
      this.data.num.textAnchor = 'start'
    }

    return this
  }

  /**
   * Set the electical type of the pin
   */
  set electricalType (type) {
    this.data.configure.electric = type
  }

  /**
   * Get the electrical type of the pin
   * @return {string} The electrical type
   */
  get electricalType () {
    return this.data.configure.electric
  }

  /**
   * Set the pin to be an inverting pin
   */
  set isInverting (isInverting) {
    this.data.dot.visible = isInverting ? 1 : 0
  }

  /**
   * Set the pin to be a clock pin
   */
  set isClock (isClock) {
    this.data.clock.visible = isClock ? 1 : 0
  }

  /**
   * Gets the bounding box of the pin. This currently doesn't include the text position
   */
  get bounds () {
    return Rectangle.fromPoints(this.connectionPoint, this.bodyPoint)
  }
}

Pin.xyProps = ['configure', 'dot', 'name', 'num', 'pinDot']
Pin.stringPoints = ['configure', 'dot', 'name', 'num']
Pin.numberPoints = ['pinDot']
Pin.pathProps = ['clock']

Pin.ELEC_TYPE_UNDEFINED = '0'
Pin.ELEC_TYPE_INPUT = '1'
Pin.ELEC_TYPE_OUTPUT = '2'
Pin.ELEC_TYPE_BIDIR = '3'
Pin.ELEC_TYPE_POWER = '4'

module.exports = Pin
