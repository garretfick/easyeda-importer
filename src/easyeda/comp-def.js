'use strict'

const deepcopy = require('deepcopy')
const SchLib = require('./schlib')

/**
 * A schematic component definition. This isn't an EasyEDA object type, but it is
 * common in other formats, so we have this representation for the purpose of conversion.
 */
class CompDef
{
  constructor () {
    this.graphics = []
  }
  
  /**
   * Create an instance of this defintion.
   *
   * @return {SchLib} The instance of the componet def (that can be placed on a schematic)
   */
  toInstance (aliasName) {
    let instance = new SchLib()

    // Clone the graphics into this instance
    this.graphics.forEach(graphic => {
      const copy = deepcopy(graphic)
      instance.addDrawingObject(copy)
    })

    // Set the name of this instance
    instance.name = aliasName

    return instance
  }

  setRefDesAnnotation (annotation) {
    // TODO this should remove any existing, but not needed now
    annotation.__kind = SchLib.KIND_REFDES
    this.graphics.push(annotation)
  }

  setNameAnnotation (annotation) {
    // TODO this should remove any existing, but not needed now
    annotation.__kind = SchLib.KIND_REFDES
    this.graphics.push(annotation)
  }

  /**
   * Get a list of all names for this defintion, including all aliases
   *
   * @return {[string]} List of names for this definition
   */
  get names () {
    let names = [this.name]

    if (this.hasOwnProperty('aliases')) {
      names = names.concat(this.aliases)
    }

    return names
  }
}

module.exports = CompDef
