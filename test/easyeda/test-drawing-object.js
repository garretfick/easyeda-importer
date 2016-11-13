/* eslint-env mocha */

'use strict'

const DrawingObject = require('../../src/easyeda/drawing-object')

/**
 * Test class that declares members that don't need to be converted.
 */
class RootDrawingObject extends DrawingObject
{
  constructor () {
    super()
    this.some = {dummy: 'data'}
    this.other = ['array', 1]
  }
}

/**
 * A drawing object that uses another and so will require conversion
 */
class ParentDrawingObject extends DrawingObject
{
  constructor () {
    super()
    this.something = {no: 'convert'}
    this.other = new RootDrawingObject()
  }
}

describe('DrawingObject', () => {
  describe('#toPrimitives', () => {
    it('toPrimitives() with only primitives returns same data', () => {
      let drawingObject = new RootDrawingObject()

      let primitivesData = drawingObject.toPrimitives()

      primitivesData.should.have.properties(['some', 'other'])
    })
    it('toPrimitives() converts nested data', () => {
      let drawingObject = new ParentDrawingObject()

      let primitivesData = drawingObject.toPrimitives()

      primitivesData.should.have.properties(['something', 'other'])
    })
  })
})
