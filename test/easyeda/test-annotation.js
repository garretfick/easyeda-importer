/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Annotation = require('../../src/easyeda/annotation')

describe('Annotation', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() returns valid formatted data', () => {
      let annotation = new Annotation()
      annotation.translate(10, 20)

      let { primitives } = annotation.toPrimitives(idGen)

      primitives.visible.should.equal(1)
    })
  })
})
