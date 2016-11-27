/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Rect = require('../../src/easyeda/rect')

describe('Rect', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() returns valid formatted data', () => {
      let rect = new Rect()
      rect.translate(10, 20)
      rect.width = 7
      rect.height = 12

      let { primitives } = rect.toPrimitives(idGen)

      primitives.x.should.equal('10')
      primitives.y.should.equal('20')
      primitives.width.should.equal('7')
      primitives.height.should.equal('12')
      primitives.strokeWidth.should.equal('0')
    })
  })

  describe('#translate', () => {
    it('translate() changes the position', () => {
      let rect = new Rect()
      rect.translate(-10, -20)

      rect.x.should.equal(-10)
      rect.y.should.equal(-20)
    })
  })
})
