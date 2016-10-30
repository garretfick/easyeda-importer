/* eslint-env mocha */

const fs = require('fs')
const assert = require('assert')
const should = require('should')
const EasyEdaBackend = require('../kicad/easyeda-backend')
const KiCadLibReader = require('../kicad/kicad-lib-reader')

describe('KiCadLibReader', () => {
  let backend = null
  let reader = null

  beforeEach(() => {
    // We need a new reader and backend with each test
    backend = new EasyEdaBackend()
    // For these tests, we are reading individual components
    // so we just need the schlib context (that represents a
    // single schlib component)
    backend.beginSchLibContext()

    reader = new KiCadLibReader()
    reader.backend = backend
  })

  describe('#_readLibrary()', () => {
    it('_readLibrary() read single library component', () => {
      let libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')
      reader._readLibrary(libContents)

      let root = backend.getRoot()

      root.should.have.property('schlib')
    })
  })
})
