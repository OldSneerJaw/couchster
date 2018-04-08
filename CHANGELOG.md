# Change Log
This project adheres to [Semantic Versioning](http://semver.org/). All notable changes will be documented in this file.

## [Unreleased]
### Added
- [#8](https://github.com/OldSneerJaw/couchster/issues/8): Regular expression pattern constraint for document ID
- [#10](https://github.com/OldSneerJaw/couchster/issues/10): Extended year format in date strings
- [#11](https://github.com/OldSneerJaw/couchster/issues/11): Mechanism to reset test environment between test cases
- [#13](https://github.com/OldSneerJaw/couchster/issues/13): Dedicated module for writing validation functions
- [#15](https://github.com/OldSneerJaw/couchster/issues/15): Throw an Error object when there is an authorization or validation failure

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

[Unreleased]: https://github.com/OldSneerJaw/couchster/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/OldSneerJaw/couchster/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/OldSneerJaw/couchster/compare/73ba6a5...v0.1.0
