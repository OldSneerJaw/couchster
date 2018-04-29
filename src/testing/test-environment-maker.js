const path = require('path');
const simpleMock = require('../../lib/simple-mock/index');
const stubbedEnvironmentMaker = require('../environments/stubbed-environment-maker');

/**
 * Creates simulated CouchDB document validation function environments for use in tests.
 *
 * @param {string} validationFunctionString The raw string contents of the validation function
 * @param {string} [validationFunctionFile] The optional path to the validation function file, to be used to generate
 *                                          stack traces when errors occur
 *
 * @returns {Object} The simulated environment that was created for the validation function
 */
exports.create = function(validationFunctionString, validationFunctionFile) {
  // If the given file path is relative, it will be interpreted as relative to the process' current working directory.
  // On the other hand, if it's already absolute, it will remain unchanged.
  const absoluteValidationFuncFilePath =
    validationFunctionFile ? path.resolve(process.cwd(), validationFunctionFile) : validationFunctionFile;

  const envFunction = stubbedEnvironmentMaker.create(
    path.resolve(__dirname, '../../templates/environments/test-environment-template.js'),
    '$VALIDATION_FUNC_PLACEHOLDER$',
    validationFunctionString,
    absoluteValidationFuncFilePath);

  return envFunction(simpleMock);
};
