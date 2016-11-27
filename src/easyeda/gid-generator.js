'use strict'

/**
 * Generates globally unique IDs for EasyEDA. This is necessary
 */
class GidGenerator {

  constructor () {
    this.nextObjectIndex = 1
  }

  /**
   * Get the next available GID (and increment to the next item)
   */
  nextGid () {
    // Create the identifier, then increment to the next index
    let identifier = 'gge' + this.nextObjectIndex++
    return identifier
  }
}

module.exports = GidGenerator
