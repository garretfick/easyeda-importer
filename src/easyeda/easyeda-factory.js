'use strict'

const Annotation = require('./annotation')
const Arc = require('./arc')
const CompDef = require('./comp-def')
const CompLibrary = require('./comp-library')
const Document = require('./document')
const Ellipse = require('./ellipse')
const Rect = require('./rect')
const Pin = require('./pin')
const Polygon = require('./polygon')
const Polyline = require('./polyline')
const SchLib = require('./schlib')

/**
 * Factory to create EasyEDA JSON objects
 */
class EasyEdaFactory
{
  constructor (theme = null) {
    this.theme = theme
  }

  /**
   * Create a pin drawing object
   * @return {Pin} The created pin
   */
  createPin () {
    const pin = new Pin()
    this._applyTheme(pin)
    return pin
  }

  /**
   * Create a rectangle drawing object
   * @return {Rect} The created rectangle
   */
  createRect () {
    const rect = new Rect()
    this._applyTheme(rect)
    return rect
  }

  /**
   * Create a polygon drawing object
   * @return {Polygon} The created polygon
   */
  createPolygon () {
    const poly = new Polygon()
    this._applyTheme(poly)
    return poly
  }

  /**
   * Create a new polyline drawing object
   */
  createPolyline () {
    const poly = new Polyline()
    this._applyTheme(poly)
    return poly
  }

  /**
   * Create a new ellipse drawing object
   * @return {Ellipse} The created ellipse
   */
  createEllipse () {
    const ellipse = new Ellipse()
    this._applyTheme(ellipse)
    return ellipse
  }

  /**
   * Create a new arc drawing object
   * @return {Arc} The created arc
   */
  createArc () {
    const arc = new Arc()
    this._applyTheme(arc)
    return arc
  }

  /**
   * Create a new text drawing object
   * @return {Annotation} The created text
   */
  createAnnotation () {
    const annotation = new Annotation()
    this._applyTheme(annotation)
    return annotation
  }

  /**
   * Create a component instance (that is, an instance that lives on a schematic)
   * @return {SchLib} The created component instance
   */
  createComponent () {
    return new SchLib()
  }

  createSchematic () {
    return new Document()
  }

  createCompDef () {
    return new CompDef()
  }

  /**
   * Create a new component library instance. This is not a native EasyEDA object.
   * It is useful for conversion only.
   */
  createCompLibrary () {
    return new CompLibrary()
  }

  /**
   * Apply a theme to the created drawing object
   *
   * @param {DrawingObject} shape The created drawing object to theme
   * @private
   */
  _applyTheme (shape) {
    if (this.theme) {
      shape.applyTheme(this.theme)
    }
  }
}

module.exports = EasyEdaFactory
