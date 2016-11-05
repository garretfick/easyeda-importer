/* eslint-env mocha */

'use strict'

const fs = require('fs')
const should = require('should')
const EasyEdaBackend = require('../kicad/easyeda-backend')
const KiCadReader = require('../kicad/kicad-reader')

describe('Integration library to schematic', () => {
  let backend = null
  let reader = null

  beforeEach(() => {
    // We need a new reader and backend with each test
    backend = new EasyEdaBackend()
    reader = new KiCadReader()
    reader.backend = backend
  })

  describe('#libraryToSchematic()', () => {
    it('libraryToSchematic() creates library', () => {
      let libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')

      reader.addLibrarySource(libContents, 'OPAMP')
      reader.libraryToSchematic('OPAMP')

      let schematic = backend.getSchematic()

      // TODO this test is definitely incomplete
      should.not.be.null(schematic)
    })
  })
})
