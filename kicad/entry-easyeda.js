'use strict'

const fs = require('fs')
const EasyEdaBackend = require('./easyeda-backend')
const KiCadReader = require('./kicad-reader')

console.log('here')

// Create the backend to generate EasyEDA schematic
let backend = new EasyEdaBackend()
backend.initializeSchematic()

let reader = new KiCadReader()
let schematicSource = fs.readFileSync('D:/Dev/easyeda-importer/kicad/test/keyboard.sch', 'utf8')
reader.addSchematicSource(schematicSource)
reader.read(backend)

// TODO remove this
backend.rect()

let schematicData = backend.getSchematic()

console.log(schematicData)
api('applySource', {source: schematicData, createNew: true})
