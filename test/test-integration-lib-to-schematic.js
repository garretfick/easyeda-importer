/* eslint-env mocha */

'use strict'

const fs = require('fs')
const should = require('should') // eslint-disable-line no-unused-vars
const ConvertContext = require('../src/easyeda/convert-context')
const KiCadLibReader = require('../src/kicad/kicad-lib-reader')

describe('Integration library to schematic', () => {
  let convertContext = null

  beforeEach(() => {
    // We need a new reader and backend with each test
    convertContext = new ConvertContext()
  })

  describe('#libraryToSchematic()', () => {
    it('readToContext() import only compatible items', () => {
      const libContents = fs.readFileSync('test/kicad/incompatible/incompatible.lib', 'utf8')

      // Add the library to the context
      KiCadLibReader.readToContext(libContents, 'SHAPES', convertContext)

      // There should be one error for the component that cannot be read
      convertContext.errors.should.have.length(1)
      convertContext.errors[0].toString().includes('NOIMPORT')

      // The OK component should still be imported
      convertContext.libraries.should.have.length(1)

      const library = convertContext.findCompLibrary('SHAPES')
      library.hasCompDef('OKIMPORT').should.be.true
    })
  })
})
