/**
 * Parses the given document definitions string as JavaScript and creates a stubbed environment where the global CouchDB functions and
 * variables (e.g. doc, oldDoc, simpleTypeFilter, toJSON) are simple stubs.
 *
 * @param {string} docDefinitionsString The document definitions as a string
 * @param {string} [originalFilename] The optional name/path of the file from which the document definitions were read. To be used in
 *                                    stack traces.
 *
 * @returns A JavaScript object that exposes the document definitions via the "documentDefinitions" property along with the stubbed global
 *          dependencies via properties that match their names (e.g. "doc", "oldDoc", "typeIdValidator", "simpleTypeFilter")
 */
exports.init = init;

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const simpleMock = require('../../lib/simple-mock/index');

function init(docDefinitionsString, originalFilename) {
  const options = {
    filename: originalFilename,
    displayErrors: true
  };

  const filePath = path.resolve(__dirname, '../../templates/environments/validation-environment-template.js');
  const envTemplateString = fs.readFileSync(filePath, 'utf8').trim();

  // The validation environment includes a placeholder string called "$DOC_DEFINITIONS_PLACEHOLDER$" that is to be replaced with the
  // contents of the document definitions
  const envString = envTemplateString.replace('$DOC_DEFINITIONS_PLACEHOLDER$', () => docDefinitionsString);

  // The code that is compiled must be an expression or a sequence of one or more statements. Surrounding it with parentheses makes it a
  // valid statement.
  const envStatement = `(${envString});`;

  // Compile the document definitions environment function within the current virtual machine context so it can share access to the
  // "isArray", "toJSON", etc. stubs
  const envFunction = vm.runInThisContext(envStatement, options);

  return envFunction(simpleMock);
}
