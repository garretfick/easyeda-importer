'use strict'

const EasyEdaFactory = require('./easyeda-factory')
const GidGenerator = require('./gid-generator')

/**
 * Backend to generate the EasyEDA JSON-compatible data structure
 */
class EasyEdaBackend {
  constructor () {
    this.root = null
    // Maintain a stack of the current context. Normally this is either 1 or 2 items, corresponding
    // to either a schematic or a schlib in the schematic
    this.contexts = []
    this.idGenerator = new GidGenerator()
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
    const schematic = this.factory.createSchematic()

    // We want this as a writable schematic, so immediately convert
    // this to the primitive representation
    const { primitives, id } = schematic.toPrimitives(this.idGenerator)

    this._pushContext(primitives)
  }

  /**
   * End the schematic context, removing it from the context stack
   */
  endSchematicContext () {
    return this._popContext()
  }

  /**
   * Add a component instance into our current context.
   * This converts the data to basic primitives and assigns
   * all required IDs.
   *
   * @param {SchLib} compInst The component instance to add to the context
   */
  addCompInst (compInst) {
    // Get the primitives only represetation of the instance
    let { primitives, id } = compInst.toPrimitives(this.idGenerator)

    // Add it to the list of items for the schematic
    this._addObject(primitives, id, 'schlib')

    return this
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

    let { primitives, id } = schlibComponent.toPrimitives(this.idGenerator)

    this._addObject(primitives, id, 'schlib')
  }

  /**
   * Add a DrawingObject into the context
   *
   * @param {DrawingObject} drawingObject The object to add
   */
  addDrawingObject (drawingObject) {
    // Get the primitives only represetation of the object
    let objectType = drawingObject.__type
    let { primitives, id } = drawingObject.toPrimitives(this.idGenerator)

    this._addObject(primitives, id, objectType)

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

  getSchematic () {
    return this.root
  }
}

module.exports = EasyEdaBackend
