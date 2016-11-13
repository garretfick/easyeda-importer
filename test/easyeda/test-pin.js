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
    })
  })
})
