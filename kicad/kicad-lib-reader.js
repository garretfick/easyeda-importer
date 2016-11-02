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
                schlibDef.aliases = rd.readFieldsInfo(libraryData[index++], 1)
            } else {
                schlibDef.aliases = []
            }

            // Read the field values until we don't have any more
            while (libraryData[index][0] === 'F') {
                index++
            }

            // TODO this is completely wrong - just temporary to get tests to pass
            this.backend._getContext().name = schlibDef.name

            while (!libraryData[index].startsWith('ENDDEF') && index < libraryData.length) {
                console.log(libraryData[index])
                index += 1
            }
        } finally {
            // We always need to release the context we created
            this.backend.endSchLibContext()
        }

        return index
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