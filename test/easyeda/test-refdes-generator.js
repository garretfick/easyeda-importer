/* eslint-env mocha */

'use strict'

const RefDesGenerator = require('../../src/easyeda/refdes-generator')

describe('RefDesGenerator', () => {
  describe('#nextRefDes', () => {
    let gen = null

    beforeEach(() => {
      gen = new RefDesGenerator()
    })

    it('generated sequential refdes', () => {
      const u1 = gen.nextRefDes('U')
      u1.should.equal('U1')

      const u2 = gen.nextRefDes('U')
      u2.should.equal('U2')

      const r1 = gen.nextRefDes('R')
      r1.should.equal('R1')
    })
  })
})
