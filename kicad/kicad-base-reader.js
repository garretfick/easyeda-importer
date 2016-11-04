'use strict'

class KiCadBaseReader {
  /**
   * Parse KiCad's representation of boolean values. These are either Y or N
   *
   * @param {string} value The value to parse
   *
   * @return {boolean} True if the value is 'Y', false if the value is 'N'
   *
   * @throws Error if the value is not Y or N
   */
  static parseYN (value) {
    return KiCadBaseReader.parseOptions(value, { Y: true, N: false })
  }

  /**
   * Parse KiCad values into a new set of constants
   * 
   * @param {string} value The value to find
   * 
   * @param {object} options Map of values to find, for exampe { Y: true, N: false }
   * 
   * @return {any} The found value
   * 
   * @throws Error if the value does not exist in options
   */
  static parseOptions (value, options) {
    if (options.hasOwnProperty(value)) {
      return options[value]
    }
    throw Error(value + ' is unexpected option')
  }

  /**
   * Reads a line containing space separated fields into the data object.
   *
   * @param {object} targetObject The object to read into.
   *
   * @param {string} line The line to read.
   *
   * @param {array} fieldIdentifiers Array of field names. The index of the field names matches
   * the index of the field in the line. If the field should not be added to the object,
   * set the value at index to null.
   *
   * @param {array} fieldTypeConverters Array of function to convert the field values. The index
   * of the field type converters matches the index of the filed in the line. If the field
   * should not be converted, set the value at the index to null. If null, then do not
   * use type conversion.
   *
   * @return The modified object. The object is converted in place, so this is only necessary
   * to use as a fluent API
   */
  static readFieldsInto (targetObject, line, fieldIdentifiers, fieldTypeConverters) {
    let lineFields = line.split(' ')
    let maxField = Math.min(lineFields.length, fieldIdentifiers.length)
    for (let index = 0; index < maxField; ++index) {
      let value = lineFields[index]

            // If the field name is null, then skip it. We don't need the value
      let fieldName = fieldIdentifiers[index]
      if (!fieldName) {
        continue
      }

            // Do we want to convert this value? We may not be using type conversion at all
      let typeConverter = fieldTypeConverters ? fieldTypeConverters[index] : null
      if (typeConverter) {
        value = typeConverter(value)
      }

      targetObject[fieldName] = value
    }

    return targetObject
  }

  /**
   * Read the fields into an array, skipping the specified number of fields.
   *
   * For example, _readFieldsInfoArray('ALIAS name1 name2 name3', 1) returns ['name1', 'name2', 'name3']
   *
   * @param {string} line The string to read into array
   *
   * @param {int} Offset into the string to start (array index)
   *
   * @return array of elements. Always returns an array, even if no elements
   */
  static readFieldsIntoArray (line, startOffset) {
    let lineFields = line.split(' ')
    if (startOffset === undefined) {
      return lineFields
    } else if (lineFields.length >= startOffset) {
      return lineFields.slice(startOffset)
    }
    return []
  }

  /**
   * Read forward until the specified line
   *
   * @param {array} identifiers The value to read until
   * 
   * @param {array} data The data array to read
   * 
   * @param {int} currentIndex The index in data to start reading from
   * 
   * @return The index of the found object
   */
  static indexOfAny(identifiers, data, currentIndex) {
    while (!identifiers.includes(data[currentIndex])) {
      currentIndex++
    }
    return currentIndex
  }
}

module.exports = KiCadBaseReader
