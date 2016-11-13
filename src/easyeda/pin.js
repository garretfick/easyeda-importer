'use strict'

const DrawingObject = require('./drawing-object')

/**
 * Schematic pin
 */
class Pin extends DrawingObject
{
  constructor () {
    super()
    this.data = {
      clock: {
        pathString: '',
        visible: 0
      },
      configure: {
        display: 'show',
        electric: '0',
        // gId: '',
        rotation: '0',
        spicePin: '1'
        // x: '0',
        // y: '0'
      },
      dot: {
        visible: 0
        // x: '0',
        // y: '0'
      },
      name: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'start',
        visible: 1
        // x: '0',
        // y: '0'
      },
      num: {
        fontFamily: '',
        fontSize: '',
        rotation: 0,
        text: '',
        textAnchor: 'end',
        visible: 0
        // x: '0',
        // y: '0'
      },
      path: {
        pathString: '',
        pinColor: '#000000'
      },
      pinDot: {
        x: 0,
        y: 0
      }
    }
  }

  /**
   * Set the pin name
   * @param {string} name The new name
   */
  set name (name) {
    this.data.name.text = name
  }

  /**
   * Set the pin number
   * @param {string} number The new number
   */
  set number (number) {
    this.data.num.text = number
  }
}

module.exports = Pin
