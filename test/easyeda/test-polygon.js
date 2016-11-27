/* eslint-env mocha */

'use strict'

const Polygon = require('../../src/easyeda/polygon')

describe('Polygon', () => {
  describe('#toPrimitives', () => {
    it('toPrimitives() returns valid formatted data', () => {
      let polygon = new Polygon()

      // The polygon is not closed
      polygon.pointArr = [
        {x: 0, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 5}
      ]
      let primitivesData = polygon.toPrimitives()

      primitivesData.pointArr.should.eql([
        {x: 0, y: 0},
        {x: 5, y: 0},
        {x: 5, y: 5}])
    })
  })
})
