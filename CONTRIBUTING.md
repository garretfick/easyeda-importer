# Contributing

## Design Guide

This document gives a brief overview of the overal design of the KiCAD to EasyEDA converter. This should help you
understand how to get started to contibute code.

This project is written in ECMAScript6 with [standardjs](http://standardjs.com/) style. EasyEDA runs in the browser
and so only supports ECMAScript5. See the Build section in this document for details how to build the application.

### `webpack-*`

These files define the outputs that are build by the application and are referenced from `package.json`. Each of these
represents an entry point that gets built to the `dist` output folder.

### `src`

Contains the application code for converting from KiCAD to EasyEDA.

### `src/easyeda`

This folder contains representations of EasyEDA objects. These objects know how to convert themselves to the JSON
representation for EasyEDA.

The initial design did not contain these representations, however, this became necessary because EasyEDA stores many
of its properties as string when they might be better represented as numbers. The objects use a natural representation
so that they can be easily manipulated and so that we can do calculations based on it (e.g. bounds).

Objects are always created using the `EasyEdaFactory` (never directly) because the factory ensures objects are created
with the appropriate theme. In the current design, the theme values are copied into the object so it breaks the connection
to the initial theme. This is ok for our purposes, but it means you cannot easily change the theme globally after objects
are created.

I'm generally not happy with the easyeda-backend. Based on the initial requirements, I planned to implement a 'painter' from
KiCAD to EasyEDA, which was the basis of the backend. This doesn't work anymore because of needs to post-manipulate objects.

### `src/kicad`

This folder contains the readers for KiCAD libraries and schematics. The library code is largely complete, but the schematic
code probably does not work with recent changes.

The overall principle is to create EasyEDA objects (using a factory), then set values as properties. This means that the
EasyEDA objects expose properites so that we can easily set them.

### `src/theme`

Support for theming. A theme is simply a set of defaults for colors. The EasyEDA objects all have a functions `applyTheme`
which we use to set the theme on the object. Normally, you create the objects using the `EasyEdaFactory`, which takes care
of applying the theme to the object.

### `src/util`

Various geometry utilities and common functions.

One thing that I didn't create was an explicit object for bounds. This might be able to use the `Rectangle` object.

### `src/entry-*`

These are the entry points for the application to perform various tasks. These files are intentionally very small because
they are difficult to test well - for example, they may show a dialog or fetch a file from a URL.

The actual work is in a delagated funtion (for example `lib2sch`). For testing purposes, you can call `lib2sch` with a
mocked EasyEDA API to truly test almost all of the application without using EasyEDA at all.

There are two versions of the entry points - one for web use and one for desktop (development) use. You will probably find
testing on desktop version faster that the web version, but they are equivalent. These files are also the only places that
can try to load modules that may only be available on a specific platform (such as `fs`).

## `test`

Contains unit test code. For some reason, coveralls seems to report a code coverage far less that the actual coverage. I
believe the coverage is actually > 70%, but haven't investigated why there is a difference. It is of course possible that
my estimate is wrong and that there are large amounts of code that are not actually tested.

The contents of this folder match the same structure as `src`.

## Setup Environment

Follow the steps below to setup a local development environment.

1. Install node and npm.
2. Clone the repository code locally. For example, open a command prompt, change directory to where you would
    like to build the project, then execute `git clone https://github.com/garretfick/easyeda-importer.git .` (this will
    clone the code into the current directory).
3. Install build dependencies `npm install`.

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

Run the following to execute the JavaScript style checks:

`npm run lint`

Run the following to execute the Markdown style checks:

`npm run mdlint`