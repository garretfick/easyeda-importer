/* eslint-env mocha */

'use strict'

const fs = require('fs')
const should = require('should')
const lib2sch = require('../../src/util/lib2sch')

describe('Integration library to schematic', () => {
  describe('#libraryToSchematic()', () => {
    it('libraryToSchematic() creates OPAMP library', () => {
      const libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')

      let schematic = null
      lib2sch(libContents, 'OPAMP', {}, (action, converted) => {
        schematic = converted.source
      })

      // TODO this test is definitely incomplete
      should.exist(schematic)

      schematic.should.have.property('schlib')
      // One for each of the aliases - total of 3
      schematic.should.have.property('itemOrder').have.length(3)

      // Validate the created component in the schematic
      const itemId = schematic.itemOrder[0]
      schematic.schlib.should.have.property(itemId)

      const component = schematic.schlib[itemId]

      // Validate the head element
      component.head.should.have.property('gId').which.equal(itemId)
      component.head.should.have.property('x').which.equal('0')
      component.head.should.have.property('y').which.equal('0')
      component.head.should.have.property('importFlag').which.equal(0)

      // Validate the pins - there are 5 of the on the OpAmp
      component.should.have.property('pin').have.size(5)
      // Now validate the pins - just doing basic validation that this
      // is in fact a pin. We validate the structure of a pin in other
      // tests
      const pin = component.pin[Object.keys(component.pin)[0]]
      pin.should.have.properties(['clock', 'configure', 'dot', 'name', 'num', 'path', 'pinDot'])

      // Validate the polygon - there should be one
      component.should.have.property('polygon').have.size(1)
      // Now validate the polygon - just doing basic validation that
      // this is in fact a polygon. We validate the structure of a polygon
      // in other tests
      const polygon = component.polygon[Object.keys(component.polygon)[0]]
      polygon.should.have.properties(['fillColor', 'pointArr', 'strokeColor', 'strokeStyle', 'strokeWidth'])

      // Validate the annotiations (the refdes and component name fields)
      component.should.have.property('annotation').have.size(4)
    })

    it('libraryToSchematic() creates CIRCLE library', () => {
      const libContents = fs.readFileSync('test/kicad/shapes/shapes.lib', 'utf8')

      let schematic = null
      lib2sch(libContents, 'OPAMP', { instFilter: ({compName}) => compName === 'CIRCLE' }, (action, converted) => {
        schematic = converted.source
      })

      should.exist(schematic)

      schematic.should.have.property('schlib')
      schematic.should.have.property('itemOrder').have.length(1)

      // Validate the created component in the schematic
      const itemId = schematic.itemOrder[0]
      schematic.schlib.should.have.property(itemId)

      const component = schematic.schlib[itemId]

      // Validate the head element
      component.head.should.have.property('gId').which.equal(itemId)
      component.head.should.have.property('x').which.equal('0')
      component.head.should.have.property('y').which.equal('0')
      component.head.should.have.property('importFlag').which.equal(0)

      // Validate there should be 4 ellipses
      component.should.have.property('ellipse').have.size(4)
    })
  })
})
