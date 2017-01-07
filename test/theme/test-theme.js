/* eslint-env mocha */

'use strict'

const Color = require('../../src/util/color')
const Theme = require('../../src/theme/theme')

describe('Theme', () => {
  describe('default', () => {
    let theme = null

    beforeEach(() => {
      theme = new Theme()
    })

    describe('#pinColor', () => {
      it('pinColor() for KiCAD theme returns correct object type', () => {
        theme.pinColor.should.be.instanceOf(Color)
      })
    })

    describe('#defaultStroke', () => {
      it('defaultStroke() for KiCAD theme returns correct object type', () => {
        theme.defaultStroke.should.be.instanceOf(Color)
      })
    })

    describe('#defaultFill', () => {
      it('defaultFill() for KiCAD theme returns correct object type', () => {
        theme.defaultFill.should.be.instanceOf(Color)
      })
    })

    describe('#defaultText', () => {
      it('defaultText() for KiCAD theme returns correct object type', () => {
        theme.defaultText.should.be.instanceOf(Color)
      })
    })
  })

  describe('KICAD', () => {
    let theme = null

    beforeEach(() => {
      theme = new Theme(Theme.KICAD)
    })

    describe('#pinColor', () => {
      it('pinColor() for KiCAD theme returns correct object type', () => {
        theme.pinColor.should.be.instanceOf(Color)
      })
    })

    describe('#defaultStroke', () => {
      it('defaultStroke() for KiCAD theme returns correct object type', () => {
        theme.defaultStroke.should.be.instanceOf(Color)
      })
    })

    describe('#defaultFill', () => {
      it('defaultFill() for KiCAD theme returns correct object type', () => {
        theme.defaultFill.should.be.instanceOf(Color)
      })
    })

    describe('#defaultText', () => {
      it('defaultText() for KiCAD theme returns correct object type', () => {
        theme.defaultText.should.be.instanceOf(Color)
      })
    })
  })
})
