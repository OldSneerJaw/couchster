/**
 * Generates a complete document validation function from the specified document definitions file.
 *
 * @param {string} docDefinitionsFile The path to the document definitions file
 * @param {Object} formatOptions Controls how the validation function is formatted. Options:
 *                               - jsonString: Whether to return the result as a JSON-compatible string
 *
 * @returns The full contents of the generated validation function as a string
 */
exports.load = loadFromFile;

const fs = require('fs');
const path = require('path');
const indent = require('../../lib/indent.js/indent.min');
const docDefinitionsLoader = require('./document-definitions-loader');
const fileFragmentLoader = require('./file-fragment-loader');

function loadFromFile(docDefinitionsFile, formatOptions) {
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
  const rawValidationFuncString = validationFuncTemplate.replace('$DOCUMENT_DEFINITIONS$', () => docDefinitions);

  return formatValidationFunction(rawValidationFuncString, formatOptions || { });
}

function formatValidationFunction(rawValidationFuncString, formatOptions) {
  // Normalize code block indentation, normalize line endings and then replace blank lines with empty lines
  const normalizedFuncString = indent.js(rawValidationFuncString, { tabString: '  ' })
    .replace(/(?:\r\n)|(?:\r)/g, () => '\n')
    .replace(/^\s+$/gm, () => '');

  if (formatOptions.jsonString) {
    // Escape all escape sequences, backslash characters and line ending characters then wrap the result in quotes to
    // make it a valid JSON string
    const formattedFuncString = normalizedFuncString.replace(/\\/g, () => '\\\\')
      .replace(/"/g, () => '\\"')
      .replace(/\n/g, () => `\\n`);

    return `"${formattedFuncString}"`;
  } else {
    return normalizedFuncString;
  }
}
