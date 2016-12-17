/* eslint-env mocha */

'use strict'

const GidGenerator = require('../../src/easyeda/gid-generator')
const Arc = require('../../src/easyeda/arc')
const Point = require('../../src/util/point')

describe('Arc', () => {
  describe('#toPrimitives', () => {
    let idGen = null

    beforeEach(() => {
      idGen = new GidGenerator()
    })

    it('toPrimitives() converts to EasyEDA arc 1', () => {
      // A 350 -50 112 1534 266 0 1 0 F 250 0 450 0
      let arc = new Arc()
      arc.center = new Point(35, 5)
      arc.radius = 11.2
      arc.startAngle = 153.4
      arc.endAngle = 26.6
      arc.start = new Point(25, 0)
      arc.end = new Point(45, 0)
      // clockwise

      const pathString = arc._toPathString()
      pathString.should.equal('M 25 0 A 11.2 11.2 0 0 1 45 0')
    })

    it('toPrimitives() converts to EasyEDA arc 2', () => {
      // A 350 250 112 -1534 -266 0 1 0 N 250 200 450 200
      let arc = new Arc()
      arc.center = new Point(35, -25)
      arc.radius = 11.2
      arc.startAngle = -153.4
      arc.endAngle = -26.6
      arc.start = new Point(25, -20)
      arc.end = new Point(45, -20)
      // counter clockwise

      const pathString = arc._toPathString()
      pathString.should.equal('M 25 -20 A 11.2 11.2 0 0 0 45 -20')
    })

    it('toPrimitives() converts to EasyEDA arc 3', () => {
      // A 350 350 112 1534 266 0 1 50 N 250 400 450 400
      let arc = new Arc()
      arc.center = new Point(35, -35)
      arc.radius = 11.2
      arc.startAngle = 153.4
      arc.endAngle = 26.6
      arc.start = new Point(25, -40)
      arc.end = new Point(45, -40)
      // clockwise

      const pathString = arc._toPathString()
      pathString.should.equal('M 25 -40 A 11.2 11.2 0 0 1 45 -40')
    })

    it('toPrimitives() converts to EasyEDA arc 4', () => {
      // A 400 -300 150 901 -901 0 1 0 f 400 -150 400 -450
      let arc = new Arc()
      arc.center = new Point(40, -30)
      arc.radius = 15
      arc.startAngle = 90.1
      arc.endAngle = -90.1
      arc.start = new Point(40, 15)
      arc.end = new Point(40, -45)
      // counter clockwise

      const pathString = arc._toPathString()
      pathString.should.equal('M 40 15 A 15 15 0 0 0 40 -45')
    })
  })
})
