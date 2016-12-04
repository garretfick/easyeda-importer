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
  /**
   * Create a pin drawing object
   * @return {Pin} The created pin
   */
  createPin () {
    return new Pin()
  }

  /**
   * Create a rectangle drawing object
   * @return {Rect} The created rectangle
   */
  createRect () {
    return new Rect()
  }

  /**
   * Create a polygon drawing object
   * @return {Polygon} The created polygon
   */
  createPolygon () {
    return new Polygon()
  }

  /**
   * Create a new polyline drawing object
   */
  createPolyline () {
    return new Polyline()
  }

  /**
   * Create a new ellipse drawing object
   * @return {Ellipse} The created ellipse
   */
  createEllipse () {
    return new Ellipse()
  }

  /**
   * Create a new arc drawing object
   * @return {Arc} The created arc
   */
  createArc () {
    return new Arc()
  }

  /**
   * Create a new text drawing object
   * @return {Annotation} The created text
   */
  createAnnotation () {
    return new Annotation()
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
}

module.exports = EasyEdaFactory
