'use strict'

/**
 * Generates globally unique IDs for EasyEDA. This is necessary since each object had a globally unique ID.
 */
class GidGenerator {

  /**
   * Initialize a new instance of the GidGenerator
   *
   * @param {number} firstObjectId The ID of the first object to create.
   */
  constructor (firstObjectId = 1) {
    this.nextObjectIndex = firstObjectId
  }

  /**
   * Get the next available GID (and increment to the next item)
   * @return {string} The next identifier
   */
  nextGid () {
    // Create the identifier, then increment to the next index
    let identifier = 'gge' + this.nextObjectIndex++
    return identifier
  }
}

module.exports = GidGenerator
