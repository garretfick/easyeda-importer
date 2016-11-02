'use strict'

const rd = require('./kicad-base-reader')

/**
 * Reader for the Kicad schematic library (LIB) format.
 *
 * This is normally constructed by the KiCadReader
 */
class KiCadLibReader {
    constructor() {
        this.backend = null
    }

    /**
     * Convert the schematic to EasyEDA format using the EasyEDA backend
     * to generate the objects
     *
     * @param {object} backend The backend for outputing the read data
     */
    read(backend) {
        this.backend = backend
    }

    /**
     * Evil function, but useful for testing for now
     */
    _readLines(library) {
        try {
            let libraryData = library.split('\n').map((line) => {
                return line.trim()
            })
            return libraryData
        } catch (e) {
            console.log('Cannot read library data')
            console.log(e)
            return null
        }
    }

    /**
     * Read a schematic file, calling the appropriate backend as encountering
     * objects in the schematic
     *
     * @param {string} library The library contents to read
     */
    _readLibrary(library) {
        let libraryData = this._readLines(library)
        if (libraryData) {
            // Validate that we have found a library
            if (libraryData.length <= 2 || !libraryData[0].startsWith('EESchema-LIBRARY Version 2.')) {
                throw Error('Contents are not a KiCad library or are not a supported version')
            }

            // Start from the second line (index = 1) to skip the file header
            for (let index = 1; index < libraryData.length; ++index) {
                let line = libraryData[index]

                // Each line is one of a few different types, all keyed based on the beginning
                // of the line
                if (line.startsWith('#')) {
                    continue
                } else if (line.startsWith('DEF')) {
                    index = this._readComponent(libraryData, index)
                } else if (line.length !== 0) {
                    console.log('Unknown file contents: ' + line)
                }
            }
        } else {
            console.log('No library data to read')
        }
    }

    _readComponent(libraryData, index) {
        try {
            // TODO small bug where if we cannot create the context, then
            // TODO in the finally, we will release a context that we didn't create
            this.backend.beginSchLibContext()

            let schlibDef = {}

            rd.readFieldsInto(schlibDef, libraryData[index++], [null, 'name', 'reference', null,
                'text_offset', 'draw_pinnumnber', 'draw_pinname', 'unit_count',
                'units_locked', 'option_flag'
            ], [null, null, null, null,
                null, rd.parseYN, rd.parseYN, parseInt,
                rd.parseIsIdenticalUnits, rd.parseIsPower
            ])

            if (libraryData[index].startsWith('ALIAS')) {
                schlibDef.aliases = rd.readFieldsIntoArray(libraryData[index++], 1)
            } else {
                schlibDef.aliases = []
            }

            // Read the field values until we don't have any more
            while (libraryData[index][0] === 'F') {
                // TODO properly handle these
                this._readLibraryField(libraryData[index], schlibDef)
                index++
            }

            // TODO Handle the $FPLIST

            while (!libraryData[index].startsWith('ENDDEF') && index < libraryData.length) {
                index += 1
            }

            this.backend.update(schlibDef)
        } finally {
            // We always need to release the context we created
            this.backend.endSchLibContext()
        }

        return index
    }

    /**
     * Read one of the F values from KiCad
     * 
     * @param {string} value The full line e.g. F0 DIP-8...
     * 
     * @param {object} schLibDef The library definition to read into
     */
    _readLibraryField(value, schLibDef) {
        let item = {}

        // parseInt stops at the first non-integer character, so the spaces at the end are ok
        let fieldIdentifier = parseInt(value.substr(1))

        // We cannot use the normal read into object because the item may have spaces
        // so first find the enclosing double quotes
        let startText = value.indexOf('"', 2)
        let endText = value.indexOf('"', startText + 1)
        item.value = value.substr(startText + 1, endText - startText - 1)

        // The field might have a name, and we can detect this by finding
        // double quotes after the first set
        let startName = value.indexOf('"', endText + 1)
        let endName = startName > -1 ? value.indexOf('"', startName + 1) : -1
        item.name = startName > -1 ? value.substr(startName + 1, endName - startName - 1) : null

        // The middle part of the string are the properties. Get the substr for the
        // part that forms the properties (so we don't have to split on the end name
        // if it exists)
        let propertiesValue = startName > -1 ? value.substr(endText + 1, startName - endText - 1) : value.substr(endText)

        // Read the part of the value after the string identifier. We trim the properties value
        // since we really don't know how many extra spaces it might have
        let fields = {}
        rd.readFieldsInto(fields, propertiesValue.trim(), ['x', 'y', 'dimension', 'orientation', 'visibility', 'format'], [parseInt, parseInt, parseInt, null, null, null])

        return item
    }

    static parseIsIdenticalUnits(value) {
        return rd.parseOptions(value, {
            L: false, // Locked, units are not identical
            F: true // Not locked, units are identical and can be parsed
        })
    }

    static parseIsPower(value) {
        return rd.parseOptions(value, { N: false, P: true })
    }

    _convertPoint(data, xName = 'x', yName = 'y') {
        // TODO need to figure out how to scale from KiCAD to EasyEDA, but I need
        // downloaded KiCAD to figure this out
        data[xName] = data[xName]
        data[yName] = data[yName]
    }
};

module.exports = KiCadLibReader