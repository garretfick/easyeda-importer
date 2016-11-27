/* eslint-env mocha */

'use strict'

const DrawingObject = require('../../src/easyeda/drawing-object')
const GidGenerator = require('../../src/easyeda/gid-generator')

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
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() with only primitives returns same data', () => {
      let drawingObject = new RootDrawingObject()

      let { primitives, id } = drawingObject.toPrimitives(idGen)

      primitives.should.have.properties(['some', 'other', 'gId'])
      id.should.equal(primitives.gId)
      id.should.equal('gge1')
    })

    it('toPrimitives() converts nested data', () => {
      let drawingObject = new ParentDrawingObject()

      let { primitives, id } = drawingObject.toPrimitives(idGen)

      primitives.should.have.properties(['something', 'other', 'gId'])
      id.should.equal(primitives.gId)
    })
  })
})
