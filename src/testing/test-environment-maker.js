/**
 * Creates simulated CouchDB document validation function environments for use in tests.
 *
 * @param {string} rawValidationFunction The raw string contents of the validation function
 * @param {string} [validationFunctionFile] The optional path to the validation function file, to be used to generate stack traces when errors occur
 *
 * @returns {Object} The simulated environment created for the validation function
 */
exports.init = init;

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const simpleMock = require('../../lib/simple-mock/index');

function init(rawValidationFunction, validationFunctionFile) {
  const options = {
    filename: validationFunctionFile,
    displayErrors: true
  };

  const filePath = path.resolve(__dirname, '../../templates/environments/test-environment-template.js');
  const environmentTemplate = fs.readFileSync(filePath, 'utf8').trim();

  // The test environment includes a placeholder string called "$VALIDATION_FUNC_PLACEHOLDER$" that is to be replaced with the contents of
  // the validation function
  const environmentString = environmentTemplate.replace('$VALIDATION_FUNC_PLACEHOLDER$', () => rawValidationFunction);

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with parentheses makes it a
  // valid statement.
  const environmentStatement = `(${environmentString});`;

  // Compile the test environment function within the current virtual machine context so it can share access to the "isArray", "toJSON",
  // etc. stubs with the test-fixture-maker module
  const environmentFunction = vm.runInThisContext(environmentStatement, options);

  return environmentFunction(simpleMock);
}
