# Contributing

## Setup Environment

Follow the steps below to setup a local development environment.

1. Install node and npm
2. Clone the repository code locally. For example, open a command prompt, change directory to where you would
   like to build the project, then execute `git clone https://github.com/garretfick/easyeda-importer.git .` (this will
   clone the code into the current directory)
3. Install build dependencies `npm install`

You now have a development and build environment configured.

## Build

Run the following to build the source and generate distribution files:

`npm run dist`

Build output files are generated in `dist`.

* `bundle-lib2sch.js` Web-friendly component library importer. Opens a prompt to input the URL of the library to importer.
* `bundle-lib2sch-test.js` Desktop friendly schematic importer. Imports a file from disk.
* `bundl-sch2sch.js` Web-friendly schematic importer. Incomplete at this time.

## Test

Run the following to execute the unit tests:

`npm run test`

Run the following to execute the style checks:

`npm run lint`