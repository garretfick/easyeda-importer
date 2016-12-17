'use strict'

class Theme {
  constructor (overrides = null) {
    this.overrides = overrides
  }

  get pinColor () {
    return this.getValue('pinColor', '#000000')
  }

  get defaultStroke () {
    return this.getValue('defaultStroke', '#000000')
  }

  get defaultFill () {
    return this.getValue('defaultFill', '#000000')
  }

  get defaultText () {
    return this.getValue('defaultText', '#000000')
  }

  getValue (name, defaultVal) {
    if (this.overrides && this.overrides.defaults.hasOwnProperty(name)) {
      return this.overrides.defaults[name]
    }
    return defaultVal
  }
}

Theme.KICAD = {
  name: 'kicad',
  defaults: {
    pinColor: '#840000',
    defaultStroke: '#840000',
    defaultFill: '#FFFFC2',
    defaultText: '#0000C2'
  }
}

module.exports = Theme
