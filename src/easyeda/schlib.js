'use strict'

const DrawingObject = require('./drawing-object')

/**
 * A schematic component instance. In EasyEDA, there are only instances, no shared definitions
 */
class SchLib extends DrawingObject
{
  constructor () {
    super()

    this.head = {
      c_para: '',
      importFlag: 0
    }
    this.itemOrder = []
  }

  toPrimitives (idGenerator) {
    let data = this._primitiveData()

    // Do a search for any members in the data that need conversion. This is a basic recursive
    // tree visit, where if we find any converable object, then we replace the member
    // data by calling it's toPrimitives function
    this._objectToPrimitives(data)

    // Assign this object an identifier since we are creating an instance
    data.head.gId = idGenerator.nextGid()

    return { primitives: data, id: data.head.gId }
  }
}

module.exports = SchLib
