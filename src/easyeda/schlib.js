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
}

module.exports = SchLib
