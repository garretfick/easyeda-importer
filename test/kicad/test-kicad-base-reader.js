/* eslint-env mocha */

'use strict'

const rd = require('../../src/kicad/kicad-base-reader')

describe('KiCadBaseReader', () => {
  describe('#readFieldsInfoArray()', () => {
    it('handles start offset larger than number of elements', () => {
      let readArray = rd.readFieldsIntoArray('ALIAS name1', 2)

      readArray.should.be.an.Array()
      readArray.should.be.empty()
    })

    it('returns the right elements', () => {
      let readArray = rd.readFieldsIntoArray('ALIAS name1 name2', 1)

      readArray.should.be.an.Array()
      readArray.should.have.length(2)
      readArray[0].should.equal('name1')
      readArray[1].should.equal('name2')
    })

    it('handles no offset correctly', () => {
      let readArray = rd.readFieldsIntoArray('ALIAS name1 name2')

      readArray.should.be.an.Array()
      readArray.should.have.length(3)
      readArray[0].should.equal('ALIAS')
      readArray[1].should.equal('name1')
      readArray[2].should.equal('name2')
    })
  })

  describe('#parseYN()', () => {
    it('Y returns true', () => {
      rd.parseYN('Y').should.be.true
    })

    it('F returns false', () => {
      rd.parseYN('N').should.be.false
    })

    it('A throws exception', () => {
      (() => {
        rd.parseYN('A').should.be.false
      }).should.throw('A is unexpected option')
    })
  })

  describe('#indexOfAny()', () => {
    it('Y returns true', () => {
      let lines = ['TO*', '$ENDFPLIST', 'DRAW', 'P 4 0 1']
      rd.indexOfAny(['ENDDEF', 'DRAW'], lines, 0).should.be.equal(2)
    })
  })
})
