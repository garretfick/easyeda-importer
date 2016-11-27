/* eslint-env mocha */

'use strict'

const Pin = require('../../src/easyeda/pin')

describe('Pin', () => {
  describe('#toPrimitives', () => {
    it('toPrimitives() set name number', () => {
      let pin = new Pin()
      pin.name = 'pinName'
      pin.number = '2'

      let primitivesData = pin.toPrimitives()

      primitivesData.name.text.should.equal('pinName')
      primitivesData.num.text.should.equal('2')

      // Validate that the path data is correctly output
      primitivesData.clock.pathString.should.equal('M10 -3L7 0L10 3')
    })
  })

  describe('#x', () => {
    it('sets new position of children', () => {
      let pin = new Pin()
      pin.x = 100

      let primitivesData = pin.toPrimitives()

      // Validate that the path data is correctly output
      primitivesData.dot.x.should.equal('113')
      primitivesData.name.x.should.equal('96')
      primitivesData.num.x.should.equal('104')
      primitivesData.pinDot.x.should.equal(110)
    })
  })

  describe('#y', () => {
    it('sets new position of children', () => {
      let pin = new Pin()
      pin.y = 100

      let primitivesData = pin.toPrimitives()

      // Validate that the path data is correctly output
      primitivesData.dot.y.should.equal('100')
      primitivesData.name.y.should.equal('100')
      primitivesData.num.y.should.equal('95')
      primitivesData.pinDot.y.should.equal(100)
    })
  })
})
