'use strict'

const Color = require('../util/color')

/**
 * A theme provides default colors and a way to apply those defaults to an object
 */
class Theme {
  /**
   * Create a new instance of the theme.
   *
   * @param {object} overrides Named overrides for the colors. For example to set the pin color to yellow
   * provide an oject with the shape
   * {
   *   pinColor: new Color('yellow')
   * }
   */
  constructor (overrides = null) {
    this.overrides = overrides
  }

  /**
   * Get the default color for a pin
   * @return {Color} The SVG color for a pin
   */
  get pinColor () {
    return this.getValue('pinColor', '#000000')
  }

  /**
   * Get the default color for stroked lines
   * @return {Color} The SVG color for a stroked line
   */
  get defaultStroke () {
    return this.getValue('defaultStroke', '#000000')
  }

  /**
   * Get the default color for filled ares
   * @return {Color} The SVG color for a filled areas
   */
  get defaultFill () {
    return this.getValue('defaultFill', '#000000')
  }

  /**
   * Get the default color for test
   * @return {Color} The SVG color for a text
   */
  get defaultText () {
    return this.getValue('defaultText', '#000000')
  }

  /**
   * Get the value. This allows you to have specify overrides from the default colors
   */
  getValue (name, defaultVal) {
    if (this.overrides && this.overrides.defaults.hasOwnProperty(name)) {
      return this.overrides.defaults[name].clone()
    }
    return new Color(defaultVal)
  }
}

Theme.KICAD = {
  name: 'kicad',
  defaults: {
    pinColor: new Color('#840000'),
    defaultStroke: new Color('#840000'),
    defaultFill: new Color('#FFFFC2'),
    defaultText: new Color('#0000C2')
  }
}

module.exports = Theme
