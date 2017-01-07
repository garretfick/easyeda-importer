'use strict'

/**
 * KiCAD is a bit annoying because items can have either foreground or background
 * color and we don't have a centralized color representation in EasyEDA.
 */
class Color
{
  constructor (foreground = '#000000', background = '#000000') {
    this.foreground = foreground
    this.background = background
    this.selected = Color.FOREGROUND
  }

  applyTheme (color) {
    this.foreground = color.foreground
    this.background = color.background
  }

  get isNone () {
    return this.selected === Color.NONE
  }

  /**
   * Create an invisible color
   */
  static makeNone () {
    const color = new Color()
    color.selected = Color.NONE
    return color
  }

  toString () {
    switch (this.selected) {
      case Color.NONE:
        return 'none'
      case Color.BACKGROUND:
        return this.background
      default:
        return this.foreground
    }
  }
}

/**
 * @var {string} Selected constant for foreground
 */
Color.FOREGROUND = 'fg'
Color.BACKGROUND = 'bg'
Color.NONE = 'none'

module.exports = Color
