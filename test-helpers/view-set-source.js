/**
 * Simple script to get and set the source for a schematic
 */

// Get the current source and write it to the console
let result = api('getSource', {type: 'json'})
console.log(result)

// Do some work on the schematic here

// Set the source, creating a new schematic in the process
api('applySource', {source: result, createNew: true})

