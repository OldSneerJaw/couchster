/**
 * Generates a complete document validation function from the specified document definitions file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 *
 * @returns The full contents of the generated validation function as a string
 */
exports.load = loadFromFile;

const fs = require('fs');
const path = require('path');
const indent = require('../../lib/indent.js/indent.min');
const docDefinitionsLoader = require('./document-definitions-loader');
const fileFragmentLoader = require('./file-fragment-loader');

function loadFromFile(docDefinitionsFile) {
  const validationFuncTemplateDir = path.resolve(__dirname, '../../templates/validation-function');

  const validationFuncTemplatePath = path.resolve(validationFuncTemplateDir, 'template.js');
  let validationFuncTemplate;
  try {
    validationFuncTemplate = fs.readFileSync(validationFuncTemplatePath, 'utf8');
  } catch (ex) {
    console.error(`ERROR: Unable to read the validation function template file: ${ex}`);

    throw ex;
  }

  // Automatically replace each instance of the "importValidationFunctionFragment" macro with the contents of the file that is specified
  validationFuncTemplate = fileFragmentLoader.load(validationFuncTemplateDir, 'importValidationFunctionFragment', validationFuncTemplate);

  const docDefinitions = docDefinitionsLoader.load(docDefinitionsFile);

  // Load the document definitions into the validation function template
  const validationFunc = validationFuncTemplate.replace('%DOCUMENT_DEFINITIONS%', () => docDefinitions);

  // Normalize code block indentation, normalize line endings and then replace blank lines with empty lines
  return indent.js(validationFunc, { tabString: '  ' })
    .replace(/(?:\r\n)|(?:\r)/g, () => '\n')
    .replace(/^\s+$/gm, () => '');
}
