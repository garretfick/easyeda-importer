/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Pin = require('../../src/easyeda/pin')

describe('Pin', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() set name number', () => {
      let pin = new Pin()
      pin.name = 'pinName'
      pin.number = '2'

      let { primitives, id } = pin.toPrimitives(idGen)

      primitives.name.text.should.equal('pinName')
      primitives.num.text.should.equal('2')

      // Validate that the path data is correctly output
      primitives.clock.pathString.should.equal('M10 -3L7 0L10 3')

      // Validate we assigned the ID correctly
      id.should.equal(primitives.configure.gId)
      id.should.equal('gge1')
    })
  })

  describe('#x', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('sets new position of children', () => {
      let pin = new Pin()
      pin.x = 100

      let { primitives } = pin.toPrimitives(idGen)

      // Validate that the path data is correctly output
      primitives.dot.x.should.equal('113')
      primitives.name.x.should.equal('112')
      primitives.num.x.should.equal('105')
      primitives.pinDot.x.should.equal(100)
    })
  })

  describe('#y', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('sets new position of children', () => {
      let pin = new Pin()
      pin.y = 100

      let { primitives } = pin.toPrimitives(idGen)

      // Validate that the path data is correctly output
      primitives.dot.y.should.equal('100')
      primitives.name.y.should.equal('100')
      primitives.num.y.should.equal('99')
      primitives.pinDot.y.should.equal(100)
    })
  })
})
