'use strict'

const deepcopy = require('deepcopy')
const DrawingObject = require('./drawing-object')
const Point = require('../util/point')

/**
 * A schematic component instance. In EasyEDA, there are only instances, no shared definitions
 */
class SchLib extends DrawingObject
{
  constructor () {
    super()

    // The attributes for this object that we always have
    this.commonData = {
      head: {
        c_para: '',
        importFlag: 0
      },
      itemOrder: []
    }

    this.point = new Point(0, 0)

    // List of all children graphics (pins, shapes)
    this.children = []

    // EasyEDA keeps the name in an annotation, but we may not
    // have that annotation yet, so we have to store it here
    // then set it when writing
    this.name = ''
  }

  /**
   * Assign the reference designator for the instance.
   */
  set refDes (refDes) {
    // Find the annotation that represents the RefDes and set the value for it
    const annotation = this.children.find(graphic => {
      return graphic.__type === 'annotation' && graphic.isRefDes
    })

    if (annotation) {
      annotation.string = refDes
    }
  }

  /**
   * Add a graphic to the shape
   *
   * @param {object} item The graphic shape to add
   */
  addDrawingObject (item) {
    this.children.push(item)
  }

  toPrimitives (idGenerator) {
    const data = deepcopy(this.commonData)
    // Assign this object an identifier since we are creating an instance
    data.head.gId = idGenerator.nextGid()

    // Then convert all of the graphics in this instance
    this.children.forEach(drwObj => {
      const { primitives, id } = drwObj.toPrimitives(idGenerator)

      // Add it to the correct named section of this object
      const objectType = drwObj.__type

      if (!data.hasOwnProperty(objectType)) {
        data[objectType] = {}
      }

      // Add the object
      data[objectType][id] = primitives
      data.itemOrder.push(id)
    })

    // Replace the point with the correct item
    data.head.x = this.point.x.toString()
    data.head.y = this.point.x.toString()

    return { primitives: data, id: data.head.gId }
  }

  /**
   * Offset this instance by the specified x and y distance
   */
  translate (dx, dy) {
    // Offset our children and then move ourselves
    this._shapes.forEach(child => child.translate(dx, dy))
    this.point.translate(dx, dy)
  }

  /**
   * Get the bounding box for this item
   */
  get bounds () {
    // Get the bounds for all of the objects
    const bounds = this._shapes.map(child => child.bounds)

    // Then calculate the total bounds for each
    const xMin = Math.min.apply(null, bounds.map(b => b.x))
    const yMin = Math.min.apply(null, bounds.map(b => b.y))
    const xMax = Math.max.apply(null, bounds.map(b => b.x + b.width))
    const yMax = Math.max.apply(null, bounds.map(b => b.y + b.height))

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin
    }
  }

  /**
   * Get the drawable shapes
   */
  get _shapes () {
    return this.children
  }
}

module.exports = SchLib
