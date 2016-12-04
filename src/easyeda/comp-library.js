'use strict'

/**
 * Represents a library of components in EasyEDA. EasyEDA doesn't have such a concept
 * (or not one that I know of, but this is still useful for conversion). This doesn't
 * dervive from DrawingObject because we cannot serialize it.
 */
class CompLibrary {
  constructor () {
    this.compDefs = {}
  }

  /**
   * Add a component defintion.
   * @param {SchLib} compDef The component definition to add
   */
  addCompDef (compDef) {
    this.compDefs[compDef.name] = compDef
  }

  /**
   * Get the component with the specified name
   */
  find (name) {
    return this.compDefs[name]
  }

  get defs () {
    return Object.keys(this.compDefs).map(key => this.compDefs[key])
  }

  /**
   * Does the library have a component with the specified name?
   * @return {boolean} True if a component exists with the name, otherwise false
   */
  hasCompDef (name) {
    return this.compDefs.hasOwnProperty(name)
  }
}

module.exports = CompLibrary
