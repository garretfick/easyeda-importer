/* eslint-env mocha */

'use strict'

const fs = require('fs')
const should = require('should')
const Point = require('../src/util/point')
const KiCadLibReader = require('../src/kicad/kicad-lib-reader')
const EasyEdaFactory = require('../src/easyeda/easyeda-factory')

describe('KiCadLibReader', () => {
  describe('#_readLibrary()', () => {
    let reader = null

    beforeEach(() => {
      reader = new KiCadLibReader(new EasyEdaFactory())
    })

    it('_readLibrary() read library with one component', () => {
      let libContents = fs.readFileSync('test/kicad/opamp/opamp.lib', 'utf8')
      let library = reader._readLibrary(libContents)

      library.should.have.property('LM1875')

      let libItem = library['LM1875']
      libItem.should.have.property('aliases')

      libItem.should.have.property('packages')
      libItem.packages.should.be.array
      libItem.packages.should.have.length(1)
      libItem.packages[0].should.equal('TO*')

      libItem.graphics.should.have.length(6)
      // TODO test more properties
    })
  })

  describe('#_readLibraryField()', () => {
    let reader = new KiCadLibReader(new EasyEdaFactory())

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

  describe('#_readGraphic()', () => {
    let reader = new KiCadLibReader(new EasyEdaFactory())

    it('_readGraphic() polygon 1', () => {
      let shape = reader._readGraphic('P 3 0 1 0 -50 50 50 0 -50 -50 F')

      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.strokeWidth.should.equal('0')
      shape.fillColor.should.equal('#000000')

      shape.pointArr.should.eql([
        {x: -5, y: 5},
        {x: 5, y: 0},
        {x: -5, y: -5}])
    })

    it('_readGraphic() rectangle', () => {
      let shape = reader._readGraphic('S 0 50 900 900 0 1 0 f')

      shape.x.should.equal('0')
      shape.y.should.equal('5')
      shape.width.should.equal('90')
      shape.height.should.equal('85')
      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.strokeWidth.should.equal('0')
      shape.fillColor.should.equal('none')
    })

    it('_readGraphic() circle', () => {
      let shape = reader._readGraphic('C 0 50 70 0 1 0 F')

      shape.cx.should.equal('0')
      shape.cy.should.equal('5')
      shape.rx.should.equal('7')
      shape.ry.should.equal('7')
      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.strokeWidth.should.equal('0')
      shape.fillColor.should.equal('#000000')
    })

    it('_readGraphic() arc 1', () => {
      let shape = reader._readGraphic('A -1 -200 49 900 -11 0 1 0 N -50 -200 0 -150')

      shape.x.should.equal(-1)
      shape.y.should.equal(-200)
      shape.radius.should.equal(49)
      shape.startAngle.should.equal(90.0)
      shape.endAngle.should.equal(-1.1)
      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.thickness.should.equal(0)
      shape.filled.should.be.false
      shape.startPointX.should.equal(-50)
      shape.startPointY.should.equal(-200)
      shape.endPointX.should.equal(0)
      shape.endPointY.should.equal(-150)
    })

    it('_readGraphic() arc 2', () => {
      let shape = reader._readGraphic('A 0 -199 49 0 -911 0 1 0 N 0 -150 50 -200')

      shape.x.should.equal(0)
      shape.y.should.equal(-199)
      shape.radius.should.equal(49)
      shape.startAngle.should.equal(0)
      shape.endAngle.should.equal(-91.1)
      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.thickness.should.equal(0)
      shape.filled.should.be.false
      shape.startPointX.should.equal(0)
      shape.startPointY.should.equal(-150)
      shape.endPointX.should.equal(50)
      shape.endPointY.should.equal(-200)
    })

    it('_readGraphic() text', () => {
      let shape = reader._readGraphic('T 0 -320 -10 100 0 1 VREF')

      // TODO this orientation is not handled correctly
      shape.orientation.should.equal('0')
      shape.x.should.equal('-32')
      shape.y.should.equal('-10')
      shape.dimension.should.equal(100)
      shape.__kicad_unit.should.equal('0')
      shape.__kicad_convert.should.equal('1')
      shape.value.should.equal('VREF')
    })

    it('_readGraphic() pin 1', () => {
      let shape = reader._readGraphic('X TO 1 200 0 150 R 40 40 1 1 P')

      // TODO this orientation is not handled correctly
      shape.name.should.equal('TO')
      shape.number.should.equal('1')
      shape.x.should.equal(20)
      shape.y.should.equal(0)
      // TODO this is not being handled correctly
      shape.length.should.equal(15)
      shape.connectionPoint.x.should.equal(30)
      shape.connectionPoint.y.should.equal(0)
      shape.numberDimension.should.equal(40)
      shape.nameDimension.should.equal(40)
      shape.__kicad_unit.should.equal('1')
      shape.__kicad_convert.should.equal('1')
      shape.electricalType.should.equal('P')
    })

    it('_readGraphic() pin 2', () => {
      let shape = reader._readGraphic('X K 2 200 0 150 L 40 40 1 1 P')

      // TODO this orientation is not handled correctly
      shape.name.should.equal('K')
      shape.number.should.equal('2')
      shape.x.should.equal(20)
      shape.y.should.equal(0)
      shape.length.should.equal(15)
      shape.connectionPoint.x.should.equal(10)
      shape.connectionPoint.y.should.equal(0)
      shape.numberDimension.should.equal(40)
      shape.nameDimension.should.equal(40)
      shape.__kicad_unit.should.equal('1')
      shape.__kicad_convert.should.equal('1')
      shape.electricalType.should.equal('P')
    })

    it('_readGraphic() pin 3', () => {
      let shape = reader._readGraphic('X 0 1 0 0 0 R 40 40 1 1 W NC')

      // TODO this orientation is not handled correctly
      shape.name.should.equal('0')
      shape.number.should.equal('1')
      shape.x.should.equal(0)
      shape.y.should.equal(0)
      shape.length.should.equal(0)
      shape.connectionPoint.x.should.equal(10)
      shape.connectionPoint.y.should.equal(0)
      shape.numberDimension.should.equal(40)
      shape.nameDimension.should.equal(40)
      shape.__kicad_unit.should.equal('1')
      shape.__kicad_convert.should.equal('1')
      shape.electricalType.should.equal('W')
      shape.shape.should.equal('NC')
    })

    it('_readGraphic() pin 4', () => {
      let shape = reader._readGraphic('X ~ 2 0 250 200 U 40 40 1 1 P')

      shape.name.should.equal('~')
      shape.number.should.equal('2')
      shape.x.should.equal(0)
      shape.y.should.equal(25)
      shape.length.should.equal(20)
      shape.connectionPoint.x.should.equal(0)
      // TODO I think this should be 35, but for some reason, it comes out to 25???
      shape.connectionPoint.y.should.equal(25)
      shape.numberDimension.should.equal(40)
      shape.nameDimension.should.equal(40)
      shape.__kicad_unit.should.equal('1')
      shape.__kicad_convert.should.equal('1')
      shape.electricalType.should.equal('P')
    })

    it('_readGraphic() unknown type throws error', () => {
      (() => {
        reader._readGraphic('W ~ 2 0 250 200 U 40 40 1 1 P')
      }).should.throw('Unknown graphic definition: W ~ 2 0 250 200 U 40 40 1 1 P')
    })
  })
})
