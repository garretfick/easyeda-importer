'use strict'

const deepcopy = require('deepcopy')

/**
 * Base class for all EasyEDA primitives. This provides the implementation to recursively
 * convert.
 */
class DrawingObject
{
  /**
   * Get the data that should be converted and returned by asPrimitives()
   *
   * Normally, classes will have a data member, but this gives a common way to
   * get the primitive data.
   *
   * @return {object} The object hierarchy to convert
   */
  _primitiveData () {
    return this
  }

  /**
   * Get this object as the primitive only serialization. This does not change the
   * object itself. The original object stays in tact
   *
   * @param {GidGenerator} idGenerator Generates unique IDs for nested objects
   *
   * @return {object} Returns the object converted to only contain only the primitives
   * understood by EasyEDA.
   */
  toPrimitives (idGenerator) {
    const data = this._primitiveData()

    // Do a search for any members in the data that need conversion. This is a basic recursive
    // tree visit, where if we find any converable object, then we replace the member
    // data by calling it's toPrimitives function
    const primitives = this._objectToPrimitives(data)

    // Assign this object an identifier since we are creating an instance
    primitives.gId = idGenerator.nextGid()

    return { primitives: primitives, id: primitives.gId }
  }

  _objectToPrimitives (data) {
    const stringPropNames = this._getStringProps()

    const primitives = {}

    for (let member in data) {
      // Skip all items that begin with __ as internal only, not convertable
      if (member.startsWith('__')) {
        continue
      }

      let value = data[member]
      if (stringPropNames.includes(member)) {
        primitives[member] = value.toString()
      } else {
        primitives[member] = deepcopy(value)
      }
    }

    return primitives
  }

  _getStringProps () {
    return []
  }
}

module.exports = DrawingObject
