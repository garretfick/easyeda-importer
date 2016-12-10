'use strict'

const deepcopy = require('deepcopy')
const DrawingObject = require('./drawing-object')
const Point = require('../util/point')
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
    this.anchor = new Point(0, 0)
    // Our default pin length is 10 units
    this.connectionPoint = new Point(10, 0)

    this.data = {
      clock: {
        pathString: new SVGPathData('M 10 -3 L 7 0 L 10 3'),
        visible: 0
      },
      configure: {
        display: 'show',
        electric: Pin.ELEC_TYPE_UNDEFINED,
        // gId: '',
        rotation: '0',
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
        point: new Point(-4, 0)
      },
      num: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'end',
        visible: 0,
        point: new Point(4, -5)
      },
      path: {
        pinColor: '#000000'
      },
      pinDot: {
        point: new Point(10, 0)
      }
    }
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
    primitives.path.pathString = ['M', this.anchor.x, this.anchor.y, this.connectionPoint.x, this.connectionPoint.y].join(' ')

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
   * Offset the pin to the new X position
   * @param {number} number The new X position
   */
  set x (number) {
    let offsetX = number - this.anchor.x
    this.translate(offsetX, 0)

    return this
  }

  /**
   * Get the current X postition of the pin
   */
  get x () {
    return this.anchor.x
  }

  /**
   * Offset the pin ot the new Y position
   * @param {number} number The new Y position
   */
  set y (number) {
    let offsetY = number - this.anchor.y
    this.translate(0, offsetY)

    return this
  }

  get y () {
    return this.anchor.y
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
      this.data[propName].point.translate(dx, dy)
    })

    Pin.pathProps.forEach(propName => {
      this.data[propName].pathString = this.data[propName].pathString.translate(dx, dy)
    })

    // Move our anchor and connection points to the new locations
    this.anchor.translate(dx, dy)
    this.connectionPoint.translate(dx, dy)

    return this
  }

  /**
   * Set the length of the pin.
   */
  set length (length) {
    // TODO currently, this works for KiCAD because we get the pin length before rotating
    // TODO if the order changes, then this is no valid
    if (this.connectionPoint.y !== this.anchor.y) {
      throw new Error('You must set the length before rotating the pin, or fix this function')
    }

    // Since we are not allowing you to rotate first, setting the length is the same as setting
    // the location
    this.connectionPoint.x = this.anchor.x + length
  }

  /**
   * Get the length of the pin
   *
   * @return {number} The length of the pin
   */
  get length () {
    return this.anchor.distance(this.connectionPoint)
  }

  /**
   * Set the orientation of the point. This is an implied rotation about the current center point.
   */
  set orientation (angleDegrees) {
    if (angleDegrees === 0) {
      return this
    }

    Pin.xyProps.forEach(propName => {
      this.data[propName].point.rotateDegrees(angleDegrees, this.anchor)
    })

    // TODO this is not rotating because the implementation doessn't seem to allow
    // TODO rotation about arbitrary point. We need to translate, rotate, then translate
    // TODO back.
    Pin.pathProps.forEach(propName => {
      // this.data[propName].pathString = this.data[propName].pathString.translate(dx, dy)
    })

    this.connectionPoint.rotateDegrees(angleDegrees, this.anchor)

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

  get bounds () {
    // TODO this is definitely wrong, not including the length here
    return {
      x: this.anchor.x,
      y: this.anchor.y,
      width: 0,
      height: 0
    }
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
