'use strict'

/**
 * A schematic component instance. In EasyEDA, there are only instances, no shared definitions
 */
class SchLib
{
  constructor () {
    this.head = {
      c_para: '',
      importFlag: 0
    }
    this.itemOrder = []
  }
}

module.exports = SchLib
