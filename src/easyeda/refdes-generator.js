'use strict'

/**
 * Generates reference designators sequentially (primarily for converting a library to a schematic)
 *
 * This generater assumes all RefDes were generated with this class. This works if you are converting from
 * a library to a schematic (where no objects initally have a RefDes). However, this will not work if you
 * are adding a component to an existing schematic since this does not check the RefDes in the schematic
 * to ensure uniqueness.
 */
class RefDesGenerator {

  constructor () {
    this.prefixes = {}
  }

  /**
   * Get the next available RefDes (and increment to the next item)
   * @param {string} prefix The prefix for the refdes, for example U
   */
  nextRefDes (prefix) {
    // Create the identifier, then increment to the next index
    if (!this.prefixes.hasOwnProperty(prefix)) {
      this.prefixes[prefix] = 1
    }

    const nextVal = this.prefixes[prefix]++
    return prefix + nextVal
  }
}

module.exports = RefDesGenerator
