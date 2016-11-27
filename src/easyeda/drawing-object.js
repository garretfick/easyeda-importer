'use strict'

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
   * Get this object as the primitive only serialization. This permanently and destructively
   * changes the object contents. The object is no longer valid after this convertion.
   *
   * If you need to keep the object around, then you must clone it first.
   *
   * @return {object} Returns the object converted to only contain only the primitives
   * understood by EasyEDA.
   */
  toPrimitives () {
    let data = this._primitiveData()

    // Do a search for any members in the data that need conversion. This is a basic recursive
    // tree visit, where if we find any converable object, then we replace the member
    // data by calling it's toPrimitives function
    this._objectToPrimitives(data)

    return data
  }

  _objectToPrimitives (data) {
    for (let member in data) {
      // Skip all items that begin with __ as internal only, not convertable
      if (member.startsWith('__')) {
        delete data[member]
        continue
      }

      let value = data[member]
      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; ++index) {
          value[index] = this._objectToPrimitives(value[index])
        }
      } else if (typeof (value) === 'object') {
        this._objectToPrimitives(value)
      }
    }

    return data
  }
}

module.exports = DrawingObject
