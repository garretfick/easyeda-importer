/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Ellipse = require('../../src/easyeda/ellipse')

describe('Ellipse', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() returns valid formatted data', () => {
      let ellipse = new Ellipse()
      ellipse.translate(10, 20)
      ellipse.radius = 5

      let { primitives } = ellipse.toPrimitives(idGen)

      primitives.cx.should.equal('10')
      primitives.cy.should.equal('20')
      primitives.rx.should.equal('5')
      primitives.ry.should.equal('5')
      primitives.strokeWidth.should.equal('0')
    })
  })

  describe('#translate', () => {
    it('translate() changes the position', () => {
      let ellipse = new Ellipse()
      ellipse.translate(-10, -20)

      ellipse.cx.should.equal(-10)
      ellipse.cy.should.equal(-20)
    })
  })
})
