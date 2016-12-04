/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Polygon = require('../../src/easyeda/polygon')
const SchLib = require('../../src/easyeda/schlib')

describe('SchLib', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() returns valid formatted data', () => {
      const schlib = new SchLib()
      const polygon = new Polygon()
      polygon.pointArr = [
        {x: 0, y: 0},
        {x: 0, y: 1},
        {x: 1, y: 1}
      ]
      schlib.addDrawingObject(polygon)

      const converted = schlib.toPrimitives(idGen)
      const primitives = converted.primitives

      primitives.should.have.property('polygon')
      primitives.itemOrder.should.have.length(1)

      primitives.polygon[primitives.itemOrder[0]].should.exist
      primitives.polygon[primitives.itemOrder[0]].should.have.property('pointArr')
    })
  })
})
