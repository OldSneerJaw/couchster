# Change Log
This project adheres to [Semantic Versioning](http://semver.org/). All notable changes will be documented in this file.

## [Unreleased]
Nothing yet.

## [1.2.1] - 2019-05-21
### Fixed
- [#46](https://github.com/OldSneerJaw/couchster/issues/46): Broken error equality test in Node.js 12

### Security
- [#43](https://github.com/OldSneerJaw/couchster/issues/43): Security vulnerability in lodash dev dependency

## [1.2.0] - 2018-09-06
### Added
- [#33](https://github.com/OldSneerJaw/couchster/issues/33): Option to ignore item validation errors when value is unchanged
- [#34](https://github.com/OldSneerJaw/couchster/issues/34): Validation type that accepts any type of value
- [#38](https://github.com/OldSneerJaw/couchster/issues/38): Conditional validation type

## [1.1.0] - 2018-06-04
### Added
- [#24](https://github.com/OldSneerJaw/couchster/issues/24): Attachment filename regular expression constraint
- [#25](https://github.com/OldSneerJaw/couchster/issues/25): Attachment reference regular expression constraint

## [1.0.0] - 2018-05-10
### Added
- [#8](https://github.com/OldSneerJaw/couchster/issues/8): Regular expression pattern constraint for document ID
- [#10](https://github.com/OldSneerJaw/couchster/issues/10): Extended year format in date strings
- [#11](https://github.com/OldSneerJaw/couchster/issues/11): Mechanism to reset test environment between test cases
- [#13](https://github.com/OldSneerJaw/couchster/issues/13): Dedicated module for writing validation functions
- [#15](https://github.com/OldSneerJaw/couchster/issues/15): Throw an Error object when there is an authorization or validation failure
- [#17](https://github.com/OldSneerJaw/couchster/issues/17): Case insensitive equality constraint for strings

## [0.2.0] - 2018-03-08
### Added
- [#2](https://github.com/OldSneerJaw/couchster/issues/2): Option to allow any database member to write revisions for a specific document type
- [#3](https://github.com/OldSneerJaw/couchster/issues/3): Option to output a generated validation function as a single-line JSON string
- [#4](https://github.com/OldSneerJaw/couchster/issues/4): Allow a document with an unknown type to be deleted by an admin
- [#6](https://github.com/OldSneerJaw/couchster/issues/6): Provide database name to authorization constraint functions

### Changed
- [#5](https://github.com/OldSneerJaw/couchster/issues/5): Isolate test fixtures

## [0.1.0] - 2018-02-28
Adapted from [synctos](https://github.com/Kashoo/synctos) for use with CouchDB

[Unreleased]: https://github.com/OldSneerJaw/couchster/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/OldSneerJaw/couchster/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/OldSneerJaw/couchster/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/OldSneerJaw/couchster/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/OldSneerJaw/couchster/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/OldSneerJaw/couchster/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/OldSneerJaw/couchster/compare/73ba6a5...v0.1.0
