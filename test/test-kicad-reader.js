/* eslint-env mocha */

'use strict'

const EasyEdaBackend = require('../src/easyeda/easyeda-backend')
const KiCadReader = require('../src/kicad/kicad-reader')

describe('KiCadReader', () => {
  let backend = null
  let reader = null

  beforeEach(() => {
    // We need a new reader and backend with each test
    backend = new EasyEdaBackend()
    backend.beginSchematicContext()
    reader = new KiCadReader()
    reader.backend = backend
  })

  describe('#text()', () => {
    // it('text() parses label', () => {
    //  reader._readSchText([
    //    'Text Label 5450 4050 0 50 ~ 0',
    //    'SCK'
    //  ], 0)

    //  let schematicData = backend.getSchematic()
    //  schematicData.should.have.property('annotation').with.property('gg1')

    //  let annotation = schematicData.annotation.gg1
    //  annotation.string.should.equal('SCK')
    // })
  })
})
