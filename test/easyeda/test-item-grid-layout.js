/* eslint-env mocha */

'use strict'

const Ellipse = require('../../src/easyeda/ellipse')
const ItemGridLayout = require('../../src/util/item-grid-layout')

describe('ItemGridLayout', () => {
  describe('#layout', () => {
    it('layout() always uses grid spacing', () => {
      // Create some objects to layout
      const ellipse1 = new Ellipse()
      ellipse1.rx = 2.5
      ellipse1.ry = 2.5

      const ellipse2 = new Ellipse()
      ellipse2.rx = 2.5
      ellipse2.ry = 2.5

      // Create the layout engine
      const layoutStrategy = new ItemGridLayout()

      // Layout the two ellipses one after the other
      layoutStrategy.layout(ellipse1)
      layoutStrategy.layout(ellipse2)

      ellipse1.cx.should.equal(0)
      ellipse1.cy.should.equal(10)

      ellipse2.cx.should.equal(0)
      ellipse2.cy.should.equal(70)
    })
  })

  describe('#_inflateToGrid', () => {
    it('_inflateToGrid correctly snaps to grid', () => {
      const bounds = {
        x: -0.1,
        y: 21.1,
        width: 0.9,
        height: 5
      }

      // Create the layout engine
      const layoutStrategy = new ItemGridLayout()

      const inflatedBounds = layoutStrategy._inflateToGrid(bounds)

      inflatedBounds.x.should.equal(-10)
      inflatedBounds.y.should.equal(20)
      // We crossed a grid position for x, so we should have a width of 20
      inflatedBounds.width.should.equal(20)
      // But for y, we didn't cross, so this should not expand
      inflatedBounds.height.should.equal(10)
    })
  })
})
