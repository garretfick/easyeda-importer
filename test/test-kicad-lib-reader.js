/* eslint-env mocha */

'use strict'

const fs = require('fs')
const assert = require('assert')
const should = require('should')
const EasyEdaBackend = require('../kicad/easyeda-backend')
const KiCadLibReader = require('../kicad/kicad-lib-reader')

describe('KiCadLibReader', () => {
  describe('#_readLibrary()', () => {
    let backend = null
    let reader = null

    beforeEach(() => {
            // We need a new reader and backend with each test
      backend = new EasyEdaBackend()
                // For these tests, we are reading individual components
                // so we just need the schlib container context that owns
                // the read components
      backend.beginSchLibContainerContext()

      reader = new KiCadLibReader()
      reader.backend = backend
    })

    it('_readLibrary() read library with one component', () => {
      let libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')
      reader._readLibrary(libContents)

      let root = backend.getRoot()

      root.should.have.property('LM1875')

      let libItem = root['LM1875']
      libItem.should.have.property('aliases')

      libItem.should.have.property('packages')
      libItem.packages.should.be.array
      libItem.packages[0].should.equal('TO*')
            // TODO test more properties
    })
  })

  describe('#_readLibraryField()', () => {
    let reader = new KiCadLibReader()

    it('_readLibraryField() simple value', () => {
      let field = reader._readLibraryField('F1 "DIODE" 0 -100 50 H V L CIB')

      field.should.have.property('value')
      field.value.should.equal('DIODE')

      field.should.have.property('name')
      should.not.exist(field.name)
    })

    it('_readLibraryField() has name field', () => {
      let field = reader._readLibraryField('F2 "2euros" 0 -200 50 H V L CIB "PRICE"')

      field.should.have.property('value')
      field.value.should.equal('2euros')

      field.should.have.property('name')
      field.name.should.equal('PRICE')
    })
  })
})
