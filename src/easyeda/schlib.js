'use strict'

/**
 * A schematic component instance. In EasyEDA, there are only instances, no shared definitions
 */
class SchLib
{
  constructor () {
    this.data =  {
      head: {
        c_para: '',
        importFlag: 0
      },
      itemOrder: []
    }
  }
}

module.exports = SchLib
