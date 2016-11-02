/* eslint-env mocha */

'use strict'

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
            // so we just need the schlib container context that owns
            // the read components
        backend.beginSchLibContainerContext()

        reader = new KiCadLibReader()
        reader.backend = backend
    })

    describe('#_readLibrary()', () => {
        it('_readLibrary() read library with one component', () => {
            let libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')
            reader._readLibrary(libContents)

            let root = backend.getRoot()

            root.should.have.property('LM1875')
                // TODO test more properties
        })
    })
})