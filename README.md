
[![Build Status](https://travis-ci.org/garretfick/easyeda-importer.svg?branch=master)](https://travis-ci.org/garretfick/easyeda-importer)
[![Coverage Status](https://coveralls.io/repos/github/garretfick/easyeda-importer/badge.svg?branch=master)](https://coveralls.io/github/garretfick/easyeda-importer?branch=master)

Import KiCAD libraries and schematics into EasyEDA.

Run scripts in EasyEDA to import KiCAD documents into EasyEDA. You need to build the scripts
or use a release (in the future) before you can use directly in EasyEDA.

## Build

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Compatibility Differences

EasyEDA and KiCAD formats are not fully compatible. The list below describes some known differences.

### Symbol Pin Properties

EasyEDA does not support many electrical type and symbols from KiCAD. If the type is not supported
the type is set to the closed matching value supported by EasyEDA.