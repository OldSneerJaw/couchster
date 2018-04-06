/**
 * Saves the validation function to the specified file. Recursively creates the parent directory as needed.
 *
 * @param {string} filePath The path at which to write the validation function file
 * @param {string} validationFunctionString The full contents of the validation function
 * @param {Object} [formatOptions] Controls how the validation function is formatted. Options:
 *                                 - jsonString: Boolean indicating whether to return the result enclosed in a JSON-compatible string
 *
 * @throws if the output directory could not be created or the file could not be created/overwritten (e.g. access denied)
 */
exports.save = save;

const fs = require('fs');
const path = require('path');
const mkdirp = require('../../lib/mkdirp/index');

function save(filePath, validationFunctionString, formatOptions = { }) {
  const outputDirectory = path.dirname(filePath);
  if (!fs.existsSync(outputDirectory)) {
    mkdirp.sync(outputDirectory);
  }

  const formattedValidationFunction = formatValidationFunction(validationFunctionString, formatOptions);

  fs.writeFileSync(filePath, formattedValidationFunction, 'utf8');
}

function formatValidationFunction(validationFunctionString, formatOptions) {
  // Normalize line endings
  const normalizedValidationFuncString = validationFunctionString.replace(/(?:\r\n)|(?:\r)/g, () => '\n');

  if (formatOptions.jsonString) {
    // Escape all escape sequences, backslash characters and line ending characters then wrap the result in quotes to
    // make it a valid JSON string
    const formattedValidationFuncString = normalizedValidationFuncString.replace(/\\/g, () => '\\\\')
      .replace(/"/g, () => '\\"')
      .replace(/\n/g, () => '\\n');

    return `"${formattedValidationFuncString}"`;
  } else {
    return normalizedValidationFuncString;
  }
}
