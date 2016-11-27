'use strict'

const EasyEdaFactory = require('./easyeda-factory')

/**
 * Backend to generate the EasyEDA JSON-compatible data structure
 */
class EasyEdaBackend {
  constructor () {
    this.root = null
    // Maintain a stack of the current context. Normally this is either 1 or 2 items, corresponding
    // to either a schematic or a schlib in the schematic
    this.contexts = []
    this.nextObjectIndex = 1
    this.factory = new EasyEdaFactory()
  }

  /**
   * Push onto the context stack. If this is the first object, then this becomes the root
   * context.
   */
  _pushContext (context) {
    if (this.root === null) {
      this.root = context
    }
    this.contexts.push(context)
  }

  _popContext () {
    return this.contexts.pop()
  }

  _getContext () {
    return this.contexts.length > 0 ? this.contexts[this.contexts.length - 1] : null
  }

  /**
   * Create the schematic container that owns all of the objects in the schematic.
   * This is mostly just boiler place determined by outputting the JSON from EasyEDA
   */
  beginSchematicContext () {
    let schematic = this.factory.createSchematic()
    this._pushContext(schematic)
  }

  /**
   * End the schematic context, removing it from the context stack
   */
  endSchematicContext () {
    return this._popContext()
  }

  /**
   * Start a context for an individual schlib object (eg. a library component)
   */
  beginSchComponentContext () {
    // A schlib context can never be the root context
    let parentContext = this._getContext()
    if (!parentContext) {
      throw Error('schlib context cannot be the root context. It must have a parent')
    }

    // The base definition of a component instance
    let schlib = this.factory.createComponent()

    this._pushContext(schlib)

    return schlib
  }

  /**
   * End the schematic component context. This will add the component to the owner context.
   */
  endSchComponentContext () {
    let schlibComponent = this._popContext()

    // This needs to be added to the schlib element
    let identifier = this._nextIdentifier()
    schlibComponent.head.gId = identifier

    this._addObject(schlibComponent, identifier, 'schlib')
  }

  /**
   * Add a DrawingObject into the context
   *
   * @param {DrawingObject} drawingObject The object to add
   */
  addDrawingObject (drawingObject) {
    let identifier = this._nextIdentifier()

    // Get the primitives only represetation of the object
    let objectType = drawingObject.__type
    let primitives = drawingObject.toPrimitives()

    this._addObject(primitives, identifier, objectType)

    return this
  }

  /**
   * Update the context with the properties from the object
   *
   * TODO this is a bad hack, but it gets things moving along
   */
  update (updateObject) {
    let contextObject = this._getContext()
    Object.assign(contextObject, updateObject)
  }

  /**
   * Add an object to the context.
   *
   * @param {object} item The object to add
   *
   * @param {any} identifier
   *
   * @param {string} objectType The object type to add, affects which section it is added to
   */
  _addObject (item, identifier, objectType) {
    // Make sure the section for this type exists
    let context = this._getContext()

    if (!context.hasOwnProperty(objectType)) {
      context[objectType] = {}
    }

    // Add the object
    context[objectType][identifier] = item

    // Then append the objec to the list of ordered objects
    context.itemOrder.push(identifier)
  }

  _nextIdentifier () {
    // Create the identifier, then increment to the next index
    let identifier = 'gg' + this.nextObjectIndex++
    return identifier
  }

  getSchematic () {
    return this.root
  }
}

module.exports = EasyEdaBackend
