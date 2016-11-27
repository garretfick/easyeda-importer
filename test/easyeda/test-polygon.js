/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Polygon = require('../../src/easyeda/polygon')

describe('Polygon', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() returns valid formatted data', () => {
      let polygon = new Polygon()

      // The polygon is not closed
      polygon.pointArr = [
        {x: 0, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 5}
      ]
      let { primitives } = polygon.toPrimitives(idGen)

      primitives.pointArr.should.eql([
        {x: 0, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 5}])
    })
  })
})
