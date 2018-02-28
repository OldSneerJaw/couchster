// This module comprises the public API for couchster.

/**
 * The document-definitions-validator module. Reports violations of the document definitions schema.
 */
exports.documentDefinitionsValidator = require('./validation/document-definitions-validator');

/**
 * The validation-function-loader module. Reads validation functions from files.
 */
exports.validationFunctionLoader = require('./loading/validation-function-loader');

/**
 * The test-helper module. Provides a number of conveniences to test the behaviour of document definitions.
 */
exports.testHelper = require('./testing/test-helper');

/**
 * The validation-error-formatter module. Formats document validation error messages for use in document definition tests.
 */
exports.validationErrorFormatter = require('./testing/validation-error-formatter');
